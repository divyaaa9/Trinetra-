import type { Attempt } from "./scoring";

/**
 * Client-side persistence only (localStorage). Clearing browser data resets
 * attempts and the seven-day lock, so this is NOT tamper-proof.
 */
const KEY = "trinetra.netra2.assessment-attempts.v1";
let memory: Record<string, Attempt[]> = {};

function read(): Record<string, Attempt[]> {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, Attempt[]>) : {};
  } catch {
    return memory;
  }
}
function write(data: Record<string, Attempt[]>) {
  memory = data;
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* storage unavailable */ }
}

export const getAttempts = (assessmentId: string): Attempt[] => read()[assessmentId] ?? [];

/** Idempotent: a given attempt id is stored (and its XP counted) only once. */
export function saveAttempt(a: Attempt): boolean {
  const data = read();
  const list = data[a.assessmentId] ?? [];
  if (list.some((x) => x.id === a.id)) return false;
  data[a.assessmentId] = [...list, a];
  write(data);
  return true;
}

/** XP earned from assessment attempts completed since `sinceMs`. */
export function getAssessmentXpSince(sinceMs: number): number {
  return Object.values(read())
    .flat()
    .filter((a) => a.completedAt >= sinceMs)
    .reduce((s, a) => s + a.xpAwarded, 0);
}
