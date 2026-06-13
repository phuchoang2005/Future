export type JobStreamState = "connecting" | "connected" | "reconnecting" | "closed" | "unauthorized" | "unavailable";

export type JobStreamEvent<TPayload = unknown> = {
  eventId?: string;
  type: string;
  jobId: string;
  payload: TPayload;
  occurredAt?: string;
};

export type JobStreamClientOptions = {
  jobId: string;
  token?: string;
  lastEventId?: string;
  onEvent: (event: JobStreamEvent) => void;
  onStateChange?: (state: JobStreamState) => void;
  reconnectDelayMs?: number;
};
