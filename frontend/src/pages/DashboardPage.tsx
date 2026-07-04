import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { logout } from "../store/authSlice";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Task Management
            </p>
            <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            Welcome, {user?.fullName}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            You are signed in successfully.
          </p>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Email
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">
                {user?.email}
              </dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Role
              </dt>
              <dd className="mt-1 text-sm font-medium capitalize text-slate-800">
                {user?.role}
              </dd>
            </div>
          </dl>
        </div>
      </main>
    </div>
  );
}
