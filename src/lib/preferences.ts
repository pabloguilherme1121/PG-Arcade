export const preferencesKey = "pg-arcade-preferences-v1";
export type Preferences = { contrast: boolean; motion: "system" | "reduced" };
export function normalizePreferences(raw: unknown): Preferences {
  const data = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  return { contrast: data.contrast === true, motion: data.motion === "reduced" ? "reduced" : "system" };
}
export function readPreferences(): Preferences {
  try { return normalizePreferences(JSON.parse(localStorage.getItem(preferencesKey) || "null")); }
  catch { return normalizePreferences(null); }
}
export function applyPreferences(value: Preferences) {
  document.documentElement.dataset.arcadeContrast = String(value.contrast);
  document.documentElement.dataset.arcadeMotion = value.motion;
  window.dispatchEvent(new Event("pg-arcade-preferences"));
  try { localStorage.setItem(preferencesKey, JSON.stringify(value)); } catch { /* Session preferences still work. */ }
}
