import { it, expect } from "vitest";
import { games } from "../../lib/catalog";
import { CATALOG_SIZE } from "../../lib/catalogRelease";
import { gameCapabilities } from "../../lib/gameCapabilities";
import { gameHelp } from "../../lib/gameHelp";
import { recordUnits } from "../../lib/recordUnits";
import { modeTags } from "../../lib/smartDiscovery";
it("Fortalezas de Turnos #130 possui motor, ajuda, acessibilidade e modos verídicos", () => {
  expect(CATALOG_SIZE).toBe(games.length);
  expect(games).toHaveLength(CATALOG_SIZE);
  expect(new Set(games.map(g => g.id)).size).toBe(CATALOG_SIZE);
  expect(gameHelp.fortalezas.length).toBeGreaterThan(100);
  expect(recordUnits.fortalezas).toBe("pontos");
  expect(gameCapabilities("fortalezas")).toMatchObject({
    solo: true, online: false, bot: false, localPlayers: 1, timedSessions: false, swipe: false,
  });
  expect(modeTags(games.find(g => g.id === "fortalezas")!)).toEqual(["classico", "sem-pressa", "turnos"]);
});
