import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, Camera, CameraOff, CheckCircle2, RefreshCw, XCircle } from "lucide-react";
import { useCamera } from "../../lib/useCamera";
import { usePoseTracker } from "../../lib/poseTracker";
import {
  NOT_VISIBLE, evaluatePose, landmarksToJoints, newSession, smoothJoints, stepSession,
  type Landmark, type Outcome, type SessionState, type TargetPose, type TrackedJoints,
} from "../../lib/poseEval";
import { POSTURE_MARKS, type PostureResult } from "../../lib/scoring";
import AvatarFigure from "./AvatarFigure";
import { Notice, ProgressBar } from "../ui";

type Step = "intro" | "prep" | "demo" | "countdown" | "tracking" | "result";
interface Live { visible: boolean; match: number; matched: boolean; worst?: string }

const DEMO_MS = 6500;
const RESULT_MS = 2200;
const FAIL_TEXT: Record<"mismatch" | "not-visible", string> = {
  mismatch: "Your pose did not match closely enough in time.",
  "not-visible": "Not enough of your body was visible to evaluate this posture.",
};

export default function PostureSection({
  poses, onFinish, onExit,
}: { poses: TargetPose[]; onFinish: (r: PostureResult[]) => void; onExit: () => void }) {
  const camera = useCamera();
  const [step, setStep] = useState<Step>("intro");
  const [index, setIndex] = useState(0);
  const [live, setLive] = useState<Live>({ visible: false, match: 0, matched: false });
  const [hold, setHold] = useState(0);
  const [count, setCount] = useState(3);
  const [playKey, setPlayKey] = useState(0);
  const [feedback, setFeedback] = useState<"idle" | "success" | "fail">("idle");
  const [message, setMessage] = useState("");

  const indexRef = useRef(0);
  const trackingRef = useRef(false);
  const sessionRef = useRef<SessionState>(newSession());
  const jointsRef = useRef<TrackedJoints | null>(null);
  const resultsRef = useRef<PostureResult[]>([]);
  const timerRef = useRef<number | undefined>(undefined);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;
  const { stop: stopCamera } = camera;

  const pose = poses[index];
  const camOn = camera.status === "active";

  const finishPose = useCallback((outcome: Outcome) => {
    if (!trackingRef.current || outcome.kind === "pending") return;
    trackingRef.current = false; // award/fail exactly once per posture
    const i = indexRef.current;
    const p = poses[i];
    const s = sessionRef.current;
    const passed = outcome.kind === "success";
    const reason = outcome.kind === "success" ? "matched" : outcome.reason;
    const detail = passed ? undefined
      : reason === "mismatch" ? `${FAIL_TEXT.mismatch} Check your ${s.lastWorst ?? "pose"}. ${p.hint}`
      : FAIL_TEXT["not-visible"];
    resultsRef.current = [...resultsRef.current, {
      poseId: p.id, passed, marks: passed ? POSTURE_MARKS : 0, reason, bestMatch: s.bestMatch, detail,
    }];
    setFeedback(passed ? "success" : "fail");
    setMessage(passed ? `Matched! +${POSTURE_MARKS} marks` : detail ?? "");
    setStep("result");
    timerRef.current = window.setTimeout(() => {
      const next = i + 1;
      if (next >= poses.length) {
        stopCamera();
        onFinishRef.current(resultsRef.current);
      } else {
        indexRef.current = next;
        setIndex(next); setFeedback("idle"); setMessage(""); setHold(0);
        setPlayKey((k) => k + 1);
        setStep("demo");
      }
    }, RESULT_MS);
  }, [poses, stopCamera]);

  const onLandmarks = useCallback((lm: Landmark[] | null, aspect: number, ts: number) => {
    const joints = lm ? smoothJoints(jointsRef.current, landmarksToJoints(lm, aspect)) : null;
    jointsRef.current = joints;
    const target = poses[indexRef.current];
    const res = joints ? evaluatePose(joints, target) : NOT_VISIBLE;
    const next: Live = { visible: res.status === "visible", match: res.match, matched: res.matched, worst: res.worstLabel };
    setLive((prev) =>
      prev.visible === next.visible && prev.matched === next.matched && Math.abs(prev.match - next.match) < 0.02 ? prev : next);
    if (trackingRef.current) {
      const { state, outcome } = stepSession(sessionRef.current, ts, res, target.match);
      sessionRef.current = state;
      setHold(Math.min(1, state.holdMs / target.match.holdMs));
      finishPose(outcome);
    }
  }, [poses, finishPose]);

  const tracker = usePoseTracker(camera.videoRef, camOn, onLandmarks);

  useEffect(() => { if (camera.status === "active" && step === "intro") setStep("prep"); }, [camera.status, step]);
  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  useEffect(() => {
    if (step !== "demo") return;
    const t = window.setTimeout(() => setStep("countdown"), DEMO_MS);
    return () => window.clearTimeout(t);
  }, [step, index]);

  useEffect(() => {
    if (step !== "countdown") return;
    let n = 3;
    setCount(3);
    const iv = window.setInterval(() => {
      n -= 1;
      if (n <= 0) {
        window.clearInterval(iv);
        sessionRef.current = newSession();
        trackingRef.current = true;
        setStep("tracking");
      } else setCount(n);
    }, 1000);
    return () => window.clearInterval(iv);
  }, [step, index]);

  const camProblem = ["denied", "unavailable", "error", "unsupported"].includes(camera.status);
  const state = feedback === "success" ? "success" : feedback === "fail" ? "fail" : "neutral";

  /* ---------- left card ---------- */
  let left: ReactNode;
  if (step === "intro" || camProblem) {
    left = (
      <div className="cn-card">
        <h2>Camera check</h2>
        <p className="cn-muted" style={{ margin: "10px 0 16px" }}>
          Next, you will copy three postures shown by an animated figure. Your camera is used only to
          compare your body position with the figure. Video stays on your device: it is never recorded,
          saved or uploaded, and the microphone is not used.
        </p>
        <ul className="cn-tips">
          <li>Stand far enough back that your whole body, head to feet, is in the picture.</li>
          <li>Use a well-lit room and keep the space around you clear.</li>
          <li>Every posture is gentle and safe. No strikes or risky movements.</li>
        </ul>
        {camera.status === "denied" && (
          <Notice><strong>Camera access was blocked.</strong> Allow the camera for this site in your browser settings, then choose Retry Permission.</Notice>
        )}
        {camera.status === "unavailable" && <Notice><strong>No camera was found.</strong> Connect a camera or close apps that are using it, then choose Retry Camera.</Notice>}
        {camera.status === "error" && <Notice><strong>The camera could not start.</strong> It may be in use by another app. Choose Retry Camera.</Notice>}
        {camera.status === "unsupported" && <Notice><strong>This browser can’t access a camera.</strong> Try a current version of Chrome, Edge, Firefox or Safari on a secure (https or localhost) page.</Notice>}
        <div className="cn-actions">
          {camera.status === "unsupported" ? null : (
            <button type="button" className="cn-btn" onClick={camera.start} disabled={camera.status === "requesting"}>
              {camera.status === "denied" ? <RefreshCw size={16} aria-hidden="true" /> : <Camera size={16} aria-hidden="true" />}
              {camera.status === "requesting" ? "Waiting for permission…"
                : camera.status === "denied" ? "Retry Permission"
                : camera.status === "unavailable" || camera.status === "error" ? "Retry Camera" : "Enable camera"}
            </button>
          )}
          <button type="button" className="cn-btn cn-btn-ghost" onClick={onExit}>Cancel / Exit</button>
        </div>
      </div>
    );
  } else if (step === "prep") {
    const ready = tracker.status === "ready" && live.visible;
    left = (
      <div className="cn-card">
        <h2>Get into position</h2>
        <p className="cn-muted" style={{ margin: "10px 0 16px" }}>
          Step back until your full body, including your feet, is inside the frame.
        </p>
        {tracker.status === "loading" && <Notice>Loading the pose model… the first load can take a few seconds.</Notice>}
        {tracker.status === "error" && (
          <Notice>
            <strong>The pose model could not be loaded.</strong> Check your connection and the setup steps, then retry.{" "}
            <button type="button" className="cn-btn cn-btn-ghost cn-btn-sm" onClick={tracker.retry}>Retry</button>
          </Notice>
        )}
        {tracker.status === "ready" && (
          <p className="cn-status" data-ok={live.visible}>
            {live.visible ? <CheckCircle2 size={18} aria-hidden="true" /> : <AlertTriangle size={18} aria-hidden="true" />}
            {live.visible ? "Full body visible. You’re ready." : "Move back until your full body is visible."}
          </p>
        )}
        <div className="cn-actions">
          <button type="button" className="cn-btn" disabled={!ready} onClick={() => { setStep("demo"); setPlayKey((k) => k + 1); }}>
            Start posture challenges
          </button>
          <button type="button" className="cn-btn cn-btn-ghost" onClick={onExit}>Cancel / Exit</button>
        </div>
      </div>
    );
  } else {
    left = (
      <div className="cn-card cn-avatar-card">
        <div className="cn-meta" style={{ justifyContent: "space-between" }}>
          <span className="cn-pill">Posture {index + 1} of {poses.length}</span>
          <span className="cn-pill">{POSTURE_MARKS} marks</span>
        </div>
        <h2 style={{ marginTop: 10 }}>{pose.name}</h2>
        <AvatarFigure pose={pose} playKey={playKey} feedback={feedback} />
        <p>{pose.instruction}</p>
        {step === "demo" && (
          <div className="cn-actions">
            <span className="cn-small cn-muted">Watch the demonstration, then copy it. Recognition starts automatically.</span>
            <button type="button" className="cn-btn cn-btn-ghost cn-btn-sm" onClick={() => setStep("countdown")}>Start now</button>
          </div>
        )}
        {step === "countdown" && <p className="cn-count" aria-live="assertive">Get ready… {count}</p>}
        {step === "tracking" && (
          <div aria-live="polite">
            <ProgressBar value={hold * 100} label="Hold progress" />
            <p className="cn-small cn-muted" style={{ marginTop: 6 }}>Hold the posture steadily for a moment.</p>
          </div>
        )}
      </div>
    );
  }

  /* ---------- camera frame (always mounted so the video element exists) ---------- */
  const chip =
    step === "result" && feedback === "success" ? (<><CheckCircle2 size={18} aria-hidden="true" /> {message}</>)
    : step === "result" && feedback === "fail" ? (<><XCircle size={18} aria-hidden="true" /> Not matched · 0 marks</>)
    : camOn && tracker.status === "ready" && !live.visible ? (<><AlertTriangle size={18} aria-hidden="true" /> Move back until your full body is visible</>)
    : step === "tracking" ? (<>Matching… {Math.round(live.match * 100)}%</>)
    : null;

  return (
    <div>
      <Notice>
        Pose matching is an approximate visual comparison. It is not a professional assessment or certification of self-defence skill and can be affected by lighting, clothing and camera angle.
      </Notice>
      <div className="cn-split" style={{ marginTop: 16 }}>
        {left}
        <div>
          <div className="cn-camera" data-state={state}>
            <video ref={camera.videoRef} className="cn-video" playsInline muted autoPlay aria-label="Your live camera preview" />
            {!camOn && <div className="cn-camera-off"><CameraOff size={28} aria-hidden="true" /><span>Camera is off</span></div>}
          </div>
          <div className="cn-camera-chip" data-state={state} role="status">{chip ?? " "}</div>
          {step === "result" && feedback === "fail" && <p className="cn-small" style={{ marginTop: 8 }}>{message}</p>}
        </div>
      </div>
    </div>
  );
}
