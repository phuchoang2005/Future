import { Navigate } from "react-router-dom";

export function LoginCallbackPage() {
  return <Navigate to="/login" replace />;
}
