import { Download } from "lucide-react";
import { StatusBadge } from "../../shared/components/Badges";
import { Banner, EmptyState, KeyValue } from "../../shared/components/Feedback";
import { formatBytes, formatDate } from "../../shared/format/formatters";
import type { Artifact, JobDetail } from "../../shared/api/types";

export function JobSidebar({ job, artifacts }: { job: JobDetail; artifacts: Artifact[] }) {
  return (
    <aside className="job-side">
      <section className="panel"><h2>Status</h2><StatusBadge status={job.status} large /><KeyValue label="Triggered by" value={job.triggeredBy.email} /><KeyValue label="Queue position" value={job.queuePosition ?? "None"} /><KeyValue label="Started" value={formatDate(job.startedAt)} /><KeyValue label="Ended" value={formatDate(job.endedAt)} />{job.failureReason && <Banner tone="danger">{job.failureReason}</Banner>}</section>
      <section className="panel"><h2>Progress</h2>{job.progress.available ? <><div className="progress"><span style={{ width: `${job.progress.value ?? 0}%` }} /></div><strong>{job.progress.value}%</strong><p>Epoch {job.progress.epoch} of {job.progress.totalEpoch}</p></> : <Banner tone="warning">Progress Information Not Available</Banner>}</section>
      <section className="panel"><h2>Artifacts</h2><ArtifactList artifacts={artifacts} /></section>
    </aside>
  );
}

function ArtifactList({ artifacts }: { artifacts: Artifact[] }) {
  if (artifacts.length === 0) return <EmptyState title="No artifacts yet" message="Artifacts appear after successful terminal status." compact />;
  return artifacts.map((artifact) => (
    <div className="artifact-row" key={artifact.artifactId}>
      <div><strong>{artifact.artifactName}</strong><small>{formatBytes(artifact.fileSizeBytes)} · {artifact.artifactType}</small></div>
      <a className="icon-button" href={`/api/v1/artifacts/${artifact.artifactId}/download`} aria-label={`Download ${artifact.artifactName}`}><Download size={17} /></a>
    </div>
  ));
}
