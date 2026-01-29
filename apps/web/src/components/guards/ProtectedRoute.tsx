
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Role, useAuthStore } from "../../app/authStore";

export default function ProtectedRoute({
  children,
  allow
}: {
  children: ReactNode;
  allow?: Role[];
}) {
  const { accessToken, user } = useAuthStore();

  if (!accessToken) return <Navigate to="/login" replace />;

  if (allow && user?.role && !allow.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
