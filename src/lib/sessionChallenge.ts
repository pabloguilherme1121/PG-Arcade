export type SessionMode = "free" | "sprint" | "marathon";
export type SessionLevel = "easy" | "normal" | "hard";
export function sessionSeconds(mode: SessionMode, level: SessionLevel) {
  if (mode === "free") return Infinity;
  return (mode === "sprint" ? { easy: 180, normal: 120, hard: 60 } : { easy: 600, normal: 300, hard: 180 })[level];
}
export function formatSessionTime(seconds: number) {
  const rounded = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(rounded / 60)}:${String(rounded % 60).padStart(2, "0")}`;
}
