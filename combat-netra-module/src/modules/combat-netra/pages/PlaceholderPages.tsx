import { ClipboardCheck, Trophy } from "lucide-react";
import {
  allLessons,
  badges,
  categories,
  categoryProgress,
  completedCount,
  currentLevelInfo,
  overallProgress,
  totalWeeklyMinutes,
} from "../data/demo";
import { paths } from "../paths";
import { DemoPill, EmptyState, Notice, PageHeader, PageTransition, ProgressBar } from "../components/ui";
import { WeeklyActivity } from "../components/DashboardSections";

export function AssessmentsPage() {
  return (
    <PageTransition>
      <PageHeader
        eyebrow="Assessments"
        title="Assessments"
        subtitle="Check your understanding after each category. Quizzes and practical self-checks will live here."
      />
      <div className="cn-section" style={{ marginTop: 28 }}>
        <EmptyState
          icon={ClipboardCheck}
          title="No assessments available yet"
          message="The assessment engine is planned for a later stage. For now, keep practising in the Academy."
          actionLabel="Go to Academy"
          actionTo={paths.academy}
        />
      </div>
    </PageTransition>
  );
}

export function ProgressPage() {
  const { current, next, done, percentToNext } = currentLevelInfo();
  return (
    <PageTransition>
      <PageHeader
        eyebrow="Progress"
        title="Your progress"
        subtitle="A closer look at how your training is going."
      />
      <div className="cn-section" style={{ marginTop: 28 }}>
        <div className="cn-card">
          <div className="cn-meta" style={{ justifyContent: "space-between", marginBottom: 10 }}>
            <h2>Overall</h2>
            <DemoPill />
          </div>
          <p className="cn-muted cn-small" style={{ marginBottom: 12 }}>
            {completedCount()} of {allLessons().length} lessons completed · {totalWeeklyMinutes()} minutes this
            week · Level: {current.name}
            {next ? ` (${done}/${next.minLessons} to ${next.name}, ${percentToNext}%)` : ""}
          </p>
          <ProgressBar value={overallProgress()} label="Overall progress" />
        </div>
      </div>

      <div className="cn-section">
        <h2 style={{ marginBottom: 16 }}>By category</h2>
        <ul className="cn-grid cn-grid-2">
          {categories.map((c) => (
            <li key={c.id} className="cn-card">
              <h3 style={{ marginBottom: 10 }}>{c.title}</h3>
              <ProgressBar value={categoryProgress(c)} label={`${c.title} progress`} />
              <p className="cn-small cn-muted" style={{ marginTop: 8 }}>
                {categoryProgress(c)}% complete
              </p>
            </li>
          ))}
        </ul>
      </div>

      <WeeklyActivity />
    </PageTransition>
  );
}

export function AchievementsPage() {
  const earned = badges.filter((b) => b.earned).length;
  return (
    <PageTransition>
      <PageHeader
        eyebrow="Achievements"
        title="Achievements"
        subtitle={`${earned} of ${badges.length} sample badges earned.`}
      />
      <div className="cn-section" style={{ marginTop: 28 }}>
        {badges.length ? (
          <ul className="cn-grid cn-grid-2">
            {badges.map((b) => {
              const Icon = b.icon;
              return (
                <li key={b.id} className="cn-card cn-badge" data-earned={b.earned}>
                  <div className="cn-badge-icon">
                    <Icon size={24} aria-hidden="true" />
                  </div>
                  <div>
                    <h3>{b.title}</h3>
                    <p className="cn-small cn-muted">{b.description}</p>
                    <div className="cn-meta" style={{ marginTop: 8 }}>
                      <span className={`cn-pill ${b.earned ? "cn-pill-success" : ""}`}>
                        {b.earned ? "Earned (demo)" : "Locked (demo)"}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState icon={Trophy} title="No badges yet" message="Complete lessons to start earning badges." />
        )}
        <div style={{ marginTop: 20 }}>
          <Notice>Badges are demonstration content only. Real achievements will be added in a later stage.</Notice>
        </div>
      </div>
    </PageTransition>
  );
}
