

type Role = keyof typeof ROLES
type Permission = (typeof ROLES)[Role][number]

const ROLES = {
  ADMIN: [
    "view:incidents",
    // "create:incidents",
    "update:incidents",
    "delete:incidents",
    "assign:incidents",
    "create:checklist",
    "update:checklist",
    "view:homeCards",
    // "view:homeCounters",
    "view:contractors",
    "assign:contractors",
    "cancel:incidents",
    // "accept/reject:incidents"
  ],
  WORKER: ["view:incidents", "update:incidents", "view:homeCounters", "accept/reject:incidents", "start:incident", "complete:incident","change:role"
  ],
  EMPLOYEE: ["view:incidents", "create:incidents","view:homeCounters","fill:checklist","change:role"],
  UNDEFINED: [],
} as const

export function hasPermission(role: Role, permission: Permission) {
   
    
    if (!role) {
        console.warn("User or roles are undefined:", role);
        return false;
      }
    
      return (ROLES[role] as readonly Permission[]).includes(permission)
      
}