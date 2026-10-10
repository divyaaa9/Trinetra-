import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Camera, Lock, SearchX } from "lucide-react";
import { findAssessment } from "../data/assessments";
import { poses } from "../data/poses";
import { MAX_SCORE, PASS_MARK, buildAttempt, cooldownEnd, formatRemaining, type Attempt, type PostureResult } from "../lib/scoring";
import { getAttempts, saveAttempt } from "../lib/storage";
import { useNow } from "../lib/useNow";
import { paths } from "../paths";
import McqStep from "../components/assessment/McqStep";
import PostureSection from "../components/assessment/PostureSection";
import ResultsView from "../components/assessment/ResultsView";
import { DifficultyPill, EmptyState, Notice, PageHeader, PageTransition } from "../components/ui";

type Stage = "intro" | "mcq" | "posture" | "results";
const newId = () => (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`);

/** Warns before an in-progress attempt is abandoned (reload, tab close, or in-app links). */
function useLeaveGuard(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const onUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a[href]");
      if (a && !window.confirm("Leave this assessment? Your current attempt will be abandoned.")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", onUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [active]);
}

export default function AssessmentRunPage() {
  const { assessmentId } = useParams();
  const assessment = findAssessment(assessmentId);
  const navigate = useNavigate();
  const now = useNow();

  const [stage, setStage] = useState<Stage>("intro");
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | undefined)[]>([]);
  const [saved, setSaved] = useState<Attempt | null>(null);
  const attemptId = useRef(newId());

  useLeaveGuard(stage === "mcq" || stage === "posture");

  if (!assessment) {
    return (
      <PageTransition>
        <EmptyState icon={SearchX} title="Assessment not found" message="That assessment doesn't exist."
          actionLabel="Back to assessments" actionTo={paths.assessments} />
      </PageTransition>
    );
  }

  const attempts = getAttempts(assessment.id);
  const until = cooldownEnd(attempts);
  const locked = until !== null && now < until;
  const last = attempts[attempts.length - 1];

  const exit = () => {
    if (window.confirm("Exit the assessment? Your current attempt will be abandoned.")) navigate(paths.assessments);
  };

  const onAnswer = (selected: number) => {
    setAnswers((prev) => {
      if (prev[qIndex] !== undefined) return prev; // never overwrite or double-count
      const next = [...prev];
      next[qIndex] = selected;
      return next;
    });
    if (qIndex + 1 < assessment.questions.length) setQIndex(qIndex + 1);
    else setStage("posture");
  };

  const onPosturesDone = (postures: PostureResult[]) => {
    const id = attemptId.current;
    const attempt = buildAttempt({ assessment, answers, postures, previous: getAttempts(assessment.id), id, now: Date.now() });
    saveAttempt(attempt); // idempotent per attempt id: XP can't be double-counted
    setSaved(getAttempts(assessment.id).find((a) => a.id === id) ?? attempt);
    setStage("results");
  };

  const retake = () => {
    attemptId.current = newId();
    setAnswers([]); setQIndex(0); setSaved(null); setStage("intro");
  };

  if (stage === "results" && saved) {
    return <PageTransition><ResultsView assessment={assessment} attempt={saved} now={now} onRetake={retake} /></PageTransition>;
  }

  if (stage === "mcq") {
    return (
      <PageTransition>
        <McqStep key={assessment.questions[qIndex].id} question={assessment.questions[qIndex]}
          index={qIndex} total={assessment.questions.length} onAnswer={onAnswer} />
        <div style={{ marginTop: 16 }}><button type="button" className="cn-btn cn-btn-ghost cn-btn-sm" onClick={exit}>Exit assessment</button></div>
      </PageTransition>
    );
  }

  if (stage === "posture") {
    return (
      <PageTransition>
        <PostureSection poses={assessment.poseIds.map((id) => poses[id])} onFinish={onPosturesDone} onExit={exit} />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <nav className="cn-crumbs" aria-label="Breadcrumb">
        <Link to={paths.assessments}>Assessments</Link><span aria-hidden="true">/</span><span>{assessment.title}</span>
      </nav>
      <PageHeader eyebrow="Assessment" title={assessment.title} subtitle={assessment.description} />
      <div className="cn-card" style={{ marginTop: 24 }}>
        <div className="cn-meta" style={{ marginBottom: 14 }}>
          <DifficultyPill level={assessment.difficulty} />
          <span className="cn-pill">7 tasks</span>
          <span className="cn-pill">{MAX_SCORE} marks</span>
          {assessment.topics.map((t) => <span key={t} className="cn-pill">{t}</span>)}
        </div>
        <ul className="cn-tips">
          <li><strong>4 theory questions</strong>, 10 marks each (40 marks).</li>
          <li><strong>3 posture challenges</strong>, 20 marks each (60 marks), copied from an animated figure.</li>
          <li>You pass with {PASS_MARK} or more. Below {PASS_MARK}, this assessment locks for a seven-day revision period.</li>
          <li>The camera is used for the posture section only. Your browser asks for permission only when that section starts; video is processed on your device and never recorded or uploaded.</li>
          <li>You earn XP once per completed attempt: 1 XP per mark, plus a 25 XP bonus the first time you pass.</li>
        </ul>
        {last && !locked && (
          <p className="cn-small cn-muted" style={{ marginTop: 12 }}>Last attempt: {last.score}/{MAX_SCORE} on {new Date(last.completedAt).toLocaleString()}.</p>
        )}
        {locked && until !== null && (
          <div style={{ marginTop: 14 }}>
            <Notice>
              You scored below {PASS_MARK}. You can retake this assessment after your seven-day revision period.
              {" "}Next attempt: <strong>{new Date(until).toLocaleString()}</strong> ({formatRemaining(until - now)} remaining).
              You can keep studying and take other assessments. This lock is stored in your browser, so clearing site data resets it.
            </Notice>
          </div>
        )}
        <div className="cn-actions" style={{ marginTop: 18 }}>
          <button type="button" className="cn-btn" disabled={locked} onClick={() => setStage("mcq")}>
            {locked ? <Lock size={16} aria-hidden="true" /> : <Camera size={16} aria-hidden="true" />} Start Assessment
          </button>
          <Link to={paths.assessments} className="cn-btn cn-btn-ghost">Back to assessments</Link>
        </div>
      </div>
    </PageTransition>
  );
}
