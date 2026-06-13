import type { JobDetail, JobStatus } from "../api/types";

export function formatDate(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatBytes(bytes: number) {
  if (bytes > 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes > 1_000) return `${(bytes / 1_000).toFixed(1)} KB`;
  return `${bytes} B`;
}

export function duration(job: JobDetail) {
  const start = new Date(job.startedAt ?? job.createdAt).getTime();
  const end = job.endedAt ? new Date(job.endedAt).getTime() : Date.now();
  return `${Math.max(1, Math.round((end - start) / 60_000))}m`;
}

export function statusLabel(status: JobStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}
