import { UserRole } from "@/types/roles";

// ✅ Roles type aur permission helper same rehenga
type Role = keyof typeof ROLES;
type Permission = (typeof ROLES)[Role][number];

const ROLES = {
  ADMIN: [
    "view:incidents",
    "update:incidents",
    "delete:incidents",
    "assign:incidents",
    "create:inspections",
    "update:inspections",
    "view:inspections",
    "view:homeCards",
    "view:contractors",
    "assign:contractors",
    "cancel:incidents",
    "assign:departments",
    "assign:inspections",
    "view:filled-inspections",
  ],
  WORKER: [
    "view:incidents",
    "update:incidents",
    "view:homeCounters",
    "accept/reject:incidents",
    "start:incident",
    "complete:incident",
    "change:role",
  ],
  EMPLOYEE: [
    "view:incidents",
    "create:incidents",
    "view:homeCounters",
    "fill:inspections",
    "change:role",
  ],
  STAFF: [
    "view:incidents",
    "create:incidents",
    "view:homeCounters",
    "fill:inspections",
    // "change:role",
    "submit:inspection",
    "view:filled-inspections",
    "create:hazards",
  ],
  DEPARTMENT_MANAGER: ["view:homeCounters"],
  FACILITY_MANAGER: [
    "view:homeCounters",
    "close:hazard",
    "assign:officer",
    "create:inspections",
    "assign:inspections",
    "update:inspections",
    "view:inspections",
    "view:filled-inspections",
    "submit:inspection",
    "fill:inspections",
  ],
  // P_AND_C_MEMBER: ["view:homeCounters", "create:incidents"],
  P_AND_C_MANAGER: [
    "view:homeCounters",
    "close:incident",
    "assign:officer",
    "create:inspections",
    "assign:inspections",
    "update:inspections",
    "view:inspections",
    "view:filled-inspections",
    "submit:inspection",
    "fill:inspections",
  ],
  P_AND_C_OFFICER: [
    "view:homeCounters",
    "pick:incident",
    "complete:incident",
    "submit:inspection",
    "view:filled-inspections",
    "fill:inspections",
  ],
  FACILITY_OFFICER: [
    "view:homeCounters",
    "pick:hazard",
    "complete:hazard",
    "submit:inspection",
    "view:filled-inspections",
    "fill:inspections",
  ],
  UNDEFINED: [],
} as const;

export function hasPermission(role: UserRole, permission: Permission) {
  if (!role) {
    console.warn("User or roles are undefined:", role);
    return false;
  }
  return (ROLES[role] as readonly Permission[]).includes(permission);
}
