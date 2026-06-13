import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { QueueSnapshot } from "../../shared/api/types";
import { mockState } from "../mock-data";

export const notificationSlice = createSlice({
  name: "notifications",
  initialState: { items: mockState.notifications },
  reducers: {
    markRead(state, action: PayloadAction<string>) {
      const notification = state.items.find((item) => item.notificationId === action.payload);
      if (notification) notification.status = "READ";
    },
  },
});

export const adminSlice = createSlice({
  name: "admin",
  initialState: { users: mockState.users, audit: mockState.audit, queue: mockState.queue as QueueSnapshot },
  reducers: {
    setUserStatus(state, action: PayloadAction<{ userId: string; status: "ACTIVE" | "DISABLED" }>) {
      const user = state.users.find((item) => item.userId === action.payload.userId);
      if (user) user.status = action.payload.status;
    },
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
