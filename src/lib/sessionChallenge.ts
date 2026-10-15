import { addScopedRecord, type ScopedRecords } from "./scopedRecords";
export function improvedSessionRecords(game: string, session: string, before: ScopedRecords, after: ScopedRecords) {
  return Object.entries(after).filter(([key, score]) => key.startsWith(`${game}|${session}|`) && addScopedRecord(before, key, score) !== before).length;
}
export function improvedGeneralRecord(game: string, before: number, after: number) {
  return after > 0 && (game === "memoria" || game === "puzzle" ? !before || after < before : after > before);
}
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
