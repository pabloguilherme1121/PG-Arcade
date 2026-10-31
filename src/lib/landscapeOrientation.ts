import { newGames } from "./newCatalog";
import { expandedGames } from "./expandedCatalog";
/** Rotation is optional: unsupported/denied APIs must never prevent play or exit. */
function lockOrientation(value: "portrait" | "landscape" | null): () => void {
  if (!value) return () => {};
  const orientation = screen.orientation as ScreenOrientation & {
    lock?: (value: "portrait" | "landscape") => Promise<void>;
  };
  if (!orientation?.lock || typeof matchMedia !== "function" || !matchMedia("(pointer: coarse)").matches) return () => {};
  let disposed = false;
  let locked = false;
  const unlock = () => { try { orientation.unlock(); } catch { /* Unsupported browser. */ } };
  try {
    void orientation.lock(value).then(() => {
      locked = true;
      if (disposed) unlock();
    }).catch(() => undefined);
  } catch { /* Older implementations may throw synchronously. */ }
  return () => { disposed = true; if (locked) unlock(); };
}

export type OrientationPreference = "auto" | "portrait" | "landscape";
const key = "pg-arcade-orientation-v1";
const wideGames = new Set<string>([...newGames.filter(game => game.family === "motion").map(game => game.id), ...expandedGames.filter(game => game.family === "action").map(game => game.id),"corrida", "futebol", "rally", "coleta", "orbital", "tiro", "estrelas", "runner", "voo", "jetpack", "esquiva", "drift", "invasores", "asteroides", "breakout", "pong", "pouso", "ski", "rhythm", "balloons"]);
export function gameOrientation(gameId: string, preference: OrientationPreference): "portrait" | "landscape" | null {
  return preference !== "auto" ? preference : wideGames.has(gameId) ? "landscape" : null;
}
let sessionPreference: OrientationPreference | undefined;
export function readOrientationPreference(): OrientationPreference {
  if (sessionPreference) return sessionPreference;
  try { const value = localStorage.getItem(key); return value === "portrait" || value === "landscape" ? value : "auto"; }
  catch { return "auto"; }
}
export function saveOrientationPreference(value: OrientationPreference) {
  sessionPreference = value;
  try { localStorage.setItem(key, value); } catch { /* Keep working without storage. */ }
  window.dispatchEvent(new Event("pg-arcade-orientation"));
}
export function preferGameOrientation(gameId: string) {
  return lockOrientation(gameOrientation(gameId, sessionPreference ?? readOrientationPreference()));
}
/** Compatibility for existing callers; game players use the per-game policy. */
export const preferLandscape = () => lockOrientation("landscape");
