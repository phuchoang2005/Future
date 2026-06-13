import { RefreshCcw, Square } from "lucide-react";
import type { JobDetail } from "../../shared/api/types";

export function ActionToolbar({ job, onCancel, onRetry }: { job: JobDetail; onCancel: () => void; onRetry: () => void }) {
  const canCancel = job.status === "RUNNING" || job.status === "QUEUED";
  const canRetry = job.status === "FAILED" || job.status === "CANCELLED";

  return (
    <div className="action-toolbar">
      <button className="button danger" disabled={!canCancel} onClick={onCancel}><Square size={16} /> Cancel</button>
      <button className="button secondary" disabled={!canRetry} onClick={onRetry}><RefreshCcw size={16} /> Retry</button>
    </div>
  );
}
