package com.example.aitraining.dto;

import com.example.aitraining.domain.Enums.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public final class SupportDtos {
    private SupportDtos() {
    }

    public record LogEventResponse(UUID logEventId, int sequenceNo, StreamType streamType, String message,
                                   Instant emittedAt) {
    }

    public record LogEventPage(List<LogEventResponse> data, CommonDtos.Page page) {
    }

    public record ArtifactResponse(UUID artifactId, String artifactName, ArtifactType artifactType,
                                   long fileSizeBytes, String checksum, Instant createdAt) {
    }

    public record ArtifactListResponse(List<ArtifactResponse> data) {
    }

    public record NotificationResponse(UUID notificationId, UUID jobId, String type, NotificationChannel channel,
                                       NotificationStatus status, String message, Instant createdAt) {
    }

    public record NotificationPage(List<NotificationResponse> data, CommonDtos.Page page) {
    }

    public record NotificationStatusResponse(UUID notificationId, NotificationStatus status) {
    }

    public record AuditLogResponse(UUID auditId, CommonDtos.UserSummary actor, UUID projectId, UUID jobId,
                                   String action, String resourceType, String resourceId,
                                   Map<String, Object> metadata, Instant createdAt) {
    }

    public record AuditLogPage(List<AuditLogResponse> data, CommonDtos.Page page) {
    }
}
