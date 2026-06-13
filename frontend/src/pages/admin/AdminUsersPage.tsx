import { Page, PageHeader } from "../../shared/components/Page";
import { formatDate } from "../../shared/format/formatters";
import { actions } from "../../store/store";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

export function AdminUsersPage() {
  const dispatch = useAppDispatch();
  const users = useAppSelector((state) => state.admin.users);
  return (
    <Page>
      <PageHeader title="Admin Users" subtitle="Role and activation management with visible status boundaries." />
      <section className="panel"><div className="data-table"><div className="table-head"><span>User</span><span>Role</span><span>Status</span><span>Last login</span><span>Action</span></div>{users.map((user) => <div className="table-row" key={user.userId}><div><strong>{user.fullName}</strong><small>{user.email}</small></div><span>{user.role}</span><span className={`badge ${user.status === "ACTIVE" ? "success" : "neutral"}`}>{user.status}</span><span>{formatDate(user.lastLoginAt)}</span><button className="button secondary" onClick={() => dispatch(actions.setUserStatus({ userId: user.userId, status: user.status === "ACTIVE" ? "DISABLED" : "ACTIVE" }))}>{user.status === "ACTIVE" ? "Disable" : "Enable"}</button></div>)}</div></section>
    </Page>
  );
}
