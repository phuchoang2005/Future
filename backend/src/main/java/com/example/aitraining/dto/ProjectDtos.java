package com.example.aitraining.dto;

import com.example.aitraining.domain.Enums.JobStatus;
import com.example.aitraining.domain.Enums.SourceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public final class ProjectDtos {
    private ProjectDtos() {
    }

    public record CreateGithubProjectRequest(@NotBlank @Size(max = 120) String projectName,
                                             @Size(max = 1000) String description,
                                             @NotBlank String repositoryUrl,
                                             @NotBlank String trainingEntrypoint) {
    }

    public record ZipProjectMetadata(@NotBlank String projectName, String description,
                                     @NotBlank String trainingEntrypoint) {
    }

    public record CreateProjectResponse(UUID projectId, String projectName, SourceType sourceType, String status,
                                        Instant createdAt) {
    }

    public record ProjectSummary(UUID projectId, String projectName, String description, SourceType sourceType,
                                 JobStatus latestJobStatus, Instant lastTrainingTime, String lastTrainingOwner) {
    }

    public record ProjectDetail(UUID projectId, String projectName, String description, SourceType sourceType,
                                JobStatus latestJobStatus, Instant lastTrainingTime, String lastTrainingOwner,
                                String repositoryUrl, String trainingEntrypoint, CommonDtos.UserSummary owner,
                                Instant createdAt, Instant updatedAt) {
    }

    public record ProjectPage(List<ProjectSummary> data, CommonDtos.Page page) {
    }

    public record ProjectConfigSummary(UUID configId, String configName, String configPath, boolean isDefault,
                                       Instant updatedAt) {
    }

    public record ProjectConfigListResponse(List<ProjectConfigSummary> data) {
    }

    public record ProjectConfigContent(UUID configId, String configPath, String yamlContent, String contentHash) {
    }

    public record ValidateYamlRequest(@NotBlank String yamlContent) {
    }

    public record ValidateYamlResponse(boolean valid, Map<String, Object> normalizedPreview, List<String> errors) {
    }
}
