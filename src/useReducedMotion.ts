import { useState, useEffect } from "react";
export function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => document.documentElement.dataset.arcadeMotion === "reduced" || matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(document.documentElement.dataset.arcadeMotion === "reduced" || media.matches);
    change();
    window.addEventListener("pg-arcade-preferences", change);
    media.addEventListener("change", change);
    return () => { media.removeEventListener("change", change); window.removeEventListener("pg-arcade-preferences", change); };
  }, []);
  return reduced;
}
