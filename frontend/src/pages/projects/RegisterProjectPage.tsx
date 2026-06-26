import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileCode2, Plus, Upload } from "lucide-react";
import { Banner } from "../../shared/components/Feedback";
import { FileDrop, FormGrid, TextField } from "../../shared/components/Form";
import { Page, PageHeader } from "../../shared/components/Page";
import { actions } from "../../store/store";
import { useAppDispatch } from "../../store/hooks";

export function RegisterProjectPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [sourceType, setSourceType] = useState<"GITHUB" | "ZIP">("GITHUB");
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [trainingEntrypoint, setTrainingEntrypoint] = useState("python main.py");
  const [zipFile, setZipFile] = useState<File | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [created, setCreated] = useState<{ projectId: string; buildLog?: string } | undefined>();
  const valid = projectName.trim() && trainingEntrypoint.trim() && (sourceType === "GITHUB" ? repositoryUrl.startsWith("https://") : !!zipFile);

  const submit = async () => {
    setSubmitting(true);
    setError(undefined);
    try {
      let result;
      if (sourceType === "ZIP") {
        result = await dispatch(actions.createZipProjectAsync({ projectName, description, trainingEntrypoint, file: zipFile! })).unwrap();
      } else {
        result = await dispatch(actions.createProjectAsync({ projectName, description, sourceType, repositoryUrl, trainingEntrypoint })).unwrap();
      }
      // Show the docker build log before navigating so the user can confirm the image built.
      setCreated({ projectId: result.projectId, buildLog: result.buildLog });
      setSubmitting(false);
    } catch (err: unknown) {
      // On build failure the backend returns the build log in the error message.
      setError((err as { message?: string })?.message ?? "Failed to register project. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <Page width="form">
      <PageHeader title="Register Project" subtitle="Create a GitHub or ZIP-backed training project with the source metadata required by the API contract." />
      <section className="panel">
        <div className="segmented large">
          <button className={sourceType === "GITHUB" ? "active" : ""} onClick={() => setSourceType("GITHUB")}><FileCode2 size={16} /> GitHub</button>
          <button className={sourceType === "ZIP" ? "active" : ""} onClick={() => setSourceType("ZIP")}><Upload size={16} /> ZIP Upload</button>
        </div>
        <FormGrid>
          <TextField label="Project name" value={projectName} onChange={setProjectName} />
          <TextField label="Description" value={description} onChange={setDescription} />
          {sourceType === "GITHUB"
            ? <TextField label="Repository URL" value={repositoryUrl} onChange={setRepositoryUrl} placeholder="https://github.com/company/model" />
            : <FileDrop file={zipFile} onChange={setZipFile} />}
          <TextField label="Training entrypoint" value={trainingEntrypoint} onChange={setTrainingEntrypoint} />
        </FormGrid>
        {error && (
          <Banner tone="danger">
            <strong>Image build failed — project not created.</strong>
            <pre className="build-log">{error}</pre>
          </Banner>
        )}
        {created && (
          <Banner tone="success">
            <strong>Project created and image built.</strong>
            {created.buildLog && <pre className="build-log">{created.buildLog}</pre>}
          </Banner>
        )}
        <div className="form-actions">
          {created ? (
            <button className="button primary" onClick={() => navigate(`/projects/${created.projectId}`)}>
              Go to project
            </button>
          ) : (
            <button className="button primary" disabled={!valid || submitting} onClick={submit}>
              <Plus size={17} /> {submitting ? "Building image…" : "Create Project"}
            </button>
          )}
        </div>
      </section>
    </Page>
  );
}
