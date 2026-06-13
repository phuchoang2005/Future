import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";
import type { JobStatus, ProjectConfigContent, ProjectDetail } from "../../shared/api/types";
import { mockState } from "../mock-data";

export const projectSlice = createSlice({
  name: "projects",
  initialState: {
    items: mockState.projects,
    configsByProjectId: mockState.configsByProjectId,
    activeStatusFilter: "ALL" as JobStatus | "ALL",
  },
  reducers: {
    registerProject: {
      reducer(state, action: PayloadAction<ProjectDetail>) {
        state.items.unshift(action.payload);
        state.configsByProjectId[action.payload.projectId] = { configId: nanoid(), configPath: "training.yaml", contentHash: "draft", yamlContent: mockState.defaultYaml };
      },
      prepare(project: Omit<ProjectDetail, "projectId" | "owner" | "createdAt" | "updatedAt" | "latestJobStatus">) {
        const now = new Date().toISOString();
        return { payload: { ...project, projectId: nanoid(), owner: mockState.currentUser, createdAt: now, updatedAt: now, latestJobStatus: "CREATED" as const } };
      },
    },
    saveConfig(state, action: PayloadAction<{ projectId: string; config: ProjectConfigContent }>) {
      state.configsByProjectId[action.payload.projectId] = action.payload.config;
    },
    setProjectStatus(state, action: PayloadAction<{ projectId: string; status: JobStatus; owner: string }>) {
      const project = state.items.find((item) => item.projectId === action.payload.projectId);
      if (project) Object.assign(project, { latestJobStatus: action.payload.status, lastTrainingOwner: action.payload.owner, lastTrainingTime: new Date().toISOString() });
    },
    setStatusFilter(state, action: PayloadAction<JobStatus | "ALL">) {
      state.activeStatusFilter = action.payload;
    },
  },
});
