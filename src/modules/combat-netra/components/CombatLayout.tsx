import { NavLink, Link, Outlet } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  Medal,
  Trophy,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { paths } from "../paths";

/** `short` is the compact label used in the mobile bottom bar. */
const NAV: { to: string; label: string; short: string; icon: LucideIcon }[] = [
  { to: paths.dashboard, label: "Dashboard", short: "Dashboard", icon: LayoutDashboard },
  { to: paths.academy, label: "Academy", short: "Academy", icon: GraduationCap },
  { to: paths.assessments, label: "Assessments", short: "Assess", icon: ClipboardCheck },
  { to: paths.progress, label: "Progress", short: "Progress", icon: TrendingUp },
  { to: paths.achievements, label: "Achievements", short: "Achieve", icon: Trophy },
  { to: paths.leaderboard, label: "Leaderboard", short: "Leaders", icon: Medal },
];

function Brand() {
  return (
    <div className="cn-brand">
      <div className="cn-brand-name">TRINETRA</div>
      <div className="cn-brand-sub">Netra 2 · Combat Training</div>
    </div>
  );
}

export default function CombatLayout() {
  return (
    <div className="cn-root">
      <a href="#cn-main" className="cn-skip">
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="cn-sidebar" aria-label="Netra 2 sections">
        <Brand />
        <nav className="cn-nav" aria-label="Combat Training">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className="cn-nav-link">
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="cn-sidebar-foot">
          <Link to={paths.home} className="cn-back">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to TRINETRA
          </Link>
        </div>
      </aside>

      <div className="cn-main-wrap">
        {/* Mobile top bar */}
        <div className="cn-topbar">
          <Brand />
          <Link to={paths.home} className="cn-back" aria-label="Back to TRINETRA home">
            <ArrowLeft size={16} aria-hidden="true" />
            Home
          </Link>
        </div>

        <main id="cn-main" className="cn-main" tabIndex={-1}>
          <Outlet />
        </main>

        {/* Mobile bottom tab bar */}
        <nav className="cn-bottomnav" aria-label="Combat Training">
          {NAV.map(({ to, label, short, icon: Icon }) => (
            <NavLink key={to} to={to} aria-label={label}>
              <Icon size={20} aria-hidden="true" />
              <span aria-hidden="true">{short}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
