package com.phuchoang2005.aitraining.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.AsyncTaskExecutor;
import org.springframework.core.task.TaskExecutor;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

/**
 * Configures the {@code trainingExecutor} thread pool used by
 * {@link com.phuchoang2005.aitraining.service.JobDispatcherService} to run training jobs
 * concurrently.
 *
 * <p>Pool sizing:
 * <ul>
 *   <li>Core pool: 4 threads — always alive, ready to accept jobs.</li>
 *   <li>Max pool: 10 threads — burst capacity beyond the core pool.</li>
 *   <li>Queue: 50 tasks — bounded to prevent unbounded memory growth if the training
 *       runner backs up.</li>
 * </ul>
 * Graceful shutdown waits up to 30 seconds for in-flight jobs to complete before the
 * JVM exits.
 */
@Configuration
public class AsyncConfig {

  /**
   * Thread pool executor for training job execution.
   * Injected into {@link com.phuchoang2005.aitraining.service.JobDispatcherService} via
   * {@code @Qualifier("trainingExecutor")}.
   */
  @Bean(name = "trainingExecutor")
  public TaskExecutor trainingExecutor() {
    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    executor.setCorePoolSize(4);
    executor.setMaxPoolSize(10);
    executor.setQueueCapacity(50);
    executor.setThreadNamePrefix("training-");
    executor.setWaitForTasksToCompleteOnShutdown(true);
    executor.setAwaitTerminationSeconds(30);
    executor.initialize();
    return executor;
  }

  /**
   * Thread pool for per-project Docker image builds at registration time.
   *
   * <p>The build is run here — <em>off</em> the HTTP request thread — so that a client disconnect
   * (e.g. the user closing the browser tab while the build is in progress) cannot abort the build
   * or the project commit/cleanup that follows it. {@link com.phuchoang2005.aitraining.service.ProjectService}
   * submits the build here and waits on the {@code Future}; if that wait is interrupted because the
   * request was abandoned, the task keeps running on this pool and finalizes the project independently.
   *
   * <p>Kept small (builds are heavy and largely I/O/CPU bound on the Docker daemon) but separate from
   * {@code trainingExecutor} so registrations and running jobs never starve each other.
   *
   * <p>Graceful shutdown waits for in-flight builds so a deploy/restart never leaves a half-built image.
   */
  @Bean(name = "imageBuildExecutor")
  public AsyncTaskExecutor imageBuildExecutor() {
    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    executor.setCorePoolSize(2);
    executor.setMaxPoolSize(4);
    executor.setQueueCapacity(20);
    executor.setThreadNamePrefix("image-build-");
    executor.setWaitForTasksToCompleteOnShutdown(true);
    executor.setAwaitTerminationSeconds(120);
    executor.initialize();
    return executor;
  }
}
