package com.example.aitraining.runner;

import com.example.aitraining.config.AppProperties;
import com.example.aitraining.config.AppProperties.Docker;
import com.example.aitraining.config.AppProperties.Notification;
import com.example.aitraining.config.AppProperties.Queue;
import com.example.aitraining.service.ImageBuildService;
import com.example.aitraining.service.ImageBuildService.BuildResult;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

/**
 * End-to-end integration test for the core feature: <b>load and execute a Python project</b>.
 *
 * <p>Exercises the real pipeline against the bundled {@code sample-projects/iris-classifier}:
 * <ol>
 *   <li>{@link ImageBuildService} bakes the project's dependencies into a {@code project-&#123;id&#125;}
 *       image (proving numpy/scikit-learn/pyyaml install — the original {@code ModuleNotFoundError}).</li>
 *   <li>The container is launched exactly as {@link DockerTrainingRunner} would
 *       ({@link DockerTrainingRunner#assembleRunCommand}) and runs the training entrypoint.</li>
 *   <li>The job's stdout and the workspace artifacts are asserted.</li>
 * </ol>
 *
 * <p>Requires a working Docker daemon, so it is tagged {@code integration} and excluded from the
 * default {@code -Dgroups='!integration'} unit run. On macOS the workspace is created under the
 * module directory (a Colima-shared path) so the bind mount is visible inside the VM.
 */
@Tag("integration")
class TrainingExecutionIT {

  private final UUID projectId = UUID.randomUUID();
  private final String imageTag = ImageBuildService.imageTag(projectId);
  private Path workspace;

  private static AppProperties props() {
    return new AppProperties("./storage", new Queue(2),
        new Docker("python:3.11-slim", "./workspaces", "./sources", 1024L, 900L),
        new Notification(false, "noreply@localhost", "http://localhost"));
  }

  @Test
  void buildsImageWithDepsThenRunsTrainingToCompletion() throws Exception {
    Path sample = Path.of("..", "sample-projects", "iris-classifier").toAbsolutePath().normalize();
    assumeTrue(Files.isDirectory(sample), "sample-projects/iris-classifier not present");
    assumeTrue(dockerAvailable(), "Docker daemon not available");

    // 1. Build the per-project image — bakes requirements.txt deps into the image.
    BuildResult build = new ImageBuildService(props()).build(projectId, sample);
    assertThat(build.success())
        .as("docker build should succeed; log:\n%s", build.log())
        .isTrue();
    // The deps actually being baked in is proven below: the training run imports numpy/sklearn and
    // finishes — the original ModuleNotFoundError would surface here. (A cold build also logs
    // "Successfully installed", but BuildKit may serve cached layers, so we don't assert on it.)

    // 2. Prepare the workspace the runner would create (config.yaml the entrypoint reads).
    workspace = Files.createTempDirectory(Path.of("").toAbsolutePath(), "it-ws-");
    Files.copy(sample.resolve("configs/training.yaml"), workspace.resolve("config.yaml"));

    // 3. Launch the container exactly as the runner does and capture output.
    List<String> cmd = DockerTrainingRunner.assembleRunCommand(
        imageTag, projectId, UUID.randomUUID(), workspace, sample, "python main.py");
    Process p = new ProcessBuilder(cmd).redirectErrorStream(true).start();
    String output = new String(p.getInputStream().readAllBytes());
    int exit = p.waitFor();

    // 4. The project loaded its deps, trained, emitted parseable progress, and finished cleanly.
    assertThat(exit).as("training exit code; output:\n%s", output).isZero();
    assertThat(output).contains("Epoch 1/10").contains("Training complete");
    assertThat(ProgressParser.parse("Epoch 10/10 — loss: 0.08")).isPresent();
    assertThat(Files.exists(workspace.resolve("outputs/models/metrics.json")))
        .as("artifacts written to workspace").isTrue();
  }

  private static boolean dockerAvailable() {
    try {
      Process p = new ProcessBuilder("docker", "info").redirectErrorStream(true).start();
      p.getInputStream().readAllBytes();
      return p.waitFor() == 0;
    } catch (Exception e) {
      return false;
    }
  }

  @AfterEach
  void cleanup() throws Exception {
    if (workspace != null && Files.exists(workspace)) {
      try (var walk = Files.walk(workspace)) {
        walk.sorted(Comparator.reverseOrder()).forEach(path -> {
          try { Files.delete(path); } catch (Exception ignored) {}
        });
      }
    }
    new ProcessBuilder("docker", "image", "rm", "-f", imageTag)
        .redirectErrorStream(true).start().waitFor();
  }
}
