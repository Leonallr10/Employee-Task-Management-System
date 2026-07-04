export type ReportType = "completed" | "pending" | "employee";
export type ReportFormat = "json" | "csv" | "xlsx";

export interface ReportRow {
  taskId: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  startDate: string;
  dueDate: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  designation: string;
}

export interface ReportResponse {
  success: boolean;
  data: {
    type: ReportType;
    title: string;
    total: number;
    rows: ReportRow[];
  };
}
