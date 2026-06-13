export type UserRole = "USER" | "ADMIN";
export type UserStatus = "ACTIVE" | "DISABLED";

export type CurrentUser = {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: string;
};

export type UserSummary = Pick<CurrentUser, "userId" | "email" | "fullName">;
