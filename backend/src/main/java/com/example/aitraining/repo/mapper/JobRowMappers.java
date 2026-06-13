package com.example.aitraining.repo.mapper;

import com.example.aitraining.domain.Enums.JobStatus;
import com.example.aitraining.domain.Models.TrainingJob;
import com.example.aitraining.dto.JobDtos.ProgressResponse;
import com.example.aitraining.dto.JobDtos.QueueItem;
import org.springframework.jdbc.core.RowMapper;

import java.util.UUID;

public final class JobRowMappers {
    private JobRowMappers() {
    }

    public static final RowMapper<TrainingJob> JOB = (rs, rowNum) -> new TrainingJob(
            rs.getObject("job_id", UUID.class),
            rs.getObject("project_id", UUID.class),
            rs.getObject("triggered_by_user_id", UUID.class),
            rs.getObject("config_snapshot_id", UUID.class),
            rs.getObject("retry_of_job_id", UUID.class),
            JobStatus.valueOf(rs.getString("status")),
            rs.getInt("retry_attempt"),
            (Integer) rs.getObject("queue_position"),
            rs.getTimestamp("queued_at") == null ? null : rs.getTimestamp("queued_at").toInstant(),
            rs.getTimestamp("started_at") == null ? null : rs.getTimestamp("started_at").toInstant(),
            rs.getTimestamp("ended_at") == null ? null : rs.getTimestamp("ended_at").toInstant(),
            rs.getString("failure_reason"),
            rs.getTimestamp("created_at").toInstant());

    public static final RowMapper<QueueItem> QUEUE_ITEM = (rs, rowNum) -> new QueueItem(
            rs.getObject("job_id", UUID.class),
            rs.getString("project_name"),
            JobStatus.valueOf(rs.getString("status")),
            (Integer) rs.getObject("queue_position"),
            rs.getTimestamp("enqueued_at").toInstant());

    public static final RowMapper<ProgressResponse> PROGRESS = (rs, rowNum) -> new ProgressResponse(
            true,
            rs.getInt("progress_value"),
            (Integer) rs.getObject("epoch"),
            (Integer) rs.getObject("total_epoch"),
            rs.getTimestamp("emitted_at").toInstant());
}
