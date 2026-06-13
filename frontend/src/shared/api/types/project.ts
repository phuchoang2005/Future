import type { JobStatus } from "./job";
import type { UserSummary } from "./user";

export type SourceType = "GITHUB" | "ZIP";

export type ProjectSummary = {
  projectId: string;
  projectName: string;
  description: string;
  sourceType: SourceType;
  latestJobStatus: JobStatus;
  lastTrainingTime?: string;
  lastTrainingOwner?: string;
};

export type ProjectDetail = ProjectSummary & {
  repositoryUrl?: string;
  trainingEntrypoint: string;
  owner: UserSummary;
  createdAt: string;
  updatedAt: string;
};

export type ProjectConfigContent = {
  configId: string;
  configPath: string;
  yamlContent: string;
  contentHash: string;
};
