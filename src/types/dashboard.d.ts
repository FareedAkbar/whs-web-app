interface DashboardStats {
    allUsers: number;
    allWorkers: number;
    allEmployees: number;
    allIncidents: number;
    allInProgressIncidents: number;
    allCompletedIncidents: number;
    allCancelledIncidents: number;
    allAssignedIncidents: number;
    allUnassignedIncidents: number;
  }
  interface DashboardStatsApiResponse {
    status: string;
    message: string;
    data: DashboardStats;
  }
  