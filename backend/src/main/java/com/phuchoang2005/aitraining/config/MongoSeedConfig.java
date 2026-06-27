package com.phuchoang2005.aitraining.config;

import com.phuchoang2005.aitraining.domain.Enums.UserRole;
import com.phuchoang2005.aitraining.domain.Enums.UserStatus;
import com.phuchoang2005.aitraining.domain.Models.User;
import com.phuchoang2005.aitraining.repo.ConfigRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

import java.time.Instant;
import java.util.UUID;

/**
 * Ensures baseline MongoDB indexes exist and seeds the two development users on every startup.
 *
 * <p>All index creation calls are idempotent (MongoDB silently ignores duplicate index
 * definitions).  User seeding checks for existence before inserting, so the bean is safe
 * to run on every start.
 *
 * <h2>Indexes created</h2>
 * <ul>
 *   <li>{@code users.email} — unique, for bearer-token lookup.</li>
 *   <li>{@code project_configs.(projectId, configPath)} — unique compound, enforces one
 *       config per path per project.</li>
 *   <li>{@code notification_dedupe.key} — unique, prevents duplicate email delivery.</li>
 *   <li>{@code job_log_events.(jobId, sequenceNo)} — compound, for ordered log replay.</li>
 *   <li>{@code job_progress_events.(jobId, emittedAt DESC)} — compound, for latest-progress
 *       query.</li>
 * </ul>
 *
 * <h2>Seeded users</h2>
 * <ul>
 *   <li>{@code user@example.com} — role {@code USER}, UUID {@code 00000000-0000-0000-0000-000000000101}</li>
 *   <li>{@code admin@example.com} — role {@code ADMIN}, UUID {@code 00000000-0000-0000-0000-000000000201}</li>
 * </ul>
 */
@Configuration
public class MongoSeedConfig {

  /**
   * {@link ApplicationRunner} that runs once after the application context is fully started,
   * before any HTTP requests are accepted.
   */
  @Bean
  ApplicationRunner seedDatabase(MongoTemplate mongo) {
    return args -> {
      mongo.indexOps(User.class).createIndex(new Index().on("email", Direction.ASC).unique());
      mongo.indexOps("project_configs").createIndex(
          new Index().on("projectId", Direction.ASC).on("configPath", Direction.ASC).unique());
      mongo.indexOps("notification_dedupe").createIndex(new Index().on("key", Direction.ASC).unique());
      mongo.indexOps("job_log_events").createIndex(
          new Index().on("jobId", Direction.ASC).on("sequenceNo", Direction.ASC));
      mongo.indexOps("job_progress_events").createIndex(
          new Index().on("jobId", Direction.ASC).on("emittedAt", Direction.DESC));

      seedUser(mongo, "00000000-0000-0000-0000-000000000101", "user@example.com", "Development User", UserRole.USER);
      seedUser(mongo, "00000000-0000-0000-0000-000000000201", "admin@example.com", "Development Admin", UserRole.ADMIN);

      // Migrate any project_configs YAML that contains a trainingEntrypoint key — that key is
      // now a project-level concern, not a per-config concern. Replace the whole YAML with the
      // standard hyperparameter template so the config editor can render it correctly.
      mongo.updateMulti(
          Query.query(Criteria.where("yamlContent").regex("trainingEntrypoint:")),
          Update.update("yamlContent", ConfigRepository.DEFAULT_HYPERPARAMETER_YAML),
          "project_configs");

      // Migrate config_snapshots that still carry a trainingEntrypoint key — these belong to
      // WAITING jobs that haven't been dispatched yet. Replace their YAML with the default so
      // parseEntrypoint falls through to the project-level field (which is fixed below).
      mongo.updateMulti(
          Query.query(Criteria.where("yamlContent").regex("trainingEntrypoint:")),
          Update.update("yamlContent", ConfigRepository.DEFAULT_HYPERPARAMETER_YAML),
          "config_snapshots");

      // Migrate any project whose trainingEntrypoint still points at train.py (any variant).
      // README-PYTHON.md mandates python main.py as the only valid entrypoint.
      mongo.updateMulti(
          Query.query(Criteria.where("trainingEntrypoint").regex("train\\.py")),
          Update.update("trainingEntrypoint", "python main.py"),
          "projects");
    };
  }

  private void seedUser(MongoTemplate mongo, String id, String email, String fullName, UserRole role) {
    if (mongo.exists(Query.query(Criteria.where("email").is(email)), User.class)) {
      return;
    }
    mongo.insert(new User(UUID.fromString(id), email, fullName, role, UserStatus.ACTIVE, Instant.now(), null));
  }
}
