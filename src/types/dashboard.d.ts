interface DashboardStatsApiResponse {
  status: string;
  message: string;
  data: AdminDashboardStats;
}

type dashboardGroup = {
  id: string;
  name: string;
  description: string;
  groupType: "DEPARTMENT" | "FACILITY" | "PC_TEAM";
  staff: number;
  isActive: boolean;
};
type StatusCounts = {
  total: number;
  completed: number;
  assigned: number;
  cancelled: number;
  initiated: number;
  inProgress: number;
  // rejected: number;
  closed: number;
};
interface ManagerStats {
  incidents: StatusCounts;
  hazards: StatusCounts;
  group: dashboardGroup;
}
interface dashboardManagerApiResponse {
  status: string;
  message: string;
  data: ManagerStats;
}
interface EmpStats {
  incidents: StatusCounts;
  hazards: StatusCounts;
}
interface dashboardEmployeeApiResponse {
  status: string;
  message: string;
  data: EmpStats;
}
interface AdminDashboardStats {
  users: {
    Total: number;
    "Staff / Agents": number;
    "Department Managers": number;
    "Facility Managers": number;
  };
  incidents: {
    Total: number;
    "In Progress": number;
    Closed: number;
    Cancelled: number;
    Initiated: number;
  };
  hazards: {
    Total: number;
    "In Progress": number;
    Closed: number;
    Cancelled: number;
    Initiated: number;
  };
  groups: {
    Department: number;
    Facility: number;
  };
  inspections: {
    Total: number;
    Assigned: number;
    Unassigned: number;
  };
}
