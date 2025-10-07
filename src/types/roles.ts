// types/user.ts

export const userRoles = [
  "STAFF",
  "WORKER",
  "DEPARTMENT_MANAGER",
  "FACILITY_MANAGER",
  "P_AND_C_MEMBER",
  "P_AND_C_MANAGER",
  "P_AND_C_OFFICER",
  "FACILITY_OFFICER",
  "ADMIN",
  "UNDEFINED",
] as const;

export type UserRole = (typeof userRoles)[number];
