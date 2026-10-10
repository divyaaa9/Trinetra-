import { Link } from "react-router-dom";
import { ClipboardCheck, Lock } from "lucide-react";
import { assessments } from "../data/assessments";
import { cooldownEnd, formatRemaining, MAX_SCORE, PASS_MARK } from "../lib/scoring";
import { getAttempts } from "../lib/storage";
import { useNow } from "../lib/useNow";
import { paths } from "../paths";
import { DifficultyPill, EmptyState, PageHeader, PageTransition } from "../components/ui";

export default function AssessmentsPage() {
  const now = useNow();
  return (
    <PageTransition>
      <PageHeader
        eyebrow="Assessments"
        title="Assessments"
        subtitle={`Each assessment has 4 theory questions and 3 posture challenges, scored out of ${MAX_SCORE}. ${PASS_MARK} or more is a pass.`}
      />
      <div className="cn-section" style={{ marginTop: 28 }}>
        {assessments.length === 0 ? (
          <EmptyState icon={ClipboardCheck} title="No assessments yet" message="Assessments will appear here." />
        ) : (
          <ul className="cn-grid cn-grid-2">
            {assessments.map((a) => {
              const attempts = getAttempts(a.id);
              const last = attempts[attempts.length - 1];
              const until = cooldownEnd(attempts);
              const locked = until !== null && now < until;
              return (
                <li key={a.id} className="cn-card cn-cat">
                  <h3>{a.title}</h3>
                  <p>{a.description}</p>
                  <div className="cn-meta">
                    <DifficultyPill level={a.difficulty} />
                    <span className="cn-pill">7 tasks</span>
                    <span className="cn-pill">{MAX_SCORE} marks</span>
                  </div>
                  {last && (
                    <p className="cn-small cn-muted">
                      Last attempt: {last.score}/{MAX_SCORE} ({last.passed ? "passed" : "not passed"}), {new Date(last.completedAt).toLocaleDateString()}
                    </p>
                  )}
                  {locked && until !== null && (
                    <p className="cn-small"><Lock size={14} aria-hidden="true" /> Locked for revision: retake available {new Date(until).toLocaleString()} ({formatRemaining(until - now)} left)</p>
                  )}
                  <Link to={`${paths.assessments}/${a.id}`} className="cn-btn cn-btn-ghost cn-btn-sm">
                    {locked ? "View details" : last ? "Open assessment" : "Open and start"}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </PageTransition>
  );
}
