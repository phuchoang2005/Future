import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export function Dialog(props: { title: string; children: ReactNode; onClose: () => void; danger?: boolean }) {
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={props.onClose}>
      <motion.div
        className={`dialog ${props.danger ? "danger-dialog" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={props.title}
        onMouseDown={(event) => event.stopPropagation()}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="dialog-header">
          <h2>{props.title}</h2>
          <button className="icon-button" aria-label="Close dialog" onClick={props.onClose}><X size={18} /></button>
        </div>
        {props.children}
      </motion.div>
    </div>
  );
}
