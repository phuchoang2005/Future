import { useState } from "react";
import { useParams } from "react-router-dom";
import { Page, PageHeader } from "../../shared/components/Page";
import { actions } from "../../store/store";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { ErrorPage } from "../ErrorPage";
import { ActionToolbar } from "./ActionToolbar";
import { CancelJobDialog } from "./CancelJobDialog";
import { JobSidebar } from "./JobSidebar";
import { LogPanel } from "./LogPanel";

export function JobDetailPage() {
  const { jobId } = useParams();
  const dispatch = useAppDispatch();
  const job = useAppSelector((state) => state.jobs.items.find((item) => item.jobId === jobId));
  const logs = useAppSelector((state) => state.jobs.logsByJobId[jobId ?? ""] ?? []);
  const artifacts = useAppSelector((state) => state.jobs.artifactsByJobId[jobId ?? ""] ?? []);
  const connection = useAppSelector((state) => state.jobs.connection);
  const [cancelOpen, setCancelOpen] = useState(false);

  if (!job) return <ErrorPage code="404" title="Job not found" message="No authorized job was returned for this route." />;

  const cancelJob = (reason: string) => {
    dispatch(actions.cancelJob({ jobId: job.jobId, reason }));
    setCancelOpen(false);
  };

  return (
    <Page>
      <PageHeader title={`Job ${job.jobId}`} subtitle={job.projectName} action={<ActionToolbar job={job} onCancel={() => setCancelOpen(true)} onRetry={() => dispatch(actions.retryJob(job.jobId))} />} />
      <div className="job-layout"><JobSidebar job={job} artifacts={artifacts} /><LogPanel logs={logs} connection={connection} /></div>
      {cancelOpen && <CancelJobDialog onClose={() => setCancelOpen(false)} onCancel={cancelJob} />}
    </Page>
  );
}
