import type { Assessment } from "../data/assessments";

export const MCQ_COUNT = 4;
export const POSTURE_COUNT = 3;
export const MCQ_MARKS = 10;
export const POSTURE_MARKS = 20;
export const MAX_SCORE = MCQ_COUNT * MCQ_MARKS + POSTURE_COUNT * POSTURE_MARKS; // 100
export const PASS_MARK = 50;
export const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
/** XP rule: 1 XP per mark earned, plus 25 bonus the first time an assessment is passed. */
export const FIRST_PASS_XP_BONUS = 25;

export interface McqResult { questionId: string; selected: number | null; correct: boolean; marks: number }
export interface PostureResult {
  poseId: string;
  passed: boolean;
  marks: number;
  reason: "matched" | "mismatch" | "not-visible";
  bestMatch: number;
  detail?: string;
}
export interface Attempt {
  id: string;
  assessmentId: string;
  completedAt: number;
  score: number;
  mcqScore: number;
  postureScore: number;
  passed: boolean;
  mcq: McqResult[];
  postures: PostureResult[];
  xpAwarded: number;
}

export function buildAttempt(args: {
  assessment: Assessment;
  answers: (number | null | undefined)[];
  postures: PostureResult[];
  previous: Attempt[];
  id: string;
  now: number;
}): Attempt {
  const { assessment, answers, postures, previous, id, now } = args;
  const mcq: McqResult[] = assessment.questions.map((q, i) => {
    const selected = answers[i] ?? null;
    const correct = selected === q.correctIndex;
    return { questionId: q.id, selected, correct, marks: correct ? MCQ_MARKS : 0 };
  });
  const fixed: PostureResult[] = assessment.poseIds.map((poseId) => {
    const r = postures.find((p) => p.poseId === poseId);
    const passed = !!r?.passed;
    return {
      poseId, passed, marks: passed ? POSTURE_MARKS : 0,
      reason: r?.reason ?? "not-visible", bestMatch: r?.bestMatch ?? 0, detail: r?.detail,
    };
  });
  const mcqScore = mcq.reduce((s, r) => s + r.marks, 0);
  const postureScore = fixed.reduce((s, r) => s + r.marks, 0);
  const score = mcqScore + postureScore;
  const passed = score >= PASS_MARK;
  const priorPass = previous.some((a) => a.passed);
  return {
    id, assessmentId: assessment.id, completedAt: now, score, mcqScore, postureScore, passed,
    mcq, postures: fixed, xpAwarded: score + (passed && !priorPass ? FIRST_PASS_XP_BONUS : 0),
  };
}

/** Lock end time if the most recent attempt for this assessment was a fail, else null. */
export function cooldownEnd(attempts: Attempt[]): number | null {
  if (!attempts.length) return null;
  const latest = attempts.reduce((a, b) => (b.completedAt > a.completedAt ? b : a));
  return latest.passed ? null : latest.completedAt + COOLDOWN_MS;
}

export function formatRemaining(ms: number): string {
  const mins = Math.max(0, Math.ceil(ms / 60000));
  const d = Math.floor(mins / 1440);
  const h = Math.floor((mins % 1440) / 60);
  const m = mins % 60;
  return [d && `${d}d`, (d || h) && `${h}h`, `${m}m`].filter(Boolean).join(" ");
}
