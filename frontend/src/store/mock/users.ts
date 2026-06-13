import type { CurrentUser } from "../../shared/api/types";
import { iso } from "./time";

export const currentUser: CurrentUser = {
  userId: "u-100",
  email: "user@example.com",
  fullName: "Development User",
  role: "USER",
  status: "ACTIVE",
  lastLoginAt: iso(30),
};

export const users: CurrentUser[] = [
  currentUser,
  { userId: "u-admin", email: "admin@example.com", fullName: "Development Admin", role: "ADMIN", status: "ACTIVE", lastLoginAt: iso(5) },
  { userId: "u-200", email: "owner@co.com", fullName: "Project Owner", role: "USER", status: "ACTIVE", lastLoginAt: iso(220) },
  { userId: "u-300", email: "disabled@co.com", fullName: "Disabled User", role: "USER", status: "DISABLED", lastLoginAt: iso(22000) },
];
