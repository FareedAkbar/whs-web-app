// ✅ Roles type aur permission helper same rehenga
type Role = keyof typeof ROLES;
type Permission = (typeof ROLES)[Role][number];

const ROLES = {
  ADMIN: [
    "view:incidents",
    "update:incidents",
    "delete:incidents",
    "assign:incidents",
    "create:checklist",
    "update:checklist",
    "view:checklist",
    "view:homeCards",
    "view:contractors",
    "assign:contractors",
    "cancel:incidents",
    "assign:departments",
    "assign:inspections",
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
    "fill:checklist",
    "change:role",
  ],
  STAFF: [
    "view:incidents",
    "create:incidents",
    "view:homeCounters",
    "fill:checklist",
    "change:role",
  ],
  DEPARTMENT_MANAGER: ["view:homeCounters"],
  FACILITY_MANAGER: ["view:homeCounters"],
  // P_AND_C_MEMBER: ["view:homeCounters", "create:incidents"],
  P_AND_C_MANAGER: ["view:homeCounters", "close:incident", "assign:officer"],
  P_AND_C_OFFICER: ["view:homeCounters", "pick:incident", "complete:incident"],
  FACILITY_OFFICER: ["view:homeCounters"],
  UNDEFINED: [],
} as const;

export function hasPermission(role: Role, permission: Permission) {
  if (!role) {
    console.warn("User or roles are undefined:", role);
    return false;
  }
  return (ROLES[role] as readonly Permission[]).includes(permission);
}
