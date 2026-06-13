package com.example.aitraining.repo.mapper;

import com.example.aitraining.domain.Enums.*;
import com.example.aitraining.dto.CommonDtos.UserSummary;
import com.example.aitraining.dto.SupportDtos.*;
import org.springframework.jdbc.core.RowMapper;

import java.util.Map;
import java.util.UUID;

public final class SupportRowMappers {
    private SupportRowMappers() {
    }

    public static final RowMapper<LogEventResponse> LOG = (rs, rowNum) -> new LogEventResponse(
            rs.getObject("log_event_id", UUID.class),
            rs.getInt("sequence_no"),
            StreamType.valueOf(rs.getString("stream_type")),
            rs.getString("message"),
            rs.getTimestamp("emitted_at").toInstant());

    public static final RowMapper<ArtifactResponse> ARTIFACT = (rs, rowNum) -> new ArtifactResponse(
            rs.getObject("artifact_id", UUID.class),
            rs.getString("artifact_name"),
            ArtifactType.valueOf(rs.getString("artifact_type")),
            rs.getLong("file_size_bytes"),
            rs.getString("checksum"),
            rs.getTimestamp("created_at").toInstant());

    public static final RowMapper<NotificationResponse> NOTIFICATION = (rs, rowNum) -> new NotificationResponse(
            rs.getObject("notification_id", UUID.class),
            rs.getObject("job_id", UUID.class),
            rs.getString("type"),
            NotificationChannel.valueOf(rs.getString("channel")),
            NotificationStatus.valueOf(rs.getString("status")),
            rs.getString("message"),
            rs.getTimestamp("created_at").toInstant());

    public static final RowMapper<NotificationStatusResponse> NOTIFICATION_STATUS = (rs, rowNum) ->
            new NotificationStatusResponse(
                    rs.getObject("notification_id", UUID.class),
                    NotificationStatus.valueOf(rs.getString("status")));

    public static final RowMapper<AuditLogResponse> AUDIT = (rs, rowNum) -> new AuditLogResponse(
            rs.getObject("audit_id", UUID.class),
            new UserSummary(rs.getObject("actor_user_id", UUID.class), rs.getString("email"), rs.getString("full_name")),
            rs.getObject("project_id", UUID.class),
            rs.getObject("job_id", UUID.class),
            rs.getString("action"),
            rs.getString("resource_type"),
            rs.getString("resource_id"),
            Map.of(),
            rs.getTimestamp("created_at").toInstant());
}
