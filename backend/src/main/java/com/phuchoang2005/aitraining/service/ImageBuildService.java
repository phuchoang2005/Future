package com.phuchoang2005.aitraining.service;

import com.phuchoang2005.aitraining.config.AppProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * Builds a per-project Docker image when a project is registered.
 *
 * <p>Training images such as {@code python:3.11-slim} ship with {@code pip} but none of a
 * project's third-party packages, so an entrypoint like {@code python main.py} fails with
 * {@code ModuleNotFoundError}. Rather than installing dependencies on every job run, each project
 * gets its own image — tagged {@link #imageTag(UUID) project-&#123;projectId&#125;} — generated from
 * the configured base image with the project's dependencies <em>baked in</em>. Every job for that
 * project then runs on the prebuilt image, so startup is fast and reproducible.
 *
 * <p>The image is built synchronously at registration time. The full {@code docker build} log is
 * captured and returned (on both success and failure) so it can be surfaced to the UI.
 *
 * @see com.phuchoang2005.aitraining.runner.DockerTrainingRunner  consumer of the built image
 */
@Service
public class ImageBuildService {
  private static final Logger log = LoggerFactory.getLogger(ImageBuildService.class);

  private final AppProperties props;

  public ImageBuildService(AppProperties props) {
    this.props = props;
  }

  /** Outcome of a {@code docker build}: whether it succeeded and the combined build log. */
  public record BuildResult(boolean success, String log) {}

  /** The image tag used for a project's prebuilt training image. */
  public static String imageTag(UUID projectId) {
    return "project-" + projectId;
  }

  /** Docker label applied to every job container so a project's containers are discoverable. */
  public static String projectLabel(UUID projectId) {
    return "ai-training.project=" + projectId;
  }

  /**
   * Removes all Docker resources associated with a project: any of its job containers (running or
   * stopped, matched by the {@link #projectLabel} label) and its prebuilt {@link #imageTag} image.
   *
   * <p>Best-effort and non-fatal — Docker not running, or resources already gone, is fine. Called
   * when a project is deleted so images/containers do not leak.
   *
   * @return a short human-readable summary of what was removed (for audit/logging)
   */
  public String cleanupProject(UUID projectId) {
    String containers = removeProjectContainers(projectId);
    boolean imageRemoved = removeImage(imageTag(projectId));
    String summary = "containers[" + containers + "] image[" + (imageRemoved ? "removed" : "absent") + "]";
    log.info("Docker cleanup for project {}: {}", projectId, summary);
    return summary;
  }

  /** Force-removes containers carrying this project's label; returns their ids (or "none"). */
  private String removeProjectContainers(UUID projectId) {
    try {
      Process list = new ProcessBuilder("docker", "ps", "-aq", "--filter", "label=" + projectLabel(projectId))
          .redirectErrorStream(true).start();
      String ids = new String(list.getInputStream().readAllBytes()).strip();
      list.waitFor();
      if (ids.isEmpty()) {
        return "none";
      }
      List<String> rm = new java.util.ArrayList<>(List.of("docker", "rm", "-f"));
      rm.addAll(List.of(ids.split("\\R")));
      Process p = new ProcessBuilder(rm).redirectErrorStream(true).start();
      p.getInputStream().readAllBytes();
      p.waitFor();
      return ids.replace("\n", ",");
    } catch (IOException | InterruptedException e) {
      if (e instanceof InterruptedException) {
        Thread.currentThread().interrupt();
      }
      log.warn("Could not remove containers for project {}: {}", projectId, e.getMessage());
      return "error";
    }
  }

  /** Force-removes a local image by tag; returns {@code true} if the remove command succeeded. */
  private boolean removeImage(String tag) {
    try {
      Process p = new ProcessBuilder("docker", "image", "rm", "-f", tag).redirectErrorStream(true).start();
      p.getInputStream().readAllBytes();
      return p.waitFor() == 0;
    } catch (IOException | InterruptedException e) {
      if (e instanceof InterruptedException) {
        Thread.currentThread().interrupt();
      }
      log.warn("Could not remove image {}: {}", tag, e.getMessage());
      return false;
    }
  }

  /**
   * Generates the Dockerfile that bakes a project's Python dependencies into the image.
   *
   * <p>Pure function (no I/O) so it can be unit-tested. Installs from {@code requirements.txt} when
   * present, else from {@code pyproject.toml}; a project with neither still yields a runnable image.
   *
   * @param baseImage the base image to build {@code FROM} (e.g. {@code python:3.11-slim})
   */
  static String dockerfile(String baseImage) {
    return """
        FROM %s
        WORKDIR /source
        COPY . /source
        RUN if [ -f requirements.txt ]; then pip install --no-cache-dir -r requirements.txt; \
        elif [ -f pyproject.toml ]; then pip install --no-cache-dir .; fi
        """.formatted(baseImage);
  }

  /**
   * Builds the {@code project-&#123;projectId&#125;} image from the given source directory.
   *
   * <p>The Dockerfile is generated into a temp file and supplied via {@code -f}; {@code contextDir}
   * is the build context, so {@code COPY . /source} captures the project's source tree. The build
   * is bounded by {@code app.docker.build-timeout-seconds}; on timeout the process is destroyed and
   * a failed {@link BuildResult} is returned.
   *
   * @param projectId  project whose image is being built; determines the tag
   * @param contextDir directory containing the project source (the build context)
   * @return the build outcome and combined stdout/stderr log
   */
  public BuildResult build(UUID projectId, Path contextDir) {
    String tag = imageTag(projectId);
    Path dockerfile = null;
    try {
      dockerfile = Files.createTempFile("Dockerfile-" + projectId + "-", "");
      Files.writeString(dockerfile, dockerfile(props.docker().image()));

      List<String> cmd = List.of("docker", "build", "-f", dockerfile.toAbsolutePath().toString(),
          "-t", tag, contextDir.toAbsolutePath().toString());
      log.info("Building image {} for project {}: {}", tag, projectId, String.join(" ", cmd));

      Process process = new ProcessBuilder(cmd).redirectErrorStream(true).start();
      String output = new String(process.getInputStream().readAllBytes());

      if (!process.waitFor(props.docker().buildTimeoutSeconds(), TimeUnit.SECONDS)) {
        process.destroyForcibly();
        return new BuildResult(false, output
            + "\n>>> [build] timed out after " + props.docker().buildTimeoutSeconds() + "s");
      }
      boolean success = process.exitValue() == 0;
      if (!success) {
        log.warn("Image build failed for project {} (exit {})", projectId, process.exitValue());
      }
      return new BuildResult(success, output);
    } catch (IOException | InterruptedException e) {
      if (e instanceof InterruptedException) {
        Thread.currentThread().interrupt();
      }
      log.error("Image build errored for project {}: {}", projectId, e.getMessage());
      return new BuildResult(false, "Image build could not be started: " + e.getMessage());
    } finally {
      if (dockerfile != null) {
        try {
          Files.deleteIfExists(dockerfile);
        } catch (IOException ignored) {
          // best-effort cleanup of the temp Dockerfile
        }
      }
    }
  }
}
