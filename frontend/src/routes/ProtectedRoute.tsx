import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { Role } from "../types";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    const defaultRoute =
      role === "admin" ? "/admin/dashboard" :
      role === "doctor" ? "/doctor/dashboard" :
      "/dashboard";
    return <Navigate to={defaultRoute} replace />;
  }

  return <Outlet />;
}
