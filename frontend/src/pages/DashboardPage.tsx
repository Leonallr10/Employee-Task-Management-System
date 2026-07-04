import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchDashboardStats } from "../api/dashboard";
import StatCard from "../components/StatCard";
import { useAppSelector } from "../hooks/redux";
import type { DashboardStats } from "../types/dashboard";

function getErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { data?: { message?: string } } }).response
      ?.data?.message === "string"
  ) {
    return (error as { response: { data: { message: string } } }).response.data
      .message;
  }
  return fallback;
}

export default function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadStats() {
      try {
        setLoading(true);
        const response = await fetchDashboardStats();
        if (active) {
          setStats(response.data);
        }
      } catch (error) {
        if (active) {
          toast.error(getErrorMessage(error, "Failed to load dashboard"));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadStats();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Welcome back, {user?.fullName}
        </p>
      </div>

      {loading && (
        <div className="rounded-2xl bg-white p-8 text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">
          Loading dashboard stats...
        </div>
      )}

      {!loading && stats?.role === "admin" && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Employees"
            value={stats.totalEmployees}
            accent="bg-indigo-50 text-indigo-700"
          />
          <StatCard
            label="Total Tasks"
            value={stats.totalTasks}
            accent="bg-sky-50 text-sky-700"
          />
          <StatCard
            label="Completed Tasks"
            value={stats.completedTasks}
            accent="bg-emerald-50 text-emerald-700"
          />
          <StatCard
            label="Pending Tasks"
            value={stats.pendingTasks}
            accent="bg-amber-50 text-amber-700"
          />
        </div>
      )}

      {!loading && stats?.role === "employee" && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="My Tasks"
            value={stats.myTasks}
            accent="bg-indigo-50 text-indigo-700"
          />
          <StatCard
            label="Completed"
            value={stats.completedTasks}
            accent="bg-emerald-50 text-emerald-700"
          />
          <StatCard
            label="Pending"
            value={stats.pendingTasks}
            accent="bg-amber-50 text-amber-700"
          />
          <StatCard
            label="Overdue"
            value={stats.overdueTasks}
            accent="bg-rose-50 text-rose-700"
          />
        </div>
      )}
    </div>
  );
}
