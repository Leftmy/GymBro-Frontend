import { Navigate, useLocation } from "react-router";
import type { ReactNode } from "react";
import { useAuth } from "@/app/features/auth/context/AuthContext";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { token, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="py-16 text-center text-muted-foreground">Loading…</div>;
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}
