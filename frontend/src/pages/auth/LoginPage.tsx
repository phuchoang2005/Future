import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Brand } from "../../app/layout/Brand";
import { Banner } from "../../shared/components/Feedback";
import { FormGrid, TextField } from "../../shared/components/Form";
import { actions } from "../../store/store";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { AuthPage } from "./AuthPage";

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const { error, accounts } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState("user@example.com");
  const [password, setPassword] = useState("password");
  const from = (location.state as { from?: string } | null)?.from ?? "/projects";

  useEffect(() => { if (currentUser) navigate(from, { replace: true }); }, [currentUser, from, navigate]);

  return (
    <AuthPage>
      <section className="login-card auth-card">
        <Brand /><div><h1>Welcome Home</h1><p>Sign in with a development account while company SSO/OIDC is not configured.</p></div>
        <Banner tone="warning">Development only. Production authentication remains company SSO/OIDC.</Banner>
        <FormGrid><TextField label="Email" value={email} onChange={setEmail} /><label className="field"><span>Password</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label></FormGrid>
        {error && <Banner tone="danger">{error}</Banner>}
        <button className="button primary full-width" onClick={() => dispatch(actions.login({ email, password }))}>Sign In</button>
        <div className="sample-accounts">
          <strong>Sample accounts</strong>
          {accounts.slice(0, 2).map((account) => <button key={account.email} className="sample-account" onClick={() => { setEmail(account.email); setPassword(account.password); }}><span>{account.role}</span><code>{account.email}</code><small>{account.password}</small></button>)}
        </div>
        <Link className="button secondary full-width" to="/register">Register development account</Link>
      </section>
    </AuthPage>
  );
}
