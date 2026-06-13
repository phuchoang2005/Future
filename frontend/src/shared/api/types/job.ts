import type { UserSummary } from "./user";

export type JobStatus = "CREATED" | "QUEUED" | "RUNNING" | "RETRYING" | "SUCCESS" | "FAILED" | "CANCELLED";
export type StreamType = "STDOUT" | "STDERR";
export type ArtifactType = "MODEL" | "METRICS" | "LOG" | "OTHER";

export type ProgressResponse = {
  available: boolean;
  value?: number;
  epoch?: number;
  totalEpoch?: number;
  updatedAt?: string;
};

export type JobDetail = {
  jobId: string;
  projectId: string;
  projectName: string;
  triggeredBy: UserSummary;
  status: JobStatus;
  queuePosition?: number;
  progress: ProgressResponse;
  retryOfJobId?: string;
  retryAttempt: number;
  createdAt: string;
  queuedAt?: string;
  startedAt?: string;
  endedAt?: string;
  failureReason?: string;
};

export type LogEvent = {
  logEventId: string;
  sequenceNo: number;
  streamType: StreamType;
  message: string;
  emittedAt: string;
};
