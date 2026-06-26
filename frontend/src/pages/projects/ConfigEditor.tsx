import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { Banner } from "../../shared/components/Feedback";

type ConfigFields = {
  datasetVersion: string;
  epochs: string;
  batchSize: string;
  learningRate: string;
  accelerator: string;
  checkpointEvery: string;
};

export const DEFAULT_CONFIG_YAML = `dataset:
  version: 1
training:
  epochs: 10
  batch_size: 32
  learning_rate: 0.001
runtime:
  accelerator: gpu
  checkpoint_every: 5`;

function parseYaml(yaml: string): ConfigFields {
  const sections: Record<string, Record<string, string>> = {};
  let section = "";
  for (const line of yaml.split("\n")) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const sm = line.match(/^([a-zA-Z_]\w*):\s*$/);
    if (sm) { section = sm[1]; sections[section] = {}; continue; }
    const fm = line.match(/^\s+([a-zA-Z_]\w*):\s*(.*)$/);
    if (fm && section) sections[section][fm[1]] = fm[2].trim();
  }
  return {
    datasetVersion: sections.dataset?.version ?? "",
    epochs: sections.training?.epochs ?? "",
    batchSize: sections.training?.batch_size ?? "",
    learningRate: sections.training?.learning_rate ?? "",
    accelerator: sections.runtime?.accelerator ?? "gpu",
    checkpointEvery: sections.runtime?.checkpoint_every ?? "",
  };
}

function serializeYaml(f: ConfigFields): string {
  return [
    "dataset:",
    `  version: ${f.datasetVersion}`,
    "training:",
    `  epochs: ${f.epochs}`,
    `  batch_size: ${f.batchSize}`,
    `  learning_rate: ${f.learningRate}`,
    "runtime:",
    `  accelerator: ${f.accelerator}`,
    `  checkpoint_every: ${f.checkpointEvery}`,
  ].join("\n");
}

export function ConfigEditor(props: {
  yaml: string;
  setYaml: (value: string) => void;
  validation: string;
  onValidate: () => void;
  onSave: () => void;
  saving?: boolean;
}) {
  const [fields, setFields] = useState<ConfigFields>(() => parseYaml(props.yaml));
  const skipSync = useRef(false);

  useEffect(() => {
    if (skipSync.current) { skipSync.current = false; return; }
    setFields(parseYaml(props.yaml));
  }, [props.yaml]);

  const update = (key: keyof ConfigFields, value: string) => {
    const next = { ...fields, [key]: value };
    setFields(next);
    skipSync.current = true;
    props.setYaml(serializeYaml(next));
  };

  return (
    <div className="config-editor">
      <div className="editor-toolbar">
        <button className="button secondary" onClick={props.onValidate}><Check size={16} /> Validate</button>
        <button className="button primary" onClick={props.onSave} disabled={props.saving}>{props.saving ? "Saving…" : "Save"}</button>
      </div>
      {props.validation === "valid" && <Banner tone="success">YAML validation passed.</Banner>}
      {props.validation === "invalid" && <Banner tone="danger">YAML validation failed. Check the configuration and try again.</Banner>}
      <div className="hyperparam-form">
        <div className="hyperparam-section">
          <h3 className="hyperparam-section-title">Dataset</h3>
          <div className="hyperparam-grid">
            <label className="field">
              <span>Version</span>
              <input type="number" value={fields.datasetVersion} step="any" min={0} onChange={(e) => update("datasetVersion", e.target.value)} />
            </label>
          </div>
        </div>
        <div className="hyperparam-section">
          <h3 className="hyperparam-section-title">Training</h3>
          <div className="hyperparam-grid">
            <label className="field">
              <span>Epochs</span>
              <input type="number" value={fields.epochs} min={1} step={1} onChange={(e) => update("epochs", e.target.value)} />
            </label>
            <label className="field">
              <span>Batch Size</span>
              <input type="number" value={fields.batchSize} min={1} step={1} onChange={(e) => update("batchSize", e.target.value)} />
            </label>
            <label className="field">
              <span>Learning Rate</span>
              <input type="number" value={fields.learningRate} min={0} step="any" onChange={(e) => update("learningRate", e.target.value)} />
            </label>
          </div>
        </div>
        <div className="hyperparam-section">
          <h3 className="hyperparam-section-title">Runtime</h3>
          <div className="hyperparam-grid">
            <label className="field">
              <span>Accelerator</span>
              <select value={fields.accelerator} onChange={(e) => update("accelerator", e.target.value)}>
                <option value="gpu">GPU</option>
                <option value="cpu">CPU</option>
                <option value="tpu">TPU</option>
              </select>
            </label>
            <label className="field">
              <span>Checkpoint Every (epochs)</span>
              <input type="number" value={fields.checkpointEvery} min={1} step={1} onChange={(e) => update("checkpointEvery", e.target.value)} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
