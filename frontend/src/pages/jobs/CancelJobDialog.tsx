import { useState } from "react";
import { Square } from "lucide-react";
import { Dialog } from "../../shared/components/Dialog";

export function CancelJobDialog(props: { onClose: () => void; onCancel: (reason: string) => void }) {
  const [reason, setReason] = useState("");

  return (
    <Dialog title="Cancel Training Job" onClose={props.onClose} danger>
      <p>Cancellation is destructive for the active run. The backend remains authoritative for final status.</p>
      <label className="field"><span>Reason</span><textarea value={reason} onChange={(event) => setReason(event.target.value)} /></label>
      <div className="dialog-actions">
        <button className="button secondary" onClick={props.onClose}>Keep Running</button>
        <button className="button danger" onClick={() => props.onCancel(reason)}><Square size={16} /> Cancel Job</button>
      </div>
    </Dialog>
  );
}
