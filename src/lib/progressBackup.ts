import { isGameId } from "./catalog";
import { normalizeProgress } from "./progress";
import { isScopedRecordKey } from "./scopedRecords";
import { isDailyActivityDay, normalizeDailyActivity } from "./dailyProgress";
// Fits the app's complete 400-day calendar, even with maximum safe counts.
export const MAX_PROGRESS_BACKUP_BYTES = 2 * 1024 * 1024;
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
const counts = (value: unknown, scoped = false) => object(value) && Object.entries(value).every(([key, score]) =>
  (scoped ? isScopedRecordKey(key) : isGameId(key)) && typeof score === "number" && Number.isSafeInteger(score) && score > 0);
/** Validate before merging: a corrupt backup must not look like a successful restore. */
export function validateProgressBackup(data: unknown): "valid" | "empty" | "invalid" {
  if (!object(data) || !Array.isArray(data.favorites) || !data.favorites.every(isGameId) || !counts(data.records)) return "invalid";
  if (data.visits !== undefined && !counts(data.visits)) return "invalid";
  if (data.recordsV2 !== undefined && !counts(data.recordsV2, true)) return "invalid";
  if (data.last !== undefined && data.last !== null && !isGameId(data.last)) return "invalid";
  if (data.dailyActivity !== undefined && (!object(data.dailyActivity) || data.dailyActivity.version !== 1 || !object(data.dailyActivity.days))) return "invalid";
  if (data.dailyActivity !== undefined) {
    const days = (data.dailyActivity as Record<string, unknown>).days as Record<string, unknown>;
    for (const [day, values] of Object.entries(days)) {
      if (!isDailyActivityDay(day) || !counts(values)) return "invalid";
    }
  }
  const progress = normalizeProgress(data);
  const daily = normalizeDailyActivity(data.dailyActivity);
  return progress.favorites.length || Object.keys(progress.records).length || Object.keys(progress.visits).length || Object.keys(progress.recordsV2 || {}).length || Object.keys(daily.days).length ? "valid" : "empty";
}
