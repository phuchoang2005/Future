import { Page, PageHeader } from "../../shared/components/Page";
import { formatDate } from "../../shared/format/formatters";
import { useAppSelector } from "../../store/hooks";

export function AdminAuditPage() {
  const audit = useAppSelector((state) => state.admin.audit);
  return (
    <Page>
      <PageHeader title="Admin Audit" subtitle="Correlation-ready trace of privileged actions and training operations." />
      <section className="panel">
        <div className="data-table">
          <div className="table-head"><span>Time</span><span>Actor</span><span>Action</span><span>Resource</span></div>
          {audit.map((row) => <div className="table-row" key={row.auditId}><span>{formatDate(row.createdAt)}</span><span>{row.actor.email}</span><span>{row.action}</span><span>{row.resourceType}:{row.resourceId}</span></div>)}
        </div>
      </section>
    </Page>
  );
}
