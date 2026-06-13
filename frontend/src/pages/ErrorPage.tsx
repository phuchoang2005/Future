import { Link } from "react-router-dom";
import { Page } from "../shared/components/Page";

export function ErrorPage({ code, title, message }: { code: string; title: string; message: string }) {
  return (
    <Page width="form">
      <section className="error-card">
        <strong>{code}</strong>
        <h1>{title}</h1>
        <p>{message}</p>
        <Link className="button primary" to="/projects">Back to Projects</Link>
      </section>
    </Page>
  );
}
