import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import { useAppDispatch, useAppSelector } from "./hooks/redux";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { loadCurrentUser } from "./store/authSlice";

export default function App() {
  const dispatch = useAppDispatch();
  const { initialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!initialized) {
      void dispatch(loadCurrentUser());
    }
  }, [dispatch, initialized]);

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}
