import { useEffect, useState } from "react";
import { Square } from "lucide-react";
import { StatusBadge } from "../../shared/components/Badges";
import { Metric, MetricGrid } from "../../shared/components/Feedback";
import { Page, PageHeader } from "../../shared/components/Page";
import { formatDate } from "../../shared/format/formatters";
import { CancelJobDialog } from "../jobs/CancelJobDialog";
import { actions } from "../../store/store";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import type { JobStatus } from "../../shared/api/types";

// Backend grants admins "cancel any job" (POST /jobs/{jobId}/cancel); only non-terminal
// jobs can be cancelled, so the action is offered for these states only.
const CANCELLABLE: ReadonlySet<JobStatus> = new Set<JobStatus>(["CREATED", "QUEUED", "RUNNING", "RETRYING"]);

export function AdminQueuePage() {
  const dispatch = useAppDispatch();
  const queue = useAppSelector((state) => state.admin.queue);
  const [cancelJobId, setCancelJobId] = useState<string | null>(null);

  useEffect(() => { dispatch(actions.fetchQueue()); }, [dispatch]);

  const cancelJob = async (reason: string) => {
    const jobId = cancelJobId;
    setCancelJobId(null);
    if (!jobId) return;
    try {
      await dispatch(actions.cancelJobAsync({ jobId, reason })).unwrap();
    } finally {
      // Refresh the snapshot so positions/running counts reflect the cancellation.
      dispatch(actions.fetchQueue());
    }
  };

  return (
    <Page>
      <PageHeader title="Admin Queue" subtitle="Global capacity metrics and FIFO queue visibility without exposing source or artifact contents." />
      <MetricGrid>
        <Metric label="Running" value={`${queue.runningCount}/${queue.runningLimit}`} />
        <Metric label="Queued" value={queue.queuedCount.toString()} />
        <Metric label="Capacity" value={queue.runningCount >= queue.runningLimit ? "Busy" : "Available"} />
      </MetricGrid>
      <section className="panel">
        <h2>Queue Snapshot</h2>
        <div className="data-table admin-queue-table">
          <div className="table-head">
            <span>Job</span><span>Project</span><span>Status</span><span>Position</span><span>Enqueued</span><span>Action</span>
          </div>
          {queue.items.map((item) => (
            <div className="table-row" key={item.jobId}>
              <span>{item.jobId}</span>
              <span>{item.projectName}</span>
              <StatusBadge status={item.status} />
              <span>{item.queuePosition ?? "-"}</span>
              <span>{formatDate(item.enqueuedAt)}</span>
              <span>
                {CANCELLABLE.has(item.status) && (
                  <button className="button danger" onClick={() => setCancelJobId(item.jobId)}>
                    <Square size={15} /> Cancel
                  </button>
                )}
              </span>
            </div>
          ))}
          {queue.items.length === 0 && <div className="table-row"><span style={{ gridColumn: "1 / -1" }}>Queue is empty.</span></div>}
        </div>
      </section>
      {cancelJobId && <CancelJobDialog onClose={() => setCancelJobId(null)} onCancel={cancelJob} />}
    </Page>
  );
}
