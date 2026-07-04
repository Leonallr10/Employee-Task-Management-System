import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../hooks/redux";

export default function PublicRoute() {
  const { user, token, initialized } = useAppSelector((state) => state.auth);

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-xl bg-white px-6 py-4 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (token && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
