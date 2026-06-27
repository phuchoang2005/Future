import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuditLog, CurrentUser, Notification, QueueSnapshot } from "../../shared/api/types";
import { adminService } from "../../shared/api/services/admin";
import { mockState } from "../mock-data";

/** Newest-first cap so live-generated notifications can't grow without bound. */
const MAX_NOTIFICATIONS = 50;

/** Fields the notification listener supplies; the rest are filled in by the reducer. */
export type NewNotification = Pick<Notification, "jobId" | "type" | "message">;

/** Loads all platform users into `state.admin.users`. ADMIN role required. */
export const fetchUsers = createAsyncThunk("admin/fetchUsers", () =>
  adminService.listUsers({ limit: 200 }).then((r) => r.data),
);

/**
 * Toggles a user's activation status.
 * The optimistic reducer update runs immediately on fulfillment;
 * the backend enforces the restriction on the next API call from that user.
 */
export const setUserStatusAsync = createAsyncThunk(
  "admin/setUserStatus",
  async ({ userId, status }: { userId: string; status: "ACTIVE" | "DISABLED" }) => {
    await adminService.setUserStatus(userId, status);
    return { userId, status };
  },
);

/** Loads the audit trail into `state.admin.audit`. Entries are immutable and append-only. */
export const fetchAuditLogs = createAsyncThunk("admin/fetchAuditLogs", () =>
  adminService.listAuditLogs({ limit: 200 }).then((r) => r.data),
);

export const notificationSlice = createSlice({
  name: "notifications",
  initialState: { items: mockState.notifications },
  reducers: {
    /** Prepends a live job-activity notification (newest first), capped at MAX_NOTIFICATIONS. */
    pushNotification(state, action: PayloadAction<NewNotification>) {
      state.items.unshift({
        notificationId: crypto.randomUUID(),
        channel: "IN_APP",
        status: "UNREAD",
        createdAt: new Date().toISOString(),
        ...action.payload,
      });
      if (state.items.length > MAX_NOTIFICATIONS) state.items.length = MAX_NOTIFICATIONS;
    },
    markRead(state, action: PayloadAction<string>) {
      const notification = state.items.find((item) => item.notificationId === action.payload);
      if (notification) notification.status = "READ";
    },
    markAllRead(state) {
      for (const item of state.items) item.status = "READ";
    },
  },
});

export const adminSlice = createSlice({
  name: "admin",
  initialState: {
    users: [] as CurrentUser[],
    audit: [] as AuditLog[],
    queue: { runningCount: 0, runningLimit: 1, queuedCount: 0, items: [] } as QueueSnapshot,
    loading: false,
    error: undefined as string | undefined,
  },
  reducers: {
    setUserStatus(state, action: PayloadAction<{ userId: string; status: "ACTIVE" | "DISABLED" }>) {
      const user = state.users.find((item) => item.userId === action.payload.userId);
      if (user) user.status = action.payload.status;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => { state.loading = true; state.error = undefined; })
      .addCase(fetchUsers.fulfilled, (state, action) => { state.loading = false; state.users = action.payload; })
      .addCase(fetchUsers.rejected, (state, action) => { state.loading = false; state.error = action.error.message; })

      .addCase(setUserStatusAsync.fulfilled, (state, action) => {
        const user = state.users.find((u) => u.userId === action.payload.userId);
        if (user) user.status = action.payload.status;
      })

      .addCase(fetchAuditLogs.pending, (state) => { state.loading = true; })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => { state.loading = false; state.audit = action.payload; })
      .addCase(fetchAuditLogs.rejected, (state, action) => { state.loading = false; state.error = action.error.message; });
  },
});

export const themeSlice = createSlice({
  name: "theme",
  initialState: { mode: document.documentElement.classList.contains("dark") ? "dark" : "light" },
  reducers: {
    setTheme(state, action: PayloadAction<"light" | "dark">) {
      state.mode = action.payload;
      document.documentElement.classList.toggle("dark", action.payload === "dark");
    },
  },
});
