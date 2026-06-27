package com.phuchoang2005.aitraining.repo;

import com.phuchoang2005.aitraining.domain.Enums.SourceType;
import com.phuchoang2005.aitraining.domain.Models.Project;
import com.phuchoang2005.aitraining.domain.Models.ProjectConfig;
import com.phuchoang2005.aitraining.domain.Models.TrainingJob;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * <b>Repository Pattern</b> — all persistence operations for {@link Project} documents in
 * the {@code projects} collection.
 *
 * <p>{@link #delete} performs a cascading delete: it removes all training jobs, queue entries,
 * log events, progress events, config snapshots, and artifacts associated with the project
 * before removing the project itself.  This is intentionally not transactional (MongoDB
 * single-document atomicity only); partial deletes are possible if the server crashes mid-way,
 * but they are benign orphans that do not affect correctness.
 */
@Repository
public class ProjectRepository {
  private final MongoTemplate mongo;

  public ProjectRepository(MongoTemplate mongo) {
    this.mongo = mongo;
  }

  /**
   * Creates a new project with status {@code ACTIVE} and {@code buildStatus = "BUILDING"}, then
   * inserts it into MongoDB. The per-project Docker image is built asynchronously after creation;
   * callers transition the build state via {@link #markBuilt} / {@link #markBuildFailed}.
   *
   * @param repositoryUrl remote Git URL; {@code null} for ZIP-source projects
   * @param localPath     relative path under {@code app.storage-root}; {@code null} for GitHub projects
   */
  public Project create(UUID ownerId, String name, String description, SourceType sourceType,
      String repositoryUrl, String localPath, String entrypoint) {
    Instant now = Instant.now();
    Project project = new Project(UUID.randomUUID(), ownerId, name, description, sourceType, repositoryUrl,
        localPath, entrypoint, "ACTIVE", "BUILDING", null, now, now);
    return mongo.insert(project);
  }

  /** Marks a project's image build as succeeded, storing the build log. */
  public void markBuilt(UUID projectId, String buildLog) {
    setBuildState(projectId, "READY", buildLog);
  }

  /** Marks a project's image build as failed, storing the build log for inspection. */
  public void markBuildFailed(UUID projectId, String buildLog) {
    setBuildState(projectId, "FAILED", buildLog);
  }

  private void setBuildState(UUID projectId, String buildStatus, String buildLog) {
    mongo.updateFirst(Query.query(Criteria.where("_id").is(projectId)),
        new org.springframework.data.mongodb.core.query.Update()
            .set("buildStatus", buildStatus)
            .set("buildLog", buildLog)
            .set("updatedAt", Instant.now()),
        Project.class);
  }

  /** Returns projects whose image build is still {@code "BUILDING"} (used for startup reconciliation). */
  public List<Project> findByBuildStatus(String buildStatus) {
    return mongo.find(Query.query(Criteria.where("buildStatus").is(buildStatus)), Project.class);
  }

  /**
   * Loads a project by ID.
   *
   * @throws org.springframework.dao.EmptyResultDataAccessException if not found
   */
  public Project get(UUID projectId) {
    Project project = mongo.findById(projectId, Project.class);
    if (project == null) {
      throw new EmptyResultDataAccessException(1);
    }
    return project;
  }

  /**
   * Lists projects visible to a user, sorted newest-first with optional name filter.
   *
   * @param userId the caller's user ID (used for ownership filter when {@code admin=false})
   * @param admin  when {@code true} all projects are returned; when {@code false} only owned ones
   * @param query  optional case-insensitive substring filter on {@code projectName}; {@code null} skips filtering
   * @param limit  maximum number of results
   */
  public List<Project> listVisible(UUID userId, boolean admin, String query, int limit) {
    Criteria criteria = new Criteria();
    if (!admin) {
      criteria.and("ownerUserId").is(userId);
    }
    if (query != null && !query.isBlank()) {
      criteria.and("projectName").regex(Pattern.quote(query), "i");
    }
    Query mongoQuery = Query.query(criteria)
        .with(Sort.by(Sort.Direction.DESC, "createdAt"))
        .limit(limit);
    return mongo.find(mongoQuery, Project.class);
  }

  public void delete(UUID projectId) {
    List<TrainingJob> jobs = mongo.find(Query.query(Criteria.where("projectId").is(projectId)), TrainingJob.class);
    List<String> jobIds = jobs.stream().map(job -> job.jobId().toString()).toList();
    if (!jobIds.isEmpty()) {
      Query byJob = Query.query(Criteria.where("jobId").in(jobIds));
      mongo.remove(byJob, "job_queue_entries");
      mongo.remove(byJob, "job_log_events");
      mongo.remove(byJob, "job_progress_events");
      // Artifact documents carry only jobId (no projectId), so they must be removed by jobId.
      mongo.remove(byJob, "artifacts");
    }
    mongo.remove(Query.query(Criteria.where("projectId").is(projectId)), TrainingJob.class);
    mongo.remove(Query.query(Criteria.where("projectId").is(projectId)), ProjectConfig.class);
    mongo.remove(Query.query(Criteria.where("projectId").is(projectId.toString())), "config_snapshots");
    mongo.remove(Query.query(Criteria.where("_id").is(projectId)), Project.class);
  }
}
