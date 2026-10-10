/**
 * Pure pose-evaluation logic (no React, no camera). Shared by the avatar
 * demonstration and the live evaluator so both use the SAME target pose.
 * Pose matching is an approximate visual comparison of limb directions.
 */

export type JointName =
  | "nose" | "lShoulder" | "rShoulder" | "lElbow" | "rElbow" | "lWrist" | "rWrist"
  | "lHip" | "rHip" | "lKnee" | "rKnee" | "lAnkle" | "rAnkle";

export interface Point { x: number; y: number }
export type Joints = Record<JointName, Point>;

export interface PoseMatchConfig {
  /** Mean limb score (0–1) required to count as matching. */
  threshold: number;
  /** Continuous time the pose must stay matched. */
  holdMs: number;
  /** Max time (while the body is visible) before the attempt fails. */
  maxAttemptMs: number;
  /** No single limb may be further than this from the target. */
  maxSegmentDiffDeg: number;
}

export interface TargetPose {
  id: string;
  name: string;
  instruction: string;
  hint: string;
  /** Screen/mirror coordinates, x right, y down, both 0–1 on a square canvas. */
  joints: Joints;
  match: PoseMatchConfig;
}

export interface Landmark { x: number; y: number; visibility?: number }
export interface TrackedJoint extends Point { v: number; inFrame: boolean }
export type TrackedJoints = Partial<Record<JointName, TrackedJoint>>;

export const JOINT_NAMES: JointName[] = [
  "nose", "lShoulder", "rShoulder", "lElbow", "rElbow", "lWrist", "rWrist",
  "lHip", "rHip", "lKnee", "rKnee", "lAnkle", "rAnkle",
];

export const SEGMENTS: { id: string; a: JointName; b: JointName; label: string }[] = [
  { id: "lUpperArm", a: "lShoulder", b: "lElbow", label: "left upper arm" },
  { id: "lForearm", a: "lElbow", b: "lWrist", label: "left forearm" },
  { id: "rUpperArm", a: "rShoulder", b: "rElbow", label: "right upper arm" },
  { id: "rForearm", a: "rElbow", b: "rWrist", label: "right forearm" },
  { id: "lThigh", a: "lHip", b: "lKnee", label: "left thigh" },
  { id: "lShin", a: "lKnee", b: "lAnkle", label: "left shin" },
  { id: "rThigh", a: "rHip", b: "rKnee", label: "right thigh" },
  { id: "rShin", a: "rKnee", b: "rAnkle", label: "right shin" },
];

/** MediaPipe Pose landmark indices. "left" = the person's own left. */
const MP_INDEX: Record<JointName, number> = {
  nose: 0, lShoulder: 11, rShoulder: 12, lElbow: 13, rElbow: 14, lWrist: 15, rWrist: 16,
  lHip: 23, rHip: 24, lKnee: 25, rKnee: 26, lAnkle: 27, rAnkle: 28,
};

export const MIN_VISIBILITY = 0.5;
export const TOLERANCE_DEG = 60;
export const HARD_CAP_MS = 30000;

/**
 * Converts camera landmarks to the avatar's coordinate space:
 *  - x is mirrored (the preview is mirrored like a mirror),
 *  - x is scaled by the video aspect ratio so angles are not distorted.
 * Only limb *directions* are compared later, so the result does not depend on
 * how far the person stands from the camera or on body proportions.
 */
export function landmarksToJoints(lm: Landmark[], aspect: number): TrackedJoints {
  const out: TrackedJoints = {};
  for (const name of JOINT_NAMES) {
    const p = lm[MP_INDEX[name]];
    if (!p) continue;
    out[name] = {
      x: (1 - p.x) * aspect,
      y: p.y,
      v: p.visibility ?? 0,
      inFrame: p.x >= -0.02 && p.x <= 1.02 && p.y >= -0.02 && p.y <= 1.02,
    };
  }
  return out;
}

