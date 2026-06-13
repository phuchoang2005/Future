import { LogOut } from "lucide-react";
import { actions } from "../../store/store";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

export function UserPanel() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.currentUser);
  if (!user) return null;

  return (
    <div className="user-panel">
      <div>
        <strong>{user.fullName}</strong>
        <span>{user.email}</span>
      </div>
      <span className="role-badge">{user.role === "ADMIN" ? "Admin" : "User"}</span>
      <button className="button secondary full-width" onClick={() => dispatch(actions.logout())}>
        <LogOut size={16} /> Logout
      </button>
    </div>
  );
}
