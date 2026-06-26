package com.example.aitraining.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Typed configuration properties bound from {@code application.yml} under the {@code app} prefix.
 *
 * <p>Values can be overridden by environment variables following Spring Boot's relaxed-binding
 * convention (e.g. {@code APP_QUEUE_RUNNING_LIMIT=4}).  Defaults for each field are defined
 * in {@code application.yml}.
 *
 * <p>Enabled via {@code @EnableConfigurationProperties(AppProperties.class)} on
 * {@link WebConfig}.
 *
 * @param storageRoot     root directory for managed artifact storage (absolute or relative to CWD)
 * @param queue           job-queue concurrency settings
 * @param docker          Docker runner settings (image, workspace paths, disk threshold)
 * @param notification    email notification settings
 */
@ConfigurationProperties(prefix = "app")
public record AppProperties(String storageRoot, Queue queue, Docker docker, Notification notification) {

  /**
   * @param runningLimit maximum number of jobs that may be in {@code RUNNING} state simultaneously
   */
  public record Queue(int runningLimit) {}

  /**
   * @param image               base image projects are built {@code FROM}; also the fallback image
   *                            for jobs whose project image is missing
   * @param workspaceRoot       directory where per-job workspaces are created; must be writable
   * @param sourcesRoot         directory where cloned Git repositories are cached
   * @param minDiskBytes        minimum free disk space required before launching a container (bytes)
   * @param buildTimeoutSeconds maximum time a per-project {@code docker build} may run at
   *                            registration before it is aborted and registration fails
   */
  public record Docker(String image, String workspaceRoot, String sourcesRoot, long minDiskBytes,
      long buildTimeoutSeconds) {}

  /**
   * @param enabled  {@code false} to disable all notifications globally (e.g. local dev)
   * @param from     the {@code From:} address used in outgoing emails
   * @param baseUrl  public base URL of the web app, used to construct job deep-links in emails
   */
  public record Notification(boolean enabled, String from, String baseUrl) {}
}
