import { configureStore } from "@reduxjs/toolkit";
import type { Artifact, AuditLog, ProjectConfigContent } from "../shared/api/types";
import { authSlice, fetchCurrentUser } from "./slices/authSlice";
import {
  jobSlice,
  fetchJobsByProject, fetchJobById, startJobAsync, cancelJobAsync, retryJobAsync,
  fetchQueue, fetchJobLogs, fetchJobArtifacts,
} from "./slices/jobSlice";
import {
  projectSlice,
  fetchProjects, fetchProjectById, createProjectAsync, createZipProjectAsync,
  fetchProjectConfig, saveConfigAsync, validateConfigAsync, deleteProjectAsync,
} from "./slices/projectSlice";
import {
  adminSlice, notificationSlice, themeSlice,
  fetchUsers, setUserStatusAsync, fetchAuditLogs,
} from "./slices/supportSlices";
import { notificationListener } from "./listeners/notificationListener";

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    projects: projectSlice.reducer,
    jobs: jobSlice.reducer,
    notifications: notificationSlice.reducer,
    admin: adminSlice.reducer,
    theme: themeSlice.reducer,
  },
  // Generates in-app notifications from live job activity; must run before the
  // default middleware so it sees actions on their way to the reducers.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(notificationListener.middleware),
});

/**
 * Flat namespace that merges all slice action creators and async thunks.
 * Import from here instead of from individual slice files to avoid long import lists in pages.
 *
 * Sync reducers (plain action creators): login, logout, appendLog, setConnection, …
 * Async thunks: fetchProjects, startJobAsync, cancelJobAsync, fetchCurrentUser, …
 */
export const actions = {
  ...authSlice.actions,
  ...projectSlice.actions,
  ...jobSlice.actions,
  ...notificationSlice.actions,
  ...adminSlice.actions,
  ...themeSlice.actions,
  // Async thunks
  fetchCurrentUser,
  fetchProjects,
  fetchProjectById,
  createProjectAsync,
  createZipProjectAsync,
  fetchProjectConfig,
  saveConfigAsync,
  validateConfigAsync,
  deleteProjectAsync,
  fetchJobsByProject,
  fetchJobById,
  startJobAsync,
  cancelJobAsync,
  retryJobAsync,
  fetchQueue,
  fetchJobLogs,
  fetchJobArtifacts,
  fetchUsers,
  setUserStatusAsync,
  fetchAuditLogs,
};

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type { Artifact, AuditLog, ProjectConfigContent };
