import type { AuditLog, Notification } from "../../shared/api/types";
import { currentUser, users } from "./users";
import { iso } from "./time";

export const notifications: Notification[] = [
  { notificationId: "n-1", jobId: "j-10245", type: "JOB_RUNNING", channel: "IN_APP", status: "UNREAD", message: "Fraud Detection is training at epoch 14 of 24.", createdAt: iso(1) },
  { notificationId: "n-2", jobId: "j-10190", type: "JOB_SUCCESS", channel: "IN_APP", status: "READ", message: "Vision Classifier finished successfully. Artifacts are ready.", createdAt: iso(360) },
  { notificationId: "n-3", jobId: "j-10003", type: "JOB_FAILED", channel: "EMAIL", status: "DELIVERY_FAILED", message: "Churn Forecast failed and email delivery needs review.", createdAt: iso(1440) },
];

export const audit: AuditLog[] = [
  { auditId: "au-1", actor: users[1], action: "USER_STATUS_UPDATED", resourceType: "USER", resourceId: "u-300", createdAt: iso(12) },
  { auditId: "au-2", actor: currentUser, projectId: "p-fraud", jobId: "j-10245", action: "JOB_STARTED", resourceType: "JOB", resourceId: "j-10245", createdAt: iso(28) },
];
