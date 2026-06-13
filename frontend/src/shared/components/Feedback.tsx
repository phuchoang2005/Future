import type { ReactNode } from "react";

export function Banner({ children, tone }: { children: ReactNode; tone: "success" | "warning" | "danger" }) {
  return <div className={`banner ${tone}`}>{children}</div>;
}

export function EmptyState(props: { icon?: ReactNode; title: string; message: string; compact?: boolean }) {
  return (
    <section className={`empty-state ${props.compact ? "compact" : ""}`}>
      {props.icon}
      <h2>{props.title}</h2>
      <p>{props.message}</p>
    </section>
  );
}

export function KeyValue({ label, value }: { label: string; value: ReactNode }) {
  return <div className="key-value"><span>{label}</span><strong>{value}</strong></div>;
}

export function StatusDot({ tone }: { tone: "success" | "danger" | "warning" | "info" | "neutral" }) {
  return <span className={`status-dot ${tone}`} aria-hidden="true" />;
}

export function MetricGrid({ children }: { children: ReactNode }) {
  return <div className="metric-grid">{children}</div>;
}

export function Metric({ label, value }: { label: string; value: string }) {
  return <section className="metric panel"><span>{label}</span><strong>{value}</strong></section>;
}
