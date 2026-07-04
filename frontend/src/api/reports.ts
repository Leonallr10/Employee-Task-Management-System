import type { ReportFormat, ReportResponse, ReportType } from "../types/report";
import api from "./axios";

export async function fetchReport(
  type: ReportType
): Promise<ReportResponse> {
  const { data } = await api.get<ReportResponse>("/reports", {
    params: { type, format: "json" },
  });
  return data;
}

export async function exportReport(
  type: ReportType,
  format: Exclude<ReportFormat, "json">
): Promise<void> {
  const response = await api.get("/reports", {
    params: { type, format },
    responseType: "blob",
  });

  const extension = format === "xlsx" ? "xlsx" : "csv";
  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${type}-tasks-report.${extension}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
