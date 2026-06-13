import type { JobStreamClientOptions, JobStreamEvent, JobStreamState } from "./job-stream-types";
export type { JobStreamClientOptions, JobStreamEvent, JobStreamState };

export function createJobStreamClient(options: JobStreamClientOptions) {
  let socket: WebSocket | undefined;
  let closedByCaller = false;
  let reconnectTimer: number | undefined;
  const reconnectDelayMs = options.reconnectDelayMs ?? 5_000;

  const emitState = (state: JobStreamState) => options.onStateChange?.(state);

  const connect = () => {
    emitState(socket ? "reconnecting" : "connecting");
    socket = new WebSocket(buildUrl(options));
    socket.addEventListener("open", () => emitState("connected"));
    socket.addEventListener("message", (message) => {
      options.onEvent(JSON.parse(message.data) as JobStreamEvent);
    });
    socket.addEventListener("close", (event) => {
      if (closedByCaller) {
        emitState("closed");
        return;
      }
      if (event.code === 1008) {
        emitState("unauthorized");
        return;
      }
      emitState("unavailable");
      reconnectTimer = window.setTimeout(connect, reconnectDelayMs);
    });
    socket.addEventListener("error", () => emitState("unavailable"));
  };

  connect();

  return {
    close() {
      closedByCaller = true;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      socket?.close();
    },
  };
}

function buildUrl(options: JobStreamClientOptions) {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const params = new URLSearchParams();
  if (options.token) params.set("token", options.token);
  if (options.lastEventId) params.set("lastEventId", options.lastEventId);
  const query = params.toString();
  return `${protocol}//${window.location.host}/api/v1/ws/jobs/${options.jobId}${query ? `?${query}` : ""}`;
}
