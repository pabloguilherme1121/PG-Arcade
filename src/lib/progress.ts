import { isGameId, type GameId } from "./catalog";
export const storageKey = "pg-arcade-progress-v1";
export type Progress = {
  favorites: GameId[];
  visits: Partial<Record<GameId, number>>;
  records: Partial<Record<GameId, number>>;
  last: GameId | null;
};
export const emptyProgress = (): Progress => ({
  favorites: [],
  visits: {},
  records: {},
  last: null,
});
export function normalizeProgress(raw: unknown): Progress {
  const clean = emptyProgress();
  if (!raw || typeof raw !== "object") return clean;
  const data = raw as Record<string, unknown>;
  if (Array.isArray(data.favorites))
    clean.favorites = [...new Set(data.favorites.filter(isGameId))];
  for (const field of ["visits", "records"] as const)
    if (data[field] && typeof data[field] === "object")
      for (const [key, value] of Object.entries(data[field] as object))
        if (
          isGameId(key) &&
          typeof value === "number" &&
          Number.isFinite(value) &&
          value >= 0
        )
          clean[field][key] = Math.floor(value);
  clean.last = isGameId(data.last) ? data.last : null;
  return clean;
}
export function readProgress() {
  try {
    return normalizeProgress(
      JSON.parse(localStorage.getItem(storageKey) || "null"),
    );
  } catch {
    return emptyProgress();
  }
}
export function saveProgress(progress: Progress) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}
