package com.example.aitraining.service;

import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class ImageBuildServiceTest {

  @Test
  void imageTagIsDerivedFromProjectId() {
    UUID id = UUID.fromString("11111111-2222-3333-4444-555555555555");
    assertThat(ImageBuildService.imageTag(id)).isEqualTo("project-11111111-2222-3333-4444-555555555555");
  }

  @Test
  void dockerfileBuildsFromConfiguredBaseImageAndBakesDeps() {
    String dockerfile = ImageBuildService.dockerfile("python:3.11-slim");
    assertThat(dockerfile)
        .startsWith("FROM python:3.11-slim")
        .contains("COPY . /source")
        .contains("pip install --no-cache-dir -r requirements.txt")
        .contains("pip install --no-cache-dir .");
  }
}
