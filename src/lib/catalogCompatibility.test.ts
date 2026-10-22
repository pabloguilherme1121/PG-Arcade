import { describe, expect, it } from "vitest";
import { games, isGameId } from "./catalog";
import { CATALOG_SIZE } from "./catalogRelease";
import { legacyCatalogIds } from "./legacyCatalogIds";
import { emptyProgress, mergeProgress, normalizeProgress } from "./progress";
import { validateProgressBackup } from "./progressBackup";
import { normalizeDailyActivity } from "./dailyProgress";
import { players } from "../GamePlayer";

describe("catalog compatibility across integrations (issue #173)", () => {
  it("keeps every frozen historical ID exactly once with one registered player", () => {
    expect(legacyCatalogIds).toHaveLength(101);
    expect(new Set(legacyCatalogIds).size).toBe(101);
    for (const id of legacyCatalogIds) {
      expect(isGameId(id), id).toBe(true);
      expect(games.filter(game => game.id === id), id).toHaveLength(1);
    }
    expect(games).toHaveLength(CATALOG_SIZE);
    expect(new Set(games.map(game => game.id)).size).toBe(CATALOG_SIZE);
    expect(Object.keys(players).sort()).toEqual(games.map(game => game.id).sort());
  });

  it("restores favorites, visits, records and the last route for all 101 historical IDs", () => {
    const visits = Object.fromEntries(legacyCatalogIds.map((id, i) => [id, i + 1]));
    const records = Object.fromEntries(legacyCatalogIds.map((id, i) => [id, i + 100]));
    for (const last of legacyCatalogIds) {
      const backup = { favorites: [...legacyCatalogIds], visits, records, last };
      expect(validateProgressBackup(backup)).toBe("valid");
      expect(normalizeProgress(backup)).toEqual(backup);
      expect(mergeProgress(emptyProgress(), JSON.parse(JSON.stringify(backup)))).toEqual(backup);
    }
    const daily = { version: 1 as const, days: { "2026-10-22": visits } };
    expect(normalizeDailyActivity(daily)).toEqual(daily);
  });
});
