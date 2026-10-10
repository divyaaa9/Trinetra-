import { Link } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import type { Assessment } from "../../data/assessments";
import { poses } from "../../data/poses";
import { MAX_SCORE, MCQ_COUNT, MCQ_MARKS, PASS_MARK, POSTURE_COUNT, POSTURE_MARKS, cooldownEnd, formatRemaining, type Attempt } from "../../lib/scoring";
import { paths } from "../../paths";
import { Notice } from "../ui";

const Mark = ({ ok }: { ok: boolean }) =>
  ok ? <span className="cn-result-flag" data-ok="true"><CheckCircle2 size={16} aria-hidden="true" /> Passed</span>
     : <span className="cn-result-flag" data-ok="false"><XCircle size={16} aria-hidden="true" /> Not passed</span>;

export default function ResultsView({
  assessment, attempt, now, onRetake,
}: { assessment: Assessment; attempt: Attempt; now: number; onRetake: () => void }) {
  const wrong = attempt.mcq.filter((r) => !r.correct);
  const failedPoses = attempt.postures.filter((p) => !p.passed);
  const lockUntil = cooldownEnd([attempt]);
  const locked = lockUntil !== null && now < lockUntil;

  return (
    <div>
      <div className="cn-card" data-pass={attempt.passed}>
        <span className="cn-eyebrow">{assessment.title}</span>
        <h1 style={{ fontSize: "clamp(2rem,6vw,3rem)" }}>{attempt.score} / {MAX_SCORE}</h1>
        <p style={{ margin: "6px 0 12px" }}>
          <strong>{attempt.score}%</strong> ·{" "}
          {attempt.passed ? <Mark ok /> : <Mark ok={false} />} (pass mark {PASS_MARK})
        </p>
        <div className="cn-meta">
          <span className="cn-pill">Theory {attempt.mcqScore} / {MCQ_COUNT * MCQ_MARKS}</span>
          <span className="cn-pill">Postures {attempt.postureScore} / {POSTURE_COUNT * POSTURE_MARKS}</span>
          <span className="cn-pill">{attempt.mcq.length - wrong.length} correct · {wrong.length} incorrect</span>
          <span className="cn-pill cn-pill-accent">+{attempt.xpAwarded} XP</span>
        </div>
      </div>

      {!attempt.passed && lockUntil !== null && (
        <div style={{ marginTop: 16 }}>
          <Notice>
            You scored below {PASS_MARK}. You can retake this assessment after your seven-day revision period.
            {" "}Next attempt: <strong>{new Date(lockUntil).toLocaleString()}</strong>
            {locked && <> ({formatRemaining(lockUntil - now)} remaining)</>}. You can keep studying lessons and take other assessments meanwhile.
          </Notice>
        </div>
      )}

      <div className="cn-section" style={{ marginTop: 28 }}>
        <h2 style={{ marginBottom: 12 }}>Theory questions</h2>
        <ul className="cn-lesson-list">
          {assessment.questions.map((q, i) => {
            const r = attempt.mcq[i];
            return (
              <li key={q.id} className="cn-lesson-row">
                {r.correct ? <CheckCircle2 size={22} color="var(--cn-success)" aria-hidden="true" /> : <XCircle size={22} color="var(--cn-danger)" aria-hidden="true" />}
                <div className="cn-lesson-main">
                  <h3>Q{i + 1}. {q.prompt}</h3>
                  <p className="cn-small cn-muted">
                    {r.correct ? "Correct" : `Incorrect. Correct answer: ${q.options[q.correctIndex]}`}
                  </p>
                </div>
                <span className="cn-pill">{r.marks} / {MCQ_MARKS}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="cn-section" style={{ marginTop: 28 }}>
        <h2 style={{ marginBottom: 12 }}>Posture challenges</h2>
        <ul className="cn-lesson-list">
          {attempt.postures.map((p, i) => (
            <li key={p.poseId} className="cn-lesson-row" data-result={p.passed ? "pass" : "fail"}>
              {p.passed ? <CheckCircle2 size={22} color="var(--cn-success)" aria-hidden="true" /> : <XCircle size={22} color="var(--cn-danger)" aria-hidden="true" />}
              <div className="cn-lesson-main">
                <h3>Posture {i + 1}: {poses[p.poseId]?.name ?? p.poseId}</h3>
                <p className="cn-small cn-muted">{p.passed ? "Matched the target posture." : p.detail ?? "Did not meet the matching threshold."}</p>
              </div>
              <span className="cn-pill">{p.marks} / {POSTURE_MARKS}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="cn-section" style={{ marginTop: 28 }}>
        <h2 style={{ marginBottom: 12 }}>Areas to improve</h2>
        {wrong.length === 0 && failedPoses.length === 0 ? (
          <p className="cn-muted">Nothing to improve this time. Great work!</p>
        ) : (
          <ul className="cn-tips">
            {wrong.map((r) => {
              const q = assessment.questions.find((x) => x.id === r.questionId)!;
              return <li key={q.id}><strong>{q.topic}:</strong> {q.explanation}</li>;
            })}
            {failedPoses.map((p) => (
              <li key={p.poseId}><strong>{poses[p.poseId]?.name}:</strong> {poses[p.poseId]?.hint}</li>
            ))}
          </ul>
        )}
      </div>

      <p className="cn-small cn-muted" style={{ marginTop: 20 }}>
        Posture marks come from an approximate camera-based pose comparison, not a professional skill assessment.
      </p>
      <div className="cn-actions" style={{ marginTop: 16 }}>
        {attempt.passed && <button type="button" className="cn-btn" onClick={onRetake}>Retake assessment</button>}
        <Link to={paths.assessments} className="cn-btn cn-btn-ghost">Back to assessments</Link>
      </div>
    </div>
  );
}
