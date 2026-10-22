import { it, expect } from "vitest";
import { games } from "../../lib/catalog";
import { CATALOG_SIZE } from "../../lib/catalogRelease";
import { gameCapabilities } from "../../lib/gameCapabilities";
import { gameHelp } from "../../lib/gameHelp";
import { recordUnits } from "../../lib/recordUnits";
import { modeTags } from "../../lib/smartDiscovery";
it("Trem Sem Freio #131 possui modo temporal por turnos, sem bot nem cronômetro", () => {
  expect(CATALOG_SIZE).toBe(games.length);
  expect(games).toHaveLength(CATALOG_SIZE);
  expect(new Set(games.map(game => game.id)).size).toBe(CATALOG_SIZE);
  expect(gameHelp.trem.length).toBeGreaterThan(100);
  expect(recordUnits.trem).toBe("pontos");
  expect(gameCapabilities("trem")).toMatchObject({
    solo: true, online: false, bot: false, localPlayers: 1, timedSessions: false, swipe: false,
  });
  expect(modeTags(games.find(game => game.id === "trem")!)).toEqual(["classico", "sem-pressa", "turnos"]);
});
