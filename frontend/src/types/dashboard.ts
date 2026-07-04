export interface AdminDashboardStats {
  role: "admin";
  totalEmployees: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
}

export interface EmployeeDashboardStats {
  role: "employee";
  myTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
}

export type DashboardStats = AdminDashboardStats | EmployeeDashboardStats;

export interface DashboardResponse {
  success: boolean;
  data: DashboardStats;
}
