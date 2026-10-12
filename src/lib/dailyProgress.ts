import { isGameId, type GameId } from "./catalog";

// Independent from pg-arcade-progress-v1: previous aggregate visits cannot be assigned dates.
export const dailyStorageKey = "pg-arcade-daily-v1";
export type DailyActivity = { version: 1; days: Record<string, Partial<Record<GameId, number>>> };
type DailyStore = Pick<Storage, "getItem" | "setItem">;
const MAX_DAYS = 400;
const dayPattern = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export const emptyDailyActivity = (): DailyActivity => ({ version: 1, days: {} });

function localDay(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}
function validDay(day: string): boolean {
  if (!dayPattern.test(day)) return false;
  const [year, month, date] = day.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, date));
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === day;
}

export function normalizeDailyActivity(raw: unknown): DailyActivity {
  const clean = emptyDailyActivity();
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return clean;
  const data = raw as Record<string, unknown>;
  if (data.version !== 1 || !data.days || typeof data.days !== "object" || Array.isArray(data.days)) return clean;
  const days = data.days as Record<string, unknown>;
  for (const key of Object.keys(days).filter(validDay).sort().reverse().slice(0, MAX_DAYS)) {
    const visits = days[key];
    if (!visits || typeof visits !== "object" || Array.isArray(visits)) continue;
    const counts: Partial<Record<GameId, number>> = {};
    for (const [id, count] of Object.entries(visits)) {
      if (isGameId(id) && typeof count === "number" && Number.isFinite(count) && count >= 1)
        counts[id] = Math.min(Number.MAX_SAFE_INTEGER, Math.floor(count));
    }
    if (Object.keys(counts).length) clean.days[key] = counts;
  }
  return clean;
}

export function addDailyVisit(activity: DailyActivity, game: GameId, now: Date): DailyActivity {
  if (!Number.isFinite(now.getTime())) return normalizeDailyActivity(activity);
  const next = normalizeDailyActivity(activity);
  const key = localDay(now);
  const count = next.days[key]?.[game] ?? 0;
  next.days[key] = { ...(next.days[key] ?? {}), [game]: Math.min(Number.MAX_SAFE_INTEGER, count + 1) };
  return normalizeDailyActivity(next);
}

export function readDailyActivity(store?: DailyStore): DailyActivity {
  try {
    return normalizeDailyActivity(JSON.parse((store ?? localStorage).getItem(dailyStorageKey) ?? "null"));
  } catch {
    return emptyDailyActivity();
  }
}

export function recordDailyVisit(game: GameId, now = new Date(), store?: DailyStore): boolean {
  try {
    const target = store ?? localStorage;
    target.setItem(dailyStorageKey, JSON.stringify(addDailyVisit(readDailyActivity(target), game, now)));
    return true;
  } catch {
    return false;
  }
}

export function summarizeDailyActivity(activity: DailyActivity, now = new Date()) {
  const days = normalizeDailyActivity(activity).days;
  if (!Number.isFinite(now.getTime())) return { visitsToday: 0, uniqueGamesToday: 0, currentStreak: 0 };
  const counts = days[localDay(now)] ?? {};
  const visitsToday = Object.values(counts).reduce<number>((sum, value) => sum + (value ?? 0), 0);
  let currentStreak = 0;
  // Calendar days, not 24-hour intervals: timezone/DST transitions should not break a streak.
  for (let i = 0; i < MAX_DAYS; i++) {
    const previous = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    if (!days[localDay(previous)]) break;
    currentStreak++;
  }
  return { visitsToday, uniqueGamesToday: Object.keys(counts).length, currentStreak };
}
