// types/user.ts

export const userRoles = [
  "STAFF",
  "WORKER",
  "DEPARTMENT_MANAGER",
  "FACILITY_MANAGER",
  "PC_MEMBER",
  "ADMIN",
  "UNDEFINED",
] as const;

export type UserRole = (typeof userRoles)[number];
