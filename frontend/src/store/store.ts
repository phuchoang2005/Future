import { configureStore } from "@reduxjs/toolkit";
import type { Artifact, AuditLog, ProjectConfigContent } from "../shared/api/types";
import { authSlice } from "./slices/authSlice";
import { jobSlice } from "./slices/jobSlice";
import { projectSlice } from "./slices/projectSlice";
import { adminSlice, notificationSlice, themeSlice } from "./slices/supportSlices";

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    projects: projectSlice.reducer,
    jobs: jobSlice.reducer,
    notifications: notificationSlice.reducer,
    admin: adminSlice.reducer,
    theme: themeSlice.reducer,
  },
});

export const actions = {
  ...authSlice.actions,
  ...projectSlice.actions,
  ...jobSlice.actions,
  ...notificationSlice.actions,
  ...adminSlice.actions,
  ...themeSlice.actions,
};

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type { Artifact, AuditLog, ProjectConfigContent };
