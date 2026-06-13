import { Upload } from "lucide-react";
import type { ReactNode } from "react";

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="toolbar">{children}</div>;
}

export function FormGrid({ children }: { children: ReactNode }) {
  return <div className="form-grid">{children}</div>;
}

export function TextField(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="field">
      <span>{props.label}</span>
      <input value={props.value} onChange={(event) => props.onChange(event.target.value)} placeholder={props.placeholder} />
    </label>
  );
}

export function FileDrop() {
  return (
    <div className="file-drop">
      <Upload size={22} />
      <span>Drop a ZIP archive here or choose a file</span>
      <small>.zip source packages are validated by the backend upload endpoint.</small>
    </div>
  );
}
