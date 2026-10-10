import { useRef, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Medal } from "lucide-react";
import {
  LEAGUES,
  getUserStanding,
  participantsByLeague,
  type LeagueName,
  type RankedParticipant,
} from "../data/leaderboard";
import { paths } from "../paths";
import { DemoPill, SectionHead } from "./ui";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

/* League selector (accessible tablist with arrow-key support) ------------- */
export function LeagueTabs({
  selected,
  onSelect,
}: {
  selected: LeagueName;
  onSelect: (league: LeagueName) => void;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    let next = i;
    if (e.key === "ArrowRight") next = (i + 1) % LEAGUES.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + LEAGUES.length) % LEAGUES.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = LEAGUES.length - 1;
    else return;
    e.preventDefault();
    onSelect(LEAGUES[next]);
    refs.current[next]?.focus();
  };

  return (
    <div className="cn-tabs" role="tablist" aria-label="Leagues">
      {LEAGUES.map((league, i) => (
        <button
          key={league}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="button"
          role="tab"
          id={`cn-tab-${league}`}
          aria-selected={selected === league}
          aria-controls="cn-league-panel"
          tabIndex={selected === league ? 0 : -1}
          className="cn-tab"
          onClick={() => onSelect(league)}
          onKeyDown={(e) => onKeyDown(e, i)}
        >
          {league}
          <span className="cn-tab-count">{participantsByLeague[league].length}</span>
        </button>
      ))}
    </div>
  );
}

/* One ranked row ---------------------------------------------------------- */
export function RankRow({ p }: { p: RankedParticipant }) {
  return (
    <li
      className="cn-rank-row"
      data-top={p.rank <= 3 ? p.rank : undefined}
      data-you={p.isCurrentUser ? "true" : undefined}
      aria-current={p.isCurrentUser ? "true" : undefined}
    >
      <span className="cn-rank-num" aria-label={`Rank ${p.rank}`}>
        {p.rank <= 3 ? <Medal size={14} aria-hidden="true" /> : null}
        {p.rank}
      </span>
      <span className="cn-avatar" aria-hidden="true">
        {initials(p.name)}
      </span>
      <span className="cn-rank-name">
        {p.name}
        {p.isCurrentUser && <span className="cn-pill cn-pill-accent">You · demo</span>}
      </span>
      <span className="cn-rank-xp">
        {p.xp.toLocaleString()} <span className="cn-muted cn-small">XP</span>
      </span>
    </li>
  );
}

/* Small dashboard preview ------------------------------------------------- */
export function LeaderboardPreview() {
  const s = getUserStanding();
  if (!s) return null;
  return (
    <section className="cn-section" aria-label="Leaderboard preview">
      <SectionHead
        title="Leaderboard"
        subtitle="Earn XP each week to climb your league."
        action={<DemoPill />}
      />
      <div className="cn-card cn-continue">
        <div className="cn-meta" style={{ gap: 28 }}>
          <div>
            <div className="cn-stat-label">Your league</div>
            <div className="cn-stat-value">{s.league}</div>
          </div>
          <div>
            <div className="cn-stat-label">Your rank</div>
            <div className="cn-stat-value">
              #{s.rank} <span className="cn-small cn-muted">of {s.total}</span>
            </div>
          </div>
          <div>
            <div className="cn-stat-label">Weekly XP</div>
            <div className="cn-stat-value">{s.xp}</div>
          </div>
        </div>
        <Link to={paths.leaderboard} className="cn-btn">
          View leaderboard <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
