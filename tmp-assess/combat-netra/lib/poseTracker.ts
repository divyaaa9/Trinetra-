import { useEffect, useRef, useState } from "react";
import type { PoseLandmarker } from "@mediapipe/tasks-vision";
import type { Landmark } from "./poseEval";

/**
 * Pose estimation: MediaPipe Pose Landmarker (@mediapipe/tasks-vision), running
 * fully in the browser. Setup (see report): copy the package's `wasm` folder to
 * public/mediapipe/wasm. The model file is fetched once from MODEL_URL; to avoid
 * any external request, download it and point MODEL_URL at /models/....
 */
const WASM_BASES = ["/mediapipe/wasm", "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"];
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

export type TrackerStatus = "idle" | "loading" | "ready" | "error";

let cached: Promise<PoseLandmarker> | null = null;

async function load(): Promise<PoseLandmarker> {
  const { FilesetResolver, PoseLandmarker: PL } = await import("@mediapipe/tasks-vision");
  let lastError: unknown;
  for (const base of WASM_BASES) {
    for (const delegate of ["GPU", "CPU"] as const) {
      try {
        const fileset = await FilesetResolver.forVisionTasks(base);
        return await PL.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate },
          runningMode: "VIDEO",
          numPoses: 1,
        });
      } catch (e) {
        lastError = e;
      }
    }
  }
  throw lastError;
}

const getLandmarker = () => {
  cached ??= load().catch((e) => {
    cached = null;
    throw e;
  });
  return cached;
};

/** Calls onFrame with landmarks (or null when no person is detected) for each new video frame. */
export function usePoseTracker(
  videoRef: { current: HTMLVideoElement | null },
  enabled: boolean,
  onFrame: (lm: Landmark[] | null, aspect: number, ts: number) => void,
) {
  const [status, setStatus] = useState<TrackerStatus>("idle");
  const [attempt, setAttempt] = useState(0);
  const cb = useRef(onFrame);
  cb.current = onFrame;

  useEffect(() => {
    if (!enabled) {
      setStatus("idle");
      return;
    }
    let cancelled = false;
    let raf = 0;
    setStatus("loading");
    getLandmarker()
      .then((landmarker) => {
        if (cancelled) return;
        setStatus("ready");
        let lastTime = -1;
        const tick = () => {
          if (cancelled) return;
          const v = videoRef.current;
          if (v && v.readyState >= 2 && v.videoWidth > 0 && v.currentTime !== lastTime) {
            lastTime = v.currentTime;
            try {
              const res = landmarker.detectForVideo(v, performance.now());
              cb.current(res.landmarks[0] ?? null, v.videoWidth / v.videoHeight, performance.now());
            } catch {
              /* skip a bad frame */
            }
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [enabled, videoRef, attempt]);

  return { status, retry: () => setAttempt((a) => a + 1) };
}
