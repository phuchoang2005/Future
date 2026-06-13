import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Play } from "lucide-react";
import { StatusBadge } from "../../shared/components/Badges";
import { Dialog } from "../../shared/components/Dialog";
import { KeyValue } from "../../shared/components/Feedback";
import { Page, PageHeader } from "../../shared/components/Page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../shared/ui/tabs";
import { actions } from "../../store/store";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { ErrorPage } from "../ErrorPage";
import { ConfigEditor } from "./ConfigEditor";
import { TrainingHistory } from "./TrainingHistory";
import type { ProjectDetail } from "../../shared/api/types";

export function ProjectDetailPage({ initialTab = "overview" }: { initialTab?: "overview" | "config" | "history" }) {
  const { projectId } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const project = useAppSelector((state) => state.projects.items.find((item) => item.projectId === projectId));
  const config = useAppSelector((state) => state.projects.configsByProjectId[projectId ?? ""]);
  const jobs = useAppSelector((state) => state.jobs.items.filter((job) => job.projectId === projectId));
  const [tab, setTab] = useState(initialTab);
  const [yaml, setYaml] = useState(config?.yamlContent ?? "");
  const [validation, setValidation] = useState<"idle" | "valid" | "invalid">("idle");
  const [startOpen, setStartOpen] = useState(false);

  if (!project || !config) return <ErrorPage code="404" title="Project not found" message="No authorized project was returned for this route." />;

  const startTraining = () => {
    const action = actions.startJob(project);
    dispatch(action);
    dispatch(actions.setProjectStatus({ projectId: project.projectId, status: action.payload.status, owner: action.payload.triggeredBy.email }));
    navigate(`/jobs/${action.payload.jobId}`);
  };

  return (
    <Page>
      <PageHeader title={project.projectName} subtitle={project.description} action={<button className="button primary" onClick={() => setStartOpen(true)}><Play size={17} /> Start Training</button>} />
      <div className="split-layout">
        <ProjectSummary project={project} />
        <section className="panel">
          <Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)}>
            <TabsList>{["overview", "config", "history"].map((item) => <TabsTrigger key={item} value={item}>{item === "config" ? "Configuration" : item[0].toUpperCase() + item.slice(1)}</TabsTrigger>)}</TabsList>
            <TabsContent value="overview"><TrainingHistory jobs={jobs.slice(0, 3)} compact /></TabsContent>
            <TabsContent value="config"><ConfigEditor yaml={yaml} setYaml={setYaml} validation={validation} onValidate={() => setValidation(yaml.includes("training:") ? "valid" : "invalid")} onSave={() => dispatch(actions.saveConfig({ projectId: project.projectId, config: { ...config, yamlContent: yaml, contentHash: "draft-local" } }))} /></TabsContent>
            <TabsContent value="history"><TrainingHistory jobs={jobs} /></TabsContent>
          </Tabs>
        </section>
      </div>
      {startOpen && <StartDialog yaml={yaml} onClose={() => setStartOpen(false)} onStart={startTraining} />}
    </Page>
  );
}

function ProjectSummary({ project }: { project: ProjectDetail }) {
  return <section className="panel"><h2>Project Summary</h2><KeyValue label="Source" value={project.sourceType} /><KeyValue label="Repository" value={project.repositoryUrl ?? "ZIP upload"} /><KeyValue label="Entrypoint" value={project.trainingEntrypoint} /><KeyValue label="Owner" value={project.owner.email} /><KeyValue label="Latest status" value={<StatusBadge status={project.latestJobStatus} />} /></section>;
}

function StartDialog({ yaml, onClose, onStart }: { yaml: string; onClose: () => void; onStart: () => void }) {
  return <Dialog title="Start Training With Care" onClose={onClose}><p>The platform will submit the current YAML as an immutable configuration snapshot for this training job.</p><pre className="yaml-preview">{yaml}</pre><div className="dialog-actions"><button className="button secondary" onClick={onClose}>Cancel</button><button className="button primary" onClick={onStart}><Play size={17} /> Start</button></div></Dialog>;
}
