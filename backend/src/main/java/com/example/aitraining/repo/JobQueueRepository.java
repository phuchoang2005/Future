package com.example.aitraining.repo;

import com.example.aitraining.dto.JobDtos.QueueItem;
import com.example.aitraining.repo.mapper.JobRowMappers;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public class JobQueueRepository {
    private final JdbcTemplate jdbc;

    public JobQueueRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void enqueue(UUID jobId) {
        jdbc.update("INSERT INTO job_queue_entries (job_id, queue_status) VALUES (?, 'WAITING')", jobId);
        refreshPositions();
    }

    public int runningCount() {
        return jdbc.queryForObject("SELECT count(*) FROM training_jobs WHERE status = 'RUNNING'", Integer.class);
    }

    public int queuedCount() {
        return jdbc.queryForObject("SELECT count(*) FROM job_queue_entries WHERE queue_status = 'WAITING'", Integer.class);
    }

    public List<QueueItem> items() {
        return jdbc.query("""
                SELECT j.job_id, p.project_name, j.status, j.queue_position, q.enqueued_at
                FROM job_queue_entries q
                JOIN training_jobs j ON j.job_id = q.job_id
                JOIN projects p ON p.project_id = j.project_id
                WHERE q.queue_status = 'WAITING'
                ORDER BY q.enqueued_at
                """, JobRowMappers.QUEUE_ITEM);
    }

    public void refreshPositions() {
        jdbc.update("""
                WITH ranked AS (
                  SELECT job_id, row_number() OVER (ORDER BY enqueued_at)::integer AS pos
                  FROM job_queue_entries WHERE queue_status = 'WAITING'
                )
                UPDATE training_jobs j SET queue_position = ranked.pos
                FROM ranked WHERE ranked.job_id = j.job_id
                """);
    }
}
