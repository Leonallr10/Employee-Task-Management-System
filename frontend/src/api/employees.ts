import type {
  EmployeeFormValues,
  EmployeeListParams,
  EmployeeResponse,
  EmployeesListResponse,
} from "../types/employee";
import api from "./axios";

export async function fetchEmployees(
  params: EmployeeListParams
): Promise<EmployeesListResponse> {
  const { data } = await api.get<EmployeesListResponse>("/employees", {
    params,
  });
  return data;
}

export async function createEmployee(
  payload: EmployeeFormValues
): Promise<EmployeeResponse> {
  const { data } = await api.post<EmployeeResponse>("/employees", payload);
  return data;
}

export async function updateEmployee(
  id: number,
  payload: EmployeeFormValues
): Promise<EmployeeResponse> {
  const { data } = await api.put<EmployeeResponse>(`/employees/${id}`, payload);
  return data;
}

export async function deleteEmployee(id: number): Promise<void> {
  await api.delete(`/employees/${id}`);
}
