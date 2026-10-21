import { useGameActivity } from "./RecordScope";
import { useEffect, useLayoutEffect, useRef } from "react";
export type PlayStatus = "ready" | "running" | "paused" | "done";
export function useAutoPause(pause: () => void, active?: boolean, complete = false, score = 0) {
  useGameActivity(active, complete, score);
  const latestPause = useRef(pause);
  useLayoutEffect(() => { latestPause.current = pause; }, [pause]);
  useEffect(() => {
    const pause = () => latestPause.current();
    const hidden = () => {
      if (document.hidden) pause();
    };
    window.addEventListener("blur", pause);
    window.addEventListener("pg-arcade-pause", pause);
    document.addEventListener("visibilitychange", hidden);
    // PWA/BFCache lifecycle signals can arrive without a preceding blur.
    window.addEventListener("pagehide", pause);
    document.addEventListener("freeze", pause);
    return () => {
      window.removeEventListener("blur", pause);
      window.removeEventListener("pg-arcade-pause", pause);
      document.removeEventListener("visibilitychange", hidden);
      window.removeEventListener("pagehide", pause);
      document.removeEventListener("freeze", pause);
    };
  }, []);
}
