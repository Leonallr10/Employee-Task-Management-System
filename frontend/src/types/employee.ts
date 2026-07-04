export interface Employee {
  id: number;
  fullName: string;
  email: string;
  department: string | null;
  designation: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeFormValues {
  fullName: string;
  email: string;
  department: string;
  designation: string;
  password?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface EmployeesListResponse {
  success: boolean;
  data: {
    employees: Employee[];
    pagination: PaginationMeta;
    sort: {
      sortBy: string;
      sortOrder: "asc" | "desc";
    };
    search: string;
  };
}

export interface EmployeeResponse {
  success: boolean;
  message?: string;
  data: {
    employee: Employee;
  };
}

export interface EmployeeListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
