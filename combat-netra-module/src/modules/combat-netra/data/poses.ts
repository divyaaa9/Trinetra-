import type { Joints, PoseMatchConfig, TargetPose } from "../lib/poseEval";

/** Single source of truth: the avatar draws these, the evaluator compares to these. */

const match: PoseMatchConfig = { threshold: 0.72, holdMs: 1500, maxAttemptMs: 12000, maxSegmentDiffDeg: 55 };

const J = (p: Record<string, [number, number]>): Joints =>
  Object.fromEntries(Object.entries(p).map(([k, [x, y]]) => [k, { x, y }])) as unknown as Joints;

export const NEUTRAL_JOINTS: Joints = J({
  nose: [0.5, 0.12], lShoulder: [0.4, 0.24], rShoulder: [0.6, 0.24],
  lElbow: [0.37, 0.38], rElbow: [0.63, 0.38], lWrist: [0.36, 0.52], rWrist: [0.64, 0.52],
  lHip: [0.43, 0.52], rHip: [0.57, 0.52], lKnee: [0.44, 0.73], rKnee: [0.56, 0.73],
  lAnkle: [0.44, 0.93], rAnkle: [0.56, 0.93],
});

const guardArms = { lElbow: [0.34, 0.4], rElbow: [0.66, 0.4], lWrist: [0.4, 0.26], rWrist: [0.6, 0.26] } as const;

export const poses: Record<string, TargetPose> = {
  "ready-guard": {
    id: "ready-guard",
    name: "Ready Guard",
    instruction: "Stand with feet about shoulder-width apart. Bend your elbows and bring both hands up near your chin.",
    hint: "Keep your upper arms down and your forearms pointing up.",
    match,
    joints: J({
      nose: [0.5, 0.12], lShoulder: [0.4, 0.24], rShoulder: [0.6, 0.24],
      ...guardArms,
      lHip: [0.43, 0.52], rHip: [0.57, 0.52], lKnee: [0.42, 0.73], rKnee: [0.58, 0.73],
      lAnkle: [0.41, 0.93], rAnkle: [0.59, 0.93],
    }),
  },
  "wide-stance": {
    id: "wide-stance",
    name: "Strong Wide Stance",
    instruction: "Step your feet wide apart, bend your knees slightly outward, and rest both hands on your hips.",
    hint: "Feet clearly wider than your shoulders, elbows out, hands resting on your hips.",
    match,
    joints: J({
      nose: [0.5, 0.12], lShoulder: [0.4, 0.24], rShoulder: [0.6, 0.24],
      lElbow: [0.27, 0.4], rElbow: [0.73, 0.4], lWrist: [0.4, 0.52], rWrist: [0.6, 0.52],
      lHip: [0.43, 0.52], rHip: [0.57, 0.52], lKnee: [0.29, 0.7], rKnee: [0.71, 0.7],
      lAnkle: [0.22, 0.93], rAnkle: [0.78, 0.93],
    }),
  },
  goalpost: {
    id: "goalpost",
    name: "Boundary Posture",
    instruction: "Raise both elbows out to the sides at shoulder height, with forearms pointing straight up, palms open.",
    hint: "Upper arms level with your shoulders, forearms vertical.",
    match,
    joints: J({
      nose: [0.5, 0.12], lShoulder: [0.4, 0.24], rShoulder: [0.6, 0.24],
      lElbow: [0.22, 0.24], rElbow: [0.78, 0.24], lWrist: [0.22, 0.08], rWrist: [0.78, 0.08],
      lHip: [0.43, 0.52], rHip: [0.57, 0.52], lKnee: [0.42, 0.73], rKnee: [0.58, 0.73],
      lAnkle: [0.41, 0.93], rAnkle: [0.59, 0.93],
    }),
  },
};
