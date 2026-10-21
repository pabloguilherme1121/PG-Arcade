import {describe,expect,it} from "vitest";
import {games} from "../../lib/catalog";
import {CATALOG_SIZE} from "../../lib/catalogRelease";
import {gameCapabilities} from "../../lib/gameCapabilities";
import {gameHelp} from "../../lib/gameHelp";
import {recordUnits} from "../../lib/recordUnits";
import {modeTags} from "../../lib/smartDiscovery";
describe("Pontes do Arquipélago: catálogo verídico",()=>{
 it("tem 129 títulos únicos, ajuda e recorde",()=>{
  expect(CATALOG_SIZE).toBe(129);expect(games).toHaveLength(129);
  expect(new Set(games.map(g=>g.id)).size).toBe(129);
  expect(recordUnits.arquipelago).toBe("pontos");
  expect(gameHelp.arquipelago.length).toBeGreaterThan(100);
 });
 it("não inventa bot, rede, swipe ou sessões cronometradas",()=>{
  const game=games.find(g=>g.id==="arquipelago")!;
  expect(gameCapabilities("arquipelago")).toMatchObject({solo:true,localPlayers:1,bot:false,online:false,swipe:false,timedSessions:false});
  expect(modeTags(game)).toEqual(["classico","sem-pressa"]);
 });
});