import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { CelestialBackground } from "../../shared/components/CelestialBackground";
import { useAppSelector } from "../../store/hooks";
import { Brand } from "./Brand";
import { NavLinks } from "./NavLinks";
import { Topbar } from "./Topbar";
import { UserPanel } from "./UserPanel";

export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.currentUser);

  useEffect(() => setDrawerOpen(false), [location.pathname]);
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="app-shell">
      <CelestialBackground />
      <aside className="sidebar"><Brand /><NavLinks role={user.role} /><UserPanel /></aside>
      {drawerOpen && <MobileDrawer role={user.role} onClose={() => setDrawerOpen(false)} />}
      <div className="main-frame">
        <Topbar onMenu={() => setDrawerOpen(true)} />
        <main className="page-frame"><Outlet /></main>
      </div>
    </div>
  );
}

function MobileDrawer({ role, onClose }: { role: "USER" | "ADMIN"; onClose: () => void }) {
  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer" onClick={(event) => event.stopPropagation()}>
        <button className="icon-button drawer-close" aria-label="Close navigation" onClick={onClose}><X size={18} /></button>
        <Brand /><NavLinks role={role} /><UserPanel />
      </aside>
    </div>
  );
}
