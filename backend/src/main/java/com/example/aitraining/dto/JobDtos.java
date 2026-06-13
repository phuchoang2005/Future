package com.example.aitraining.dto;

import com.example.aitraining.domain.Enums.JobStatus;
import com.example.aitraining.domain.Enums.StreamType;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class JobDtos {
    private JobDtos() {
    }

    public record StartJobRequest(@NotNull UUID configId, String yamlContent) {
    }

    public record StartJobResponse(UUID jobId, UUID projectId, JobStatus status, Integer queuePosition,
                                   UUID configSnapshotId, Instant createdAt) {
    }

    public record ProgressResponse(boolean available, Integer value, Integer epoch, Integer totalEpoch,
                                   Instant updatedAt) {
    }

    public record JobDetail(UUID jobId, UUID projectId, String projectName, CommonDtos.UserSummary triggeredBy,
                            JobStatus status, Integer queuePosition, ProgressResponse progress, UUID retryOfJobId,
                            int retryAttempt, Instant createdAt, Instant queuedAt, Instant startedAt,
                            Instant endedAt, String failureReason) {
    }

    public record JobPage(List<JobDetail> data, CommonDtos.Page page) {
    }

    public record CancelJobRequest(String reason) {
    }

    public record CancelJobResponse(UUID jobId, JobStatus status, Instant endedAt) {
    }

    public record RetryJobRequest(String mode, String yamlContent) {
    }

    public record RetryJobResponse(UUID originalJobId, UUID retryJobId, JobStatus status, Integer queuePosition) {
    }

    public record QueueSnapshot(int runningCount, int runningLimit, int queuedCount, List<QueueItem> items) {
    }

    public record QueueItem(UUID jobId, String projectName, JobStatus status, Integer queuePosition,
                            Instant enqueuedAt) {
    }
}
