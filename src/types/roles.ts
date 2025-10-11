// types/user.ts

export const userRoles = [
  "STAFF",
  // "WORKER",
  // "DEPARTMENT_MANAGER",
  "P_AND_C_MANAGER",
  "P_AND_C_OFFICER",
  "FACILITY_OFFICER",
  "FACILITY_MANAGER",
  "ADMIN",
  "UNDEFINED",
] as const;

export type UserRole = (typeof userRoles)[number];
