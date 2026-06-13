import { artifactsByJobId, jobs, logsByJobId, queue } from "./mock/jobs";
import { configsByProjectId, defaultYaml, projects } from "./mock/projects";
import { audit, notifications } from "./mock/support";
import { currentUser, users } from "./mock/users";

export const mockState = {
  currentUser,
  projects,
  configsByProjectId,
  jobs,
  logsByJobId,
  artifactsByJobId,
  notifications,
  queue,
  users,
  audit,
  defaultYaml,
};
