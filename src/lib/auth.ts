

type Role = keyof typeof ROLES
type Permission = (typeof ROLES)[Role][number]

const ROLES = {
  ADMIN: [
    "view:incidents",
    "create:incidents",
    "update:incidents",
    "delete:incidents",
    "assign:incidents",
    "create:checklist",
    "update:checklist",
    "view:homeCards",
    // "view:homeCounters",
    "view:contractors",
  ],
  WORKER: ["view:incidents", "update:incidents", "view:homeCounters"],
  EMPLOYEE: ["view:incidents", "create:incidents","view:homeCounters",""],
  UNDEFINED: [],
} as const

export function hasPermission(user: User, permission: Permission) {
   
    
    if (!user || !user.role) {
        console.warn("User or roles are undefined:", user);
        return false;
      }
    
      return (ROLES[user.role] as readonly Permission[]).includes(permission)
      
}