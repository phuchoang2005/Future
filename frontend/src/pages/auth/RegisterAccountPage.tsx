import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brand } from "../../app/layout/Brand";
import { Banner } from "../../shared/components/Feedback";
import { FormGrid, TextField } from "../../shared/components/Form";
import { actions } from "../../store/store";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { AuthPage } from "./AuthPage";

export function RegisterAccountPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentUser, error } = useAppSelector((state) => state.auth);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("password");
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const valid = fullName.trim() && email.includes("@") && password.length >= 6;

  useEffect(() => { if (currentUser) navigate("/projects", { replace: true }); }, [currentUser, navigate]);

  return (
    <AuthPage>
      <section className="login-card auth-card">
        <Brand /><div><h1>Register Account</h1><p>Create a local development session for onboarding flow validation.</p></div>
        <FormGrid><TextField label="Full name" value={fullName} onChange={setFullName} /><TextField label="Email" value={email} onChange={setEmail} /><label className="field"><span>Password</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label><div className="segmented large"><button className={role === "USER" ? "active" : ""} onClick={() => setRole("USER")}>User</button><button className={role === "ADMIN" ? "active" : ""} onClick={() => setRole("ADMIN")}>Admin</button></div></FormGrid>
        {error && <Banner tone="danger">{error}</Banner>}
        <button className="button primary full-width" disabled={!valid} onClick={() => dispatch(actions.registerAccount({ fullName, email, password, role }))}>Create Account</button>
        <Link className="button secondary full-width" to="/login">Back to Login</Link>
      </section>
    </AuthPage>
  );
}
