import { expect, it } from "vitest";
import { emptyDailyActivity, normalizeDailyActivity, addDailyVisit, summarizeDailyActivity,
  readDailyActivity, recordDailyVisit, dailyStorageKey } from "./dailyProgress";

it("starts without inventing days from old aggregate visits", () => {
  expect(normalizeDailyActivity({ visits: { snake: 100 }, records: { snake: 70 } }))
    .toEqual(emptyDailyActivity());
  expect(summarizeDailyActivity(emptyDailyActivity(), new Date(2026, 9, 12)).visitsToday).toBe(0);
});

it("counts actual local-day visits while keeping every game's independent total", () => {
  const today = new Date(2026, 9, 12, 9, 30);
  const activity = addDailyVisit(addDailyVisit(addDailyVisit(emptyDailyActivity(), "snake", today), "2048", today), "snake", today);
  expect(activity.days["2026-10-12"]).toEqual({ snake: 2, "2048": 1 });
  expect(summarizeDailyActivity(activity, today)).toMatchObject({ visitsToday: 3, uniqueGamesToday: 2, currentStreak: 1 });
  expect(emptyDailyActivity().days).toEqual({});
});

it("rejects malformed dates, IDs and counts without accepting fabricated history", () => {
  const activity = normalizeDailyActivity({ version: 1, days: {
    "2026-10-12": { snake: 2.9, memoria: 1, evil: 200, xadrez: -1 },
    "2026-02-30": { snake: 50 }, "__proto__": { snake: 5 },
    "invalid": { snake: 1 }
  } });
  expect(activity.days).toEqual({ "2026-10-12": { snake: 2, memoria: 1 } });
  expect(normalizeDailyActivity({ version: 2, days: activity.days })).toEqual(emptyDailyActivity());
});

it("tolerates blocked local storage and never writes the legacy progress key", () => {
  const state = new Map<string, string>();
  const storage = {
    getItem: (key: string) => state.get(key) ?? null,
    setItem: (key: string, value: string) => { state.set(key, value); },
  };
  expect(recordDailyVisit("snake", new Date(2026, 9, 12), storage)).toBe(true);
  expect(readDailyActivity(storage).days["2026-10-12"]).toEqual({ snake: 1 });
  expect([...state.keys()]).toEqual([dailyStorageKey]);
  const blocked = { getItem: (_: string): string | null => { throw Error("blocked"); },
    setItem: (_: string, __: string): void => { throw Error("blocked"); } };
  expect(readDailyActivity(blocked)).toEqual(emptyDailyActivity());
  expect(recordDailyVisit("snake", new Date(2026, 9, 12), blocked)).toBe(false);
});

it("computes streak across local midnight and safely resets after a gap", () => {
  const d0 = new Date(2026, 9, 10, 23, 45);
  const d1 = new Date(2026, 9, 11, 8, 15);
  const d2 = new Date(2026, 9, 12, 0, 1);
  const activity = addDailyVisit(addDailyVisit(addDailyVisit(emptyDailyActivity(), "2048", d0), "snake", d1), "memoria", d2);
  expect(summarizeDailyActivity(activity, d2).currentStreak).toBe(3);
  expect(summarizeDailyActivity(activity, new Date(2026, 9, 14)).currentStreak).toBe(0);
});
