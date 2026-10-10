import { useCallback, useEffect, useRef, useState } from "react";

export type CameraStatus = "idle" | "requesting" | "active" | "denied" | "unavailable" | "error" | "unsupported";

/** Camera only (audio: false). Frames are never recorded, saved or uploaded. */
export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mounted = useRef(true);
  const [status, setStatus] = useState<CameraStatus>("idle");

  const releaseTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const stop = useCallback(() => {
    releaseTracks();
    if (mounted.current) setStatus("idle");
  }, [releaseTracks]);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      return;
    }
    releaseTracks();
    setStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      if (!mounted.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.getVideoTracks()[0]?.addEventListener("ended", () => mounted.current && setStatus("error"));
      streamRef.current = stream;
      setStatus("active");
    } catch (e) {
      const name = (e as DOMException)?.name;
      if (name === "NotAllowedError" || name === "SecurityError") setStatus("denied");
      else if (name === "NotFoundError" || name === "OverconstrainedError" || name === "DevicesNotFoundError") setStatus("unavailable");
      else setStatus("error");
    }
  }, [releaseTracks]);

  // Attach the stream once the <video> element exists.
  useEffect(() => {
    const v = videoRef.current;
    const s = streamRef.current;
    if (status === "active" && v && s) {
      v.srcObject = s;
      v.play().catch(() => undefined);
    }
  }, [status]);

  // Always stop camera tracks when the component using this hook unmounts.
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      releaseTracks();
    };
  }, [releaseTracks]);

  return { videoRef, status, start, stop };
}