/** Exponential smoothing to stop landmark jitter causing flicker. */
export function smoothJoints(prev: TrackedJoints | null, next: TrackedJoints, alpha = 0.5): TrackedJoints {
  if (!prev) return next;
  const out: TrackedJoints = {};
  for (const n of JOINT_NAMES) {
    const b = next[n];
    const a = prev[n];
    if (!b) continue;
    out[n] = a
      ? { x: a.x + (b.x - a.x) * alpha, y: a.y + (b.y - a.y) * alpha, v: b.v, inFrame: b.inFrame }
      : b;
  }
  return out;
}

const isVisible = (j?: TrackedJoint): j is TrackedJoint => !!j && j.v >= MIN_VISIBILITY && j.inFrame;

export function missingSegments(joints: TrackedJoints): string[] {
  return SEGMENTS.filter((s) => !isVisible(joints[s.a]) || !isVisible(joints[s.b])).map((s) => s.label);
}

const angleOf = (a: Point, b: Point) => (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
const angleDiff = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

export interface PoseEvaluation {
  status: "visible" | "not-visible";
  match: number;
  matched: boolean;
  worstLabel?: string;
}

export const NOT_VISIBLE: PoseEvaluation = { status: "not-visible", match: 0, matched: false };

export function evaluatePose(joints: TrackedJoints, target: TargetPose): PoseEvaluation {
  if (missingSegments(joints).length > 0) return NOT_VISIBLE;
  const diffs = SEGMENTS.map((s) => {
    const ua = joints[s.a] as TrackedJoint;
    const ub = joints[s.b] as TrackedJoint;
    return angleDiff(angleOf(ua, ub), angleOf(target.joints[s.a], target.joints[s.b]));
  });
  const scores = diffs.map((d) => Math.max(0, 1 - d / TOLERANCE_DEG));
  const match = scores.reduce((s, v) => s + v, 0) / scores.length;
  const worst = diffs.indexOf(Math.max(...diffs));
  const { threshold, maxSegmentDiffDeg } = target.match;
  return {
    status: "visible",
    match,
    matched: match >= threshold && diffs.every((d) => d <= maxSegmentDiffDeg),
    worstLabel: SEGMENTS[worst].label,
  };
}

/* ---- attempt timing (hold / timeout), kept pure so it can be tested ---- */

export interface SessionState {
  lastTs: number | null;
  totalMs: number;
  visibleMs: number;
  holdMs: number;
  lastMatchTs: number | null;
  bestMatch: number;
  lastWorst?: string;
}
export type Outcome =
  | { kind: "pending" }
  | { kind: "success" }
  | { kind: "fail"; reason: "mismatch" | "not-visible" };

export const newSession = (): SessionState => ({
  lastTs: null, totalMs: 0, visibleMs: 0, holdMs: 0, lastMatchTs: null, bestMatch: 0,
});

const GRACE_MS = 300;

export function stepSession(
  s: SessionState, now: number, r: PoseEvaluation, cfg: PoseMatchConfig,
): { state: SessionState; outcome: Outcome } {
  const dt = s.lastTs === null ? 0 : Math.min(now - s.lastTs, 200);
  let { visibleMs, holdMs, lastMatchTs, bestMatch, lastWorst } = s;
  const totalMs = s.totalMs + dt;
  const graceOver = lastMatchTs === null || now - lastMatchTs > GRACE_MS;

  if (r.status === "visible") {
    visibleMs += dt;
    bestMatch = Math.max(bestMatch, r.match);
    lastWorst = r.worstLabel;
    if (r.matched) { holdMs += dt; lastMatchTs = now; }
    else if (graceOver) holdMs = 0;
  } else if (graceOver) holdMs = 0;

  const state: SessionState = { lastTs: now, totalMs, visibleMs, holdMs, lastMatchTs, bestMatch, lastWorst };
  let outcome: Outcome = { kind: "pending" };
  if (holdMs >= cfg.holdMs) outcome = { kind: "success" };
  else if (visibleMs >= cfg.maxAttemptMs) outcome = { kind: "fail", reason: "mismatch" };
  else if (totalMs >= HARD_CAP_MS) outcome = { kind: "fail", reason: "not-visible" };
  return { state, outcome };
}
