import type { AuditLog, Notification } from "../../shared/api/types";
import { currentUser, users } from "./users";
import { iso } from "./time";

// Notifications are generated live from job activity (see store/listeners/notificationListener.ts),
// so there are no seeded placeholder entries — the list starts empty until a job reports progress.
export const notifications: Notification[] = [];

export const audit: AuditLog[] = [
  { auditId: "au-1", actor: users[1], action: "USER_STATUS_UPDATED", resourceType: "USER", resourceId: "u-300", createdAt: iso(12) },
  { auditId: "au-2", actor: currentUser, projectId: "p-fraud", jobId: "j-10245", action: "JOB_STARTED", resourceType: "JOB", resourceId: "j-10245", createdAt: iso(28) },
];
