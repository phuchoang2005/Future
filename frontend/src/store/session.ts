import { nanoid } from "@reduxjs/toolkit";
import type { CurrentUser } from "../shared/api/types";

export type LoginAccount = {
  email: string;
  password: string;
  fullName: string;
  role: CurrentUser["role"];
};

export const sampleAccounts: LoginAccount[] = [
  { email: "user@example.com", password: "password", fullName: "Development User", role: "USER" },
  { email: "admin@example.com", password: "password", fullName: "Development Admin", role: "ADMIN" },
];

export function storedAccount() {
  const email = sessionStorage.getItem("ai-training-session-email");
  return sampleAccounts.find((account) => account.email === email);
}

export function toCurrentUser(account: LoginAccount): CurrentUser {
  return {
    userId: account.email === "admin@example.com" ? "u-admin" : account.email === "user@example.com" ? "u-100" : nanoid(),
    email: account.email,
    fullName: account.fullName,
    role: account.role,
    status: "ACTIVE",
    lastLoginAt: new Date().toISOString(),
  };
}
