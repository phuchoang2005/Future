package com.example.aitraining.repo;

import com.example.aitraining.domain.Enums.*;
import com.example.aitraining.dto.CommonDtos.*;
import com.example.aitraining.dto.UserDtos.*;
import com.example.aitraining.dto.ProjectDtos.*;
import com.example.aitraining.dto.JobDtos.*;
import com.example.aitraining.dto.SupportDtos.*;
import com.example.aitraining.repo.mapper.SupportRowMappers;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public class SupportRepository {
    private final JdbcTemplate jdbc;

    public SupportRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void audit(UUID actorId, UUID projectId, UUID jobId, String action, String resourceType, String resourceId) {
        jdbc.update("""
                INSERT INTO audit_logs (actor_user_id, project_id, job_id, action, resource_type, resource_id)
                VALUES (?, ?, ?, ?, ?, ?)
                """, actorId, projectId, jobId, action, resourceType, resourceId);
    }

    public List<LogEventResponse> logs(UUID jobId, int limit) {
        return jdbc.query("""
                SELECT * FROM job_log_events WHERE job_id = ? ORDER BY sequence_no LIMIT ?
                """, SupportRowMappers.LOG, jobId, limit);
    }

    public List<ArtifactResponse> artifacts(UUID jobId) {
        return jdbc.query("""
                SELECT * FROM artifacts WHERE job_id = ? ORDER BY created_at DESC
                """, SupportRowMappers.ARTIFACT, jobId);
    }

    public String artifactPath(UUID artifactId) {
        return jdbc.queryForObject("SELECT file_path FROM artifacts WHERE artifact_id = ?", String.class, artifactId);
    }

    public UUID artifactJobId(UUID artifactId) {
        return jdbc.queryForObject("SELECT job_id FROM artifacts WHERE artifact_id = ?", UUID.class, artifactId);
    }

    public List<NotificationResponse> notifications(UUID userId, NotificationStatus status, int limit) {
        if (status == null) {
            return jdbc.query("""
                    SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?
                    """, SupportRowMappers.NOTIFICATION, userId, limit);
        }
        return jdbc.query("""
                SELECT * FROM notifications WHERE user_id = ? AND status = ?::notification_status
                ORDER BY created_at DESC LIMIT ?
                """, SupportRowMappers.NOTIFICATION, userId, status.name(), limit);
    }

    public NotificationStatusResponse markRead(UUID notificationId, UUID userId) {
        return jdbc.queryForObject("""
                UPDATE notifications SET status = 'READ'
                WHERE notification_id = ? AND user_id = ? RETURNING notification_id, status
                """, SupportRowMappers.NOTIFICATION_STATUS, notificationId, userId);
    }

    public List<AuditLogResponse> auditLogs(boolean admin, UUID actorId, int limit) {
        String sql = admin
                ? "SELECT a.*, u.email, u.full_name FROM audit_logs a LEFT JOIN users u ON u.user_id = a.actor_user_id ORDER BY a.created_at DESC LIMIT ?"
                : "SELECT a.*, u.email, u.full_name FROM audit_logs a LEFT JOIN users u ON u.user_id = a.actor_user_id WHERE a.actor_user_id = ? ORDER BY a.created_at DESC LIMIT ?";
        Object[] args = admin ? new Object[]{limit} : new Object[]{actorId, limit};
        return jdbc.query(sql, SupportRowMappers.AUDIT, args);
    }
}
