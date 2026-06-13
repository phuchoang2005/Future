import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { pageVariants } from "../motion/variants";

export function Page({ children, width = "ops" }: { children: ReactNode; width?: "ops" | "form" }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={`page ${width === "form" ? "form-content" : "ops-content"}`}
      variants={reduceMotion ? undefined : pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) {
  return (
    <header className="page-header">
      <div><h1>{title}</h1><p>{subtitle}</p></div>
      {action && <div className="page-action">{action}</div>}
    </header>
  );
}
