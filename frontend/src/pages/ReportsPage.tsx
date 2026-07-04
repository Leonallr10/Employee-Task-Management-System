import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { exportReport, fetchReport } from "../api/reports";
import { useAppSelector } from "../hooks/redux";
import type { ReportRow, ReportType } from "../types/report";
import { getErrorMessage } from "../utils/errors";

const reportOptions: { type: ReportType; label: string; adminOnly?: boolean }[] =
  [
    { type: "completed", label: "Completed Tasks" },
    { type: "pending", label: "Pending Tasks" },
    { type: "employee", label: "Employee-wise Tasks", adminOnly: true },
  ];

export default function ReportsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === "admin";

  const availableReports = reportOptions.filter(
    (option) => !option.adminOnly || isAdmin
  );

  const [reportType, setReportType] = useState<ReportType>("completed");
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [title, setTitle] = useState("Completed Tasks Report");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<"csv" | "xlsx" | null>(null);

  const loadReport = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchReport(reportType);
      setRows(response.data.rows);
      setTitle(response.data.title);
      setTotal(response.data.total);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load report"));
    } finally {
      setLoading(false);
    }
  }, [reportType]);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  const handleExport = async (format: "csv" | "xlsx") => {
    try {
      setExporting(format);
      await exportReport(reportType, format);
      toast.success(`Exported ${format.toUpperCase()} successfully`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to export report"));
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>
          <p className="mt-1 text-sm text-slate-500">
            View and export task reports as Excel or CSV
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={exporting !== null || loading}
            onClick={() => void handleExport("csv")}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {exporting === "csv" ? "Exporting..." : "Export CSV"}
          </button>
          <button
            type="button"
            disabled={exporting !== null || loading}
            onClick={() => void handleExport("xlsx")}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {exporting === "xlsx" ? "Exporting..." : "Export Excel"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {availableReports.map((option) => (
          <button
            key={option.type}
            type="button"
            onClick={() => setReportType(option.type)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              reportType === option.type
                ? "bg-indigo-600 text-white"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{total} record(s)</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-3 font-semibold">Task</th>
                <th className="px-3 py-3 font-semibold">Priority</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold">Start</th>
                <th className="px-3 py-3 font-semibold">Due</th>
                <th className="px-3 py-3 font-semibold">Employee</th>
                <th className="px-3 py-3 font-semibold">Department</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-8 text-center text-slate-500"
                  >
                    Loading report...
                  </td>
                </tr>
              )}

              {!loading && rows.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-8 text-center text-slate-500"
                  >
                    No records found for this report.
                  </td>
                </tr>
              )}

              {!loading &&
                rows.map((row) => (
                  <tr key={`${row.taskId}-${row.employeeEmail}`}>
                    <td className="px-3 py-3">
                      <p className="font-medium text-slate-900">{row.title}</p>
                      <p className="text-xs text-slate-500">#{row.taskId}</p>
                    </td>
                    <td className="px-3 py-3 capitalize text-slate-600">
                      {row.priority}
                    </td>
                    <td className="px-3 py-3 capitalize text-slate-600">
                      {row.status.replace("_", " ")}
                    </td>
                    <td className="px-3 py-3 text-slate-600">{row.startDate}</td>
                    <td className="px-3 py-3 text-slate-600">{row.dueDate}</td>
                    <td className="px-3 py-3 text-slate-600">
                      <p>{row.employeeName}</p>
                      <p className="text-xs text-slate-400">
                        {row.employeeEmail}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {row.department || "—"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
