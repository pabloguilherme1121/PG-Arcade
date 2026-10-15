import { expect, it } from "vitest";
import { validateProgressBackup } from "./progressBackup";
it("rejects malformed structure and unsupported data before merging", () => {
  for (const data of [null, [], { favorites: "snake", records: {} }, { favorites: [], records: [] }, { favorites: ["snake"], records: {}, dailyActivity: { version: 1, days: { "2026-99-99": {} } } }, { favorites: ["unknown"], records: {} }, { favorites: [], records: { snake: -1 } }, { favorites: [], records: {}, recordsV2: { "reflexo|free|unknown": 5 } }]) expect(validateProgressBackup(data)).toBe("invalid");
});
it("distinguishes empty copies and accepts old and configuration-aware backups", () => {
  expect(validateProgressBackup({ favorites: [], records: {} })).toBe("empty");
  expect(validateProgressBackup({ favorites: ["snake"], records: {} })).toBe("valid");
  expect(validateProgressBackup({ favorites: [], records: {}, recordsV2: { "reflexo|free|hard": 4500 } })).toBe("valid");
});
