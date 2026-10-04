import { useEffect } from "react";
export type PlayStatus = "ready" | "running" | "paused" | "done";
export function useAutoPause(pause: () => void) {
  useEffect(() => {
    const hidden = () => {
      if (document.hidden) pause();
    };
    window.addEventListener("blur", pause);
    window.addEventListener("pg-arcade-pause", pause);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      window.removeEventListener("blur", pause);
      window.removeEventListener("pg-arcade-pause", pause);
      document.removeEventListener("visibilitychange", hidden);
    };
  }, [pause]);
}
