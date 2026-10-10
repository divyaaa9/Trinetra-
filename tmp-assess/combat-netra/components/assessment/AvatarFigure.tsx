import { useEffect, useMemo, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";
import { NEUTRAL_JOINTS } from "../../data/poses";
import { JOINT_NAMES, SEGMENTS, type Joints, type TargetPose } from "../../lib/poseEval";

type Feedback = "idle" | "success" | "fail";

const mix = (a: Joints, b: Joints, t: number): Joints => {
  const out = {} as Joints;
  for (const n of JOINT_NAMES) out[n] = { x: a[n].x + (b[n].x - a[n].x) * t, y: a[n].y + (b[n].y - a[n].y) * t };
  return out;
};

/** 2D animated figure drawn from the SAME joint data the evaluator compares against. */
export default function AvatarFigure({
  pose, playKey = 0, feedback = "idle",
}: { pose: TargetPose; playKey?: number; feedback?: Feedback }) {
  const reduce = useReducedMotion();
  const [t, setT] = useState(0);

  useEffect(() => {
    if (reduce) { setT(1); return; }
    setT(0);
    const controls = animate(0, 1, { duration: 1.8, delay: 0.4, ease: "easeInOut", onUpdate: setT });
    return () => controls.stop();
  }, [pose.id, playKey, reduce]);

  const j = useMemo(() => mix(NEUTRAL_JOINTS, pose.joints, t), [pose, t]);
  const color = feedback === "success" ? "var(--cn-success)" : feedback === "fail" ? "var(--cn-danger)" : "var(--cn-ink)";
  const P = (n: keyof Joints, src: Joints = j) => `${src[n].x * 100},${src[n].y * 100}`;
  const head = { x: j.nose.x * 100, y: j.nose.y * 100 };

  return (
    <svg viewBox="0 0 100 100" className="cn-avatar-svg" role="img"
      aria-label={`Animated demonstration of ${pose.name}. ${pose.instruction}`}>
      {/* faint target outline so the end position is always visible */}
      {SEGMENTS.map((s) => (
        <line key={`g-${s.id}`} x1={pose.joints[s.a].x * 100} y1={pose.joints[s.a].y * 100}
          x2={pose.joints[s.b].x * 100} y2={pose.joints[s.b].y * 100}
          stroke="var(--cn-ink)" strokeOpacity={0.18} strokeWidth={3} strokeDasharray="1.5 3" strokeLinecap="round" />
      ))}
      <polygon points={`${P("lShoulder")} ${P("rShoulder")} ${P("rHip")} ${P("lHip")}`}
        fill={color} fillOpacity={0.14} stroke={color} strokeWidth={1.2} strokeLinejoin="round" />
      <circle cx={head.x} cy={head.y} r={6.5} fill="var(--cn-paper)" stroke={color} strokeWidth={2} />
      {SEGMENTS.map((s) => (
        <line key={s.id} x1={j[s.a].x * 100} y1={j[s.a].y * 100} x2={j[s.b].x * 100} y2={j[s.b].y * 100}
          stroke={color} strokeWidth={4} strokeLinecap="round" />
      ))}
      {JOINT_NAMES.filter((n) => n !== "nose").map((n) => (
        <circle key={n} cx={j[n].x * 100} cy={j[n].y * 100} r={1.8} fill="var(--cn-paper)" stroke={color} strokeWidth={1} />
      ))}
    </svg>
  );
}
