import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { EmptyState, StatusDot } from "../../shared/components/Feedback";
import { Page, PageHeader } from "../../shared/components/Page";
import { formatDate } from "../../shared/format/formatters";
import { actions } from "../../store/store";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

export function NotificationListPage() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.notifications.items);
  const hasUnread = notifications.some((item) => item.status !== "READ");

  return (
    <Page width="form">
      <PageHeader
        title="Notifications"
        subtitle="Live training progress, job outcomes, and direct links back to monitoring context."
        action={hasUnread ? <button className="button secondary" onClick={() => dispatch(actions.markAllRead())}>Mark all read</button> : undefined}
      />
      {notifications.length === 0 ? (
        <EmptyState icon={<Bell />} title="No notifications yet" message="Job activity — queued, running, progress, and outcomes — will appear here as your training jobs run." />
      ) : (
        <section className="panel list-panel">
          {notifications.map((notification) => (
            <div className="notification-row" key={notification.notificationId}>
              <StatusDot tone={notification.status === "READ" ? "neutral" : notification.status === "DELIVERY_FAILED" ? "danger" : "info"} />
              <div><strong>{notification.type}</strong><p>{notification.message}</p><small>{formatDate(notification.createdAt)} · {notification.channel}</small></div>
              <Link className="button secondary" to={`/jobs/${notification.jobId}`}>Open job</Link>
              {notification.status !== "READ" && <button className="button ghost" onClick={() => dispatch(actions.markRead(notification.notificationId))}>Mark read</button>}
            </div>
          ))}
        </section>
      )}
    </Page>
  );
}
