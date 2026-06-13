import { Link } from "react-router-dom";
import { Brand } from "../../app/layout/Brand";
import { AuthPage } from "./AuthPage";

export function LoginCallbackPage() {
  return (
    <AuthPage>
      <section className="login-card">
        <Brand />
        <h1>Welcome Home</h1>
        <p>Your authenticated session is ready for project training workflows.</p>
        <Link className="button primary" to="/login">Continue to Login</Link>
      </section>
    </AuthPage>
  );
}
