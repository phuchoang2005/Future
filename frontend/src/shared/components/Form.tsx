import { Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import type { ReactNode, DragEvent } from "react";

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

export function FileDrop(props: { file?: File; onChange: (file: File | undefined) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = (file: File | undefined) => {
    if (file && file.name.endsWith(".zip")) props.onChange(file);
  };

  const onDragOver = (e: DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    accept(e.dataTransfer.files[0]);
  };

  const clear = (e: React.MouseEvent) => { e.stopPropagation(); props.onChange(undefined); if (inputRef.current) inputRef.current.value = ""; };

  return (
    <div
      className={`file-drop${dragging ? " file-drop--over" : ""}${props.file ? " file-drop--filled" : ""}`}
      onClick={() => !props.file && inputRef.current?.click()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input ref={inputRef} type="file" accept=".zip" style={{ display: "none" }} onChange={(e) => accept(e.target.files?.[0])} />
      {props.file ? (
        <>
          <Upload size={22} />
          <span className="file-drop__name">{props.file.name}</span>
          <small>{(props.file.size / 1024).toFixed(0)} KB</small>
          <button type="button" className="file-drop__clear" onClick={clear} aria-label="Remove file"><X size={16} /></button>
        </>
      ) : (
        <>
          <Upload size={22} />
          <span>Drop a ZIP archive here or <u>choose a file</u></span>
          <small>Only .zip files are accepted.</small>
        </>
      )}
    </div>
  );
}
