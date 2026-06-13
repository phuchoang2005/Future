import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";

export function RequireAuth() {
  const user = useAppSelector((state) => state.auth.currentUser);
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

export function AdminGuard({ children }: { children: ReactNode }) {
  const user = useAppSelector((state) => state.auth.currentUser);
  return user?.role === "ADMIN" ? <>{children}</> : <Navigate to="/403" replace />;
}

export function NestedJobRedirect() {
  const { jobId } = useParams();
  return <Navigate to={`/jobs/${jobId}`} replace />;
}
