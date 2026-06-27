package com.phuchoang2005.aitraining.runner;

import com.phuchoang2005.aitraining.domain.Models.TrainingJob;
import org.junit.jupiter.api.Test;

import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for the load-and-execute wiring of the Docker runner: how the {@code docker run}
 * command is assembled (image, mounts, entrypoint) and how the entrypoint is resolved from the
 * config snapshot. These cover the contract the container relies on to load the project source
 * and execute the training command — without requiring Docker.
 */
class DockerTrainingRunnerTest {

  private static final UUID JOB = UUID.fromString("aaaaaaaa-0000-0000-0000-000000000001");
  private static final UUID PROJ = UUID.fromString("bbbbbbbb-0000-0000-0000-000000000002");

  @Test
  void mountsWorkspaceAndSourceAndCdsIntoSourceBeforeEntrypoint() {
    List<String> cmd = DockerTrainingRunner.assembleRunCommand(
        "project-xyz", PROJ, JOB, Path.of("/data/workspaces/job1"), Path.of("/data/sources/proj1"), "python main.py");

    assertThat(cmd).containsSubsequence("docker", "run", "--rm", "--name", "job-" + JOB);
    assertThat(cmd).containsSubsequence("--label", "ai-training.project=" + PROJ);
    assertThat(cmd).containsSubsequence("-v", "/data/workspaces/job1:/workspace");
    assertThat(cmd).containsSubsequence("-v", "/data/sources/proj1:/source:ro");
    // The project image is used, and the entrypoint runs from the mounted source root.
    assertThat(cmd).containsSubsequence("project-xyz", "sh", "-c", "cd /source && python main.py");
  }

  @Test
  void runsEntrypointDirectlyWhenNoSourceAvailable() {
    List<String> cmd = DockerTrainingRunner.assembleRunCommand(
        "python:3.11-slim", PROJ, JOB, Path.of("/ws"), null, "echo hi");

    assertThat(cmd).doesNotContain("/source:ro");
    assertThat(cmd).containsSubsequence("python:3.11-slim", "sh", "-c", "echo hi");
    assertThat(cmd).doesNotContainSequence("sh", "-c", "cd /source && echo hi");
  }

  @Test
  void entrypointFromConfigYamlOverridesProjectFallback() {
    String yaml = "trainingEntrypoint: python train.py --config config.yaml\nepochs: 10\n";
    assertThat(runner().parseEntrypoint(yaml, "python main.py"))
        .isEqualTo("python train.py --config config.yaml");
  }

  @Test
  void entrypointFallsBackToProjectWhenConfigHasNone() {
    assertThat(runner().parseEntrypoint("epochs: 10\n", "python main.py")).isEqualTo("python main.py");
  }

  @Test
  void entrypointFallsBackToNoOpWhenNothingConfigured() {
    assertThat(runner().parseEntrypoint("epochs: 10\n", null)).contains("No entrypoint configured");
  }

  /** Minimal concrete runner with null collaborators — only the pure helpers are exercised. */
  private static AbstractTrainingRunner runner() {
    return new AbstractTrainingRunner(null, null, null, null, null, null, null, null, null) {
      @Override
      protected boolean execute(TrainingJob job, Path workspace, Path sourcePath, String entrypoint) {
        return true;
      }
    };
  }
}
