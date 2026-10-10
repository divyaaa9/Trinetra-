import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import {
  CURRENT_USER_LEAGUE,
  PROMOTION_SLOTS,
  getUserStanding,
  rankedLeague,
  type LeagueName,
} from "../data/leaderboard";
import { LeagueTabs, RankRow } from "../components/leaderboard";
import {
  DemoPill,
  EmptyState,
  Notice,
  PageHeader,
  PageTransition,
  ProgressBar,
} from "../components/ui";

export default function LeaderboardPage() {
  const [selected, setSelected] = useState<LeagueName>(CURRENT_USER_LEAGUE);
  const standing = getUserStanding();
  const ranked = useMemo(() => rankedLeague(selected), [selected]);
  const viewingOwnLeague = selected === CURRENT_USER_LEAGUE;

  return (
    <PageTransition>
      <PageHeader
        eyebrow="Weekly competition"
        title="Leaderboard"
        subtitle="Keep training, earn XP, and climb your league. Every lesson you practise counts."
      />

      {standing && (
        <>
          <ul className="cn-grid cn-grid-4" style={{ marginTop: 28 }}>
            <li className="cn-card cn-stat">
              <div className="cn-stat-label">Your league</div>
              <div className="cn-stat-value">{standing.league}</div>
            </li>
            <li className="cn-card cn-stat">
              <div className="cn-stat-label">Your rank</div>
              <div className="cn-stat-value">
                #{standing.rank} <span className="cn-small cn-muted">of {standing.total}</span>
              </div>
            </li>
            <li className="cn-card cn-stat">
              <div className="cn-stat-label">Weekly XP</div>
              <div className="cn-stat-value">{standing.xp}</div>
            </li>
          </ul>

          <div className="cn-card" style={{ marginTop: 16 }}>
            <div className="cn-meta" style={{ justifyContent: "space-between", marginBottom: 8 }}>
              <strong>
                {standing.nextLeague
                  ? `Progress to ${standing.nextLeague} League`
                  : "You are in the top league"}
              </strong>
              <span className="cn-small cn-muted">
                {standing.nextLeague
                  ? standing.inPromotionZone
                    ? "In the promotion zone"
                    : `${standing.xpToPromotion} XP to reach the promotion zone`
                  : "Keep your place at the top"}
              </span>
            </div>
            <ProgressBar
              value={standing.percentToPromotion}
              label={`Progress toward ${standing.nextLeague ?? standing.league} League`}
            />
            <p className="cn-small cn-muted" style={{ marginTop: 8 }}>
              Finish in the top {PROMOTION_SLOTS} of your league at the end of the week to be promoted.
            </p>
          </div>
        </>
      )}

      <div className="cn-section" style={{ marginTop: 36 }}>
        <div className="cn-section-head">
          <div>
            <h2>{selected} League</h2>
            <p>
              {ranked.length} {ranked.length === 1 ? "participant" : "participants"} ·{" "}
              <span>Weekly competition, XP resets each Monday (demo)</span>
            </p>
          </div>
          <DemoPill>Fictional demo participants</DemoPill>
        </div>

        <LeagueTabs selected={selected} onSelect={setSelected} />

        <div
          id="cn-league-panel"
          role="tabpanel"
          aria-labelledby={`cn-tab-${selected}`}
          style={{ marginTop: 16 }}
        >
          {!viewingOwnLeague && (
            <div style={{ marginBottom: 12 }}>
              <Notice>
                You compete in the {CURRENT_USER_LEAGUE} League. You are only viewing the {selected}{" "}
                League.{" "}
                <button
                  type="button"
                  className="cn-btn cn-btn-ghost cn-btn-sm"
                  style={{ marginLeft: 8 }}
                  onClick={() => setSelected(CURRENT_USER_LEAGUE)}
                >
                  Back to my league
                </button>
              </Notice>
            </div>
          )}

          {ranked.length ? (
            <ol className="cn-rank-list" aria-label={`${selected} League ranking`}>
              {ranked.map((p) => (
                <RankRow key={p.id} p={p} />
              ))}
            </ol>
          ) : (
            <EmptyState
              icon={Users}
              title="No participants yet"
              message={`Nobody has joined the ${selected} League this week. Keep training and be the first!`}
            />
          )}
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <Notice>
          Leagues are separate from your achievement badges. Badges mark what you have accomplished; leagues
          show how you rank this week. All names and XP here are fictional demo data.
        </Notice>
      </div>
    </PageTransition>
  );
}
