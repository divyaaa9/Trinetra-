import { useEffect, useState } from "react";

/** Re-renders every `ms` so countdown text stays fresh. Eligibility itself is always computed from stored timestamps. */
export function useNow(ms = 30000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return now;
}
