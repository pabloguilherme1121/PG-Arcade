import { expect, it } from "vitest";
import { games } from "../../lib/catalog";
import { CATALOG_SIZE } from "../../lib/catalogRelease";
import { gameCapabilities } from "../../lib/gameCapabilities";
import { gameHelp } from "../../lib/gameHelp";
import { recordUnits } from "../../lib/recordUnits";
import { modeTags } from "../../lib/smartDiscovery";
it("Defensor de Meteoros #132 registra um motor isolado sem temporizador real", () => {
  expect(CATALOG_SIZE).toBe(132);
  expect(games).toHaveLength(CATALOG_SIZE);
  expect(new Set(games.map(g => g.id)).size).toBe(CATALOG_SIZE);
  expect(gameHelp.meteoros.length).toBeGreaterThan(100);
  expect(recordUnits.meteoros).toBe("pontos");
  expect(gameCapabilities("meteoros")).toMatchObject({
    solo: true, online: false, bot: false, localPlayers: 1, timedSessions: false, swipe: false,
  });
  expect(modeTags(games.find(g => g.id === "meteoros")!)).toEqual(["classico", "sem-pressa"]);
});
