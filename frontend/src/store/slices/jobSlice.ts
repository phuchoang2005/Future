import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";
import type { Artifact, JobDetail, LogEvent, ProjectDetail, QueueSnapshot } from "../../shared/api/types";
import { mockState } from "../mock-data";

type JobsState = {
  items: JobDetail[];
  logsByJobId: Record<string, LogEvent[]>;
  artifactsByJobId: Record<string, Artifact[]>;
  queue: QueueSnapshot;
  connection: "CONNECTED" | "RECONNECTING" | "FALLBACK POLLING" | "DISCONNECTED";
};

const initialState: JobsState = {
  items: mockState.jobs,
  logsByJobId: mockState.logsByJobId,
  artifactsByJobId: mockState.artifactsByJobId,
  queue: mockState.queue,
  connection: "CONNECTED",
};

export const jobSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    startJob: { reducer: startReducer, prepare: prepareJob },
    cancelJob(state, action: PayloadAction<{ jobId: string; reason: string }>) {
      const job = state.items.find((item) => item.jobId === action.payload.jobId);
      if (job) Object.assign(job, { status: "CANCELLED", endedAt: new Date().toISOString(), failureReason: action.payload.reason || "Cancelled by user request" });
    },
    retryJob(state, action: PayloadAction<string>) {
      const original = state.items.find((item) => item.jobId === action.payload);
      if (original) state.items.unshift(retry(original));
    },
    appendLog(state, action: PayloadAction<{ jobId: string; event: LogEvent }>) {
      const lines = state.logsByJobId[action.payload.jobId] ?? [];
      if (!lines.some((line) => line.logEventId === action.payload.event.logEventId)) state.logsByJobId[action.payload.jobId] = [...lines, action.payload.event].slice(-500);
    },
    setConnection(state, action: PayloadAction<typeof state.connection>) {
      state.connection = action.payload;
    },
  },
});

function startReducer(state: JobsState, action: PayloadAction<JobDetail>) {
  state.items.unshift(action.payload);
  state.logsByJobId[action.payload.jobId] = [{ logEventId: nanoid(), sequenceNo: 1, streamType: "STDOUT", message: "Training request accepted. Immutable configuration snapshot created.", emittedAt: action.payload.createdAt }];
}

function prepareJob(project: ProjectDetail) {
  const now = new Date().toISOString();
  return { payload: { jobId: nanoid(), projectId: project.projectId, projectName: project.projectName, triggeredBy: mockState.currentUser, status: "QUEUED" as const, queuePosition: 2, progress: { available: false }, retryAttempt: 0, createdAt: now, queuedAt: now } };
}

function retry(original: JobDetail): JobDetail {
  const now = new Date().toISOString();
  return { ...original, jobId: nanoid(), status: "QUEUED", queuePosition: 1, retryOfJobId: original.jobId, retryAttempt: original.retryAttempt + 1, createdAt: now, queuedAt: now, startedAt: undefined, endedAt: undefined, failureReason: undefined, progress: { available: false } };
}
