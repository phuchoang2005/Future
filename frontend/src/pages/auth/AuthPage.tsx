import type { ReactNode } from "react";
import { CelestialBackground } from "../../shared/components/CelestialBackground";

export function AuthPage({ children }: { children: ReactNode }) {
  return (
    <div className="auth-page">
      <CelestialBackground />
      {children}
    </div>
  );
}
