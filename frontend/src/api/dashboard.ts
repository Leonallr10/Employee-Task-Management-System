import type { DashboardResponse } from "../types/dashboard";
import api from "./axios";

export async function fetchDashboardStats(): Promise<DashboardResponse> {
  const { data } = await api.get<DashboardResponse>("/dashboard");
  return data;
}
