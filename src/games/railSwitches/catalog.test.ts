import {describe,it,expect} from "vitest";
import {games} from "../../lib/catalog";
import {CATALOG_SIZE} from "../../lib/catalogRelease";
import {gameCapabilities} from "../../lib/gameCapabilities";
import {gameHelp} from "../../lib/gameHelp";
import {recordUnits} from "../../lib/recordUnits";
import {modeTags} from "../../lib/smartDiscovery";
describe("Trilhos Cruzados: contrato de catálogo",()=>{
 it("registra 112 IDs únicos e partida local acessível",()=>{
  expect(CATALOG_SIZE).toBe(112);
  expect(games).toHaveLength(112);
  expect(new Set(games.map(g=>g.id)).size).toBe(112);
  expect(recordUnits.trilhos).toBe("pontos");
  expect(gameHelp.trilhos.length).toBeGreaterThan(100);
 });
 it("expõe somente suporte real para uma pessoa",()=>{
  expect(gameCapabilities("trilhos")).toMatchObject({solo:true,online:false,localPlayers:1,bot:false,timedSessions:false,swipe:false});
  expect(modeTags(games.find(g=>g.id==="trilhos")!)).toEqual(["classico","sem-pressa"]);
 });
});
