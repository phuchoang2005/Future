import { Activity, AlertTriangle, Check, Clock, RefreshCcw, Square } from "lucide-react";
import type { JobStatus } from "../api/types";
import { statusLabel } from "../format/formatters";
import { StatusDot } from "./Feedback";

const statusIcons = {
  SUCCESS: Check,
  FAILED: AlertTriangle,
  RUNNING: Activity,
  QUEUED: Clock,
  CREATED: Clock,
  RETRYING: RefreshCcw,
  CANCELLED: Square,
} satisfies Record<JobStatus, typeof Check>;

export function StatusBadge({ status, large = false }: { status: JobStatus; large?: boolean }) {
  const Icon = statusIcons[status];
  return (
    <span className={`status-badge ${status.toLowerCase()} ${large ? "large" : ""}`}>
      <Icon size={large ? 18 : 14} /> {statusLabel(status)}
    </span>
  );
}

export function ConnectionBadge({ state }: { state: string }) {
  const tone = state === "CONNECTED" ? "success" : state === "DISCONNECTED" ? "danger" : "warning";
  return (
    <span className={`connection ${state.toLowerCase().replace(" ", "-")}`}>
      <StatusDot tone={tone} />{state}
    </span>
  );
}
