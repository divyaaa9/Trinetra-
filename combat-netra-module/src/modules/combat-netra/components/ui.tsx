import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Clock, Info, type LucideIcon } from "lucide-react";
import type { Difficulty } from "../types";

export function PageTransition({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className="cn-progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
    >
      <span style={{ width: `${clamped}%` }} />
    </div>
  );
}

export function DemoPill({ children = "Demo data" }: { children?: ReactNode }) {
  return <span className="cn-pill cn-pill-demo">{children}</span>;
}

export function DifficultyPill({ level }: { level: Difficulty }) {
  return <span className="cn-pill">{level}</span>;
}

export function DurationPill({ minutes, prefix }: { minutes: number; prefix?: string }) {
  return (
    <span className="cn-pill">
      <Clock size={13} aria-hidden="true" />
      {prefix ? `${prefix} ` : ""}
      {minutes} min
    </span>
  );
}

export function SectionHead({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="cn-section-head">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="cn-page-head">
      {eyebrow && <span className="cn-eyebrow">{eyebrow}</span>}
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </header>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  message,
  actionLabel,
  actionTo,
}: {
  icon: LucideIcon;
  title: string;
  message: string;
  actionLabel?: string;
  actionTo?: string;
}) {
  return (
    <div className="cn-empty">
      <div className="cn-stat-icon">
        <Icon size={20} aria-hidden="true" />
      </div>
      <h3>{title}</h3>
      <p>{message}</p>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="cn-btn cn-btn-sm">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

export function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="cn-notice" role="note">
      <Info size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
      <div>{children}</div>
    </div>
  );
}
