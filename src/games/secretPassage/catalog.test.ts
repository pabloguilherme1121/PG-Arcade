import {describe,expect,it} from "vitest";
import {games} from "../../lib/catalog";
import {CATALOG_SIZE} from "../../lib/catalogRelease";
import {gameCapabilities} from "../../lib/gameCapabilities";
import {filterByMode,modeTags} from "../../lib/smartDiscovery";
import {gameHelp} from "../../lib/gameHelp";
import {recordUnits} from "../../lib/recordUnits";
describe("Passagem Secreta catalog contracts",()=>{
  it("preserves 108 unique real titles and records",()=>{
    expect(CATALOG_SIZE).toBe(108);
    expect(games).toHaveLength(CATALOG_SIZE);
    expect(new Set(games.map(g=>g.id)).size).toBe(108);
    expect(recordUnits.passagem).toBe("pontos");
    expect(gameHelp.passagem).toMatch(/simultaneamente/);
  });
  it("filters precisely local groups without pretending a bot, solo or multiplayer online",()=>{
    const mode=gameCapabilities("passagem");
    expect(mode).toMatchObject({solo:false,online:false,localPlayers:4,bot:false,timedSessions:false});
    expect(modeTags(games.find(g=>g.id==="passagem")!)).toEqual(["classico","sem-pressa","dupla","grupo"]);
    expect(filterByMode(games,"grupo",{},[]).map(g=>g.id)).toContain("passagem");
  });
});