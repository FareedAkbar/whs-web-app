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
   interface WorkerCount  {
    reportsAssigned: number;
    completedReports: number;
    reportsReported: number;
}


 interface workerDashboardApiResponse {
    status: string;
    message: string;
    data: WorkerCount
}
  