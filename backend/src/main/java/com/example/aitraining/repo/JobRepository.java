package com.example.aitraining.repo;

import com.example.aitraining.domain.Enums.JobStatus;
import com.example.aitraining.domain.Models.TrainingJob;
import com.example.aitraining.dto.JobDtos.ProgressResponse;
import com.example.aitraining.repo.mapper.JobRowMappers;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public class JobRepository {
    private final JdbcTemplate jdbc;

    public JobRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public TrainingJob create(UUID projectId, UUID userId, UUID snapshotId, UUID retryOfJobId, int retryAttempt) {
        return jdbc.queryForObject("""
                INSERT INTO training_jobs (project_id, triggered_by_user_id, config_snapshot_id, retry_of_job_id,
                  status, retry_attempt, queued_at)
                VALUES (?, ?, ?, ?, 'QUEUED', ?, now()) RETURNING *
                """, JobRowMappers.JOB, projectId, userId, snapshotId, retryOfJobId, retryAttempt);
    }

    public TrainingJob get(UUID jobId) {
        return jdbc.queryForObject("SELECT * FROM training_jobs WHERE job_id = ?", JobRowMappers.JOB, jobId);
    }

    public List<TrainingJob> listByProject(UUID projectId, JobStatus status, int limit) {
        if (status == null) {
            return jdbc.query("SELECT * FROM training_jobs WHERE project_id = ? ORDER BY created_at DESC LIMIT ?",
                    JobRowMappers.JOB, projectId, limit);
        }
        return jdbc.query("""
                SELECT * FROM training_jobs WHERE project_id = ? AND status = ?::job_status
                ORDER BY created_at DESC LIMIT ?
                """, JobRowMappers.JOB, projectId, status.name(), limit);
    }

    public TrainingJob cancel(UUID jobId, String reason) {
        jdbc.update("UPDATE job_queue_entries SET queue_status = 'CANCELLED' WHERE job_id = ? AND queue_status = 'WAITING'",
                jobId);
        TrainingJob job = jdbc.queryForObject("""
                UPDATE training_jobs
                SET status = 'CANCELLED', ended_at = now(), failure_reason = COALESCE(?, failure_reason)
                WHERE job_id = ? AND status IN ('QUEUED', 'RUNNING', 'CREATED')
                RETURNING *
                """, JobRowMappers.JOB, reason, jobId);
        return job;
    }

    public ProgressResponse latestProgress(UUID jobId) {
        List<ProgressResponse> rows = jdbc.query("""
                SELECT progress_value, epoch, total_epoch, emitted_at
                FROM job_progress_events WHERE job_id = ? ORDER BY emitted_at DESC LIMIT 1
                """, JobRowMappers.PROGRESS, jobId);
        return rows.isEmpty() ? new ProgressResponse(false, null, null, null, null) : rows.getFirst();
    }
}
