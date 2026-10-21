import { expect, it } from "vitest";
import { games } from "../../lib/catalog";
import { CATALOG_SIZE } from "../../lib/catalogRelease";
import { gameCapabilities } from "../../lib/gameCapabilities";
import { gameHelp } from "../../lib/gameHelp";
import { modeTags } from "../../lib/smartDiscovery";
import { recordUnits } from "../../lib/recordUnits";

it("Rede de Relés #129 é jogo único, solo e sem cronômetro", () => {
  expect(CATALOG_SIZE).toBe(games.length);
  expect(games).toHaveLength(CATALOG_SIZE);
  expect(new Set(games.map(game => game.id)).size).toBe(CATALOG_SIZE);
  expect(gameHelp.reles.length).toBeGreaterThan(100);
  expect(recordUnits.reles).toBe("pontos");
  expect(gameCapabilities("reles")).toMatchObject({
    solo: true, bot: false, online: false, localPlayers: 1, swipe: false, timedSessions: false,
  });
  expect(modeTags(games.find(game => game.id === "reles")!)).toEqual(["classico", "sem-pressa"]);
});
