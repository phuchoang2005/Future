import type { JobStatus } from "./job";
import type { UserSummary } from "./user";

export type NotificationStatus = "UNREAD" | "READ" | "DELIVERY_FAILED";

export type Artifact = {
  artifactId: string;
  artifactName: string;
  artifactType: "MODEL" | "METRICS" | "LOG" | "OTHER";
  fileSizeBytes: number;
  checksum: string;
  createdAt: string;
};

export type Notification = {
  notificationId: string;
  jobId: string;
  type: string;
  channel: string;
  status: NotificationStatus;
  message: string;
  createdAt: string;
};

export type QueueItem = {
  jobId: string;
  projectName: string;
  status: JobStatus;
  queuePosition?: number;
  enqueuedAt: string;
};

export type QueueSnapshot = {
  runningCount: number;
  runningLimit: number;
  queuedCount: number;
  items: QueueItem[];
};

export type AuditLog = {
  auditId: string;
  actor: UserSummary;
  projectId?: string;
  jobId?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  createdAt: string;
};
