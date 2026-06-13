import { Search } from "lucide-react";
import { useState } from "react";
import { ConnectionBadge } from "../../shared/components/Badges";
import { Toolbar } from "../../shared/components/Form";
import type { LogEvent, StreamType } from "../../shared/api/types";

export function LogPanel({ logs, connection }: { logs: LogEvent[]; connection: string }) {
  const [filter, setFilter] = useState<StreamType | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const visibleLogs = logs.filter((line) => (filter === "ALL" || line.streamType === filter) && line.message.toLowerCase().includes(query.toLowerCase()));

  return (
    <section className="panel log-panel">
      <div className="panel-header"><h2>Live Logs</h2><ConnectionBadge state={connection} /></div>
      <Toolbar><label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search logs" /></label><div className="segmented">{(["ALL", "STDOUT", "STDERR"] as const).map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div></Toolbar>
      <div className="log-viewer" role="log" aria-live="polite">
        {visibleLogs.map((line) => <div className="log-line" key={line.logEventId}><span>{line.sequenceNo.toString().padStart(4, "0")}</span><span>{line.streamType}</span><code>{line.message}</code></div>)}
      </div>
    </section>
  );
}
