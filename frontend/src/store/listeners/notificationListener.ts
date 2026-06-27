import { createListenerMiddleware } from "@reduxjs/toolkit";
import type { JobDetail, JobStatus } from "../../shared/api/types";
import { jobSlice, startJobAsync } from "../slices/jobSlice";
import { notificationSlice } from "../slices/supportSlices";
import type { RootState, AppDispatch } from "../store";

/**
 * Turns live job activity into in-app notifications. The job stream (`JobDetailPage`'s
 * WebSocket handler) and polling fallback already dispatch `updateJobStatus` /
 * `updateJobProgress`; this middleware observes those and the `startJobAsync` thunk,
 * then pushes notifications so the bell tracks training progress in real time.
 *
 * Replaces the previous static placeholder notifications (which have been removed).
 */
export const notificationListener = createListenerMiddleware();
const startListening = notificationListener.startListening.withTypes<RootState, AppDispatch>();

const { updateJobStatus, updateJobProgress } = jobSlice.actions;
const { pushNotification } = notificationSlice.actions;

/** Progress percentages that warrant a notification, so we don't emit on every tick. */
const MILESTONES = [25, 50, 75];

/** Human-readable label for a job, preferring its project name when known. */
function jobLabel(state: RootState, jobId: string, projectId?: string): string {
  const detail = state.jobs.detailByJobId[jobId];
  if (detail?.projectName) return detail.projectName;
  const pid = projectId ?? detail?.projectId;
  if (pid) {
    const project = state.projects.detailByProjectId[pid] ?? state.projects.items.find((p) => p.projectId === pid);
    if (project?.projectName) return project.projectName;
  }
  return `Job ${jobId}`;
}

const STATUS_MESSAGE: Partial<Record<JobStatus, (label: string, reason?: string) => string>> = {
  QUEUED: (l) => `${l} is queued for training.`,
  RUNNING: (l) => `${l} started training.`,
  RETRYING: (l) => `${l} is retrying after a failure.`,
  SUCCESS: (l) => `${l} finished successfully — artifacts are ready.`,
  FAILED: (l, reason) => `${l} failed${reason ? `: ${reason}` : "."}`,
  CANCELLED: (l) => `${l} was cancelled.`,
};

// New job submitted → queued notification.
startListening({
  actionCreator: startJobAsync.fulfilled,
  effect: (action, api) => {
    const { jobId, projectId } = action.payload;
    const label = jobLabel(api.getState(), jobId, projectId);
    api.dispatch(pushNotification({ jobId, type: "JOB_QUEUED", message: `${label} is queued for training.` }));
  },
});

// Status transition → one notification per meaningful status.
startListening({
  actionCreator: updateJobStatus,
  effect: (action, api) => {
    const { jobId, status, failureReason } = action.payload;
    const previous = api.getOriginalState().jobs.detailByJobId[jobId]?.status;
    if (status === previous) return;
    const build = STATUS_MESSAGE[status];
    if (!build) return;
    const label = jobLabel(api.getState(), jobId);
    api.dispatch(pushNotification({ jobId, type: `JOB_${status}`, message: build(label, failureReason) }));
  },
});

// Progress update → notify only when crossing a milestone (or a new epoch).
startListening({
  actionCreator: updateJobProgress,
  effect: (action, api) => {
    const { jobId, progress } = action.payload;
    if (!progress?.available) return;
    const previous = api.getOriginalState().jobs.detailByJobId[jobId]?.progress;
    const label = jobLabel(api.getState(), jobId);

    const milestone = crossedMilestone(previous?.value, progress.value);
    const epochAdvanced = progress.epoch != null && progress.epoch !== previous?.epoch;
    if (milestone == null && !epochAdvanced) return;

    api.dispatch(pushNotification({
      jobId,
      type: "JOB_PROGRESS",
      message: `${label} training — ${formatProgress(progress)}`,
    }));
  },
});

/** Highest milestone crossed moving from `prev` to `next`, or null if none. */
function crossedMilestone(prev: number | undefined, next: number | undefined): number | null {
  if (next == null) return null;
  const from = prev ?? -1;
  const crossed = MILESTONES.filter((m) => from < m && next >= m);
  return crossed.length ? crossed[crossed.length - 1] : null;
}

function formatProgress(progress: NonNullable<JobDetail["progress"]>): string {
  const percent = progress.value != null ? `${progress.value}%` : "in progress";
  if (progress.epoch != null) {
    return progress.totalEpoch != null
      ? `${percent} (epoch ${progress.epoch}/${progress.totalEpoch})`
      : `${percent} (epoch ${progress.epoch})`;
  }
  return percent;
}
