import {describe,expect,it} from "vitest";
import {games} from "../../lib/catalog";
import {CATALOG_SIZE} from "../../lib/catalogRelease";
import {gameCapabilities} from "../../lib/gameCapabilities";
import {filterByMode,modeTags} from "../../lib/smartDiscovery";
import {recordUnits} from "../../lib/recordUnits";
import {gameHelp} from "../../lib/gameHelp";
describe("Contrato das Cores: catálogo verídico",()=>{
  it("mantém 129 IDs únicos e permite salvar pontuação",()=>{
    expect(CATALOG_SIZE).toBe(129);
    expect(games).toHaveLength(129);
    expect(new Set(games.map(g=>g.id)).size).toBe(129);
    expect(recordUnits.contrato).toBe("pontos");
    expect(gameHelp.contrato).toContain("quatro escolhas");
  });
  it("habilita apenas grupo local sem bot nem online",()=>{
    const game=games.find(g=>g.id==="contrato")!;
    expect(gameCapabilities("contrato")).toMatchObject({
      solo:false,online:false,bot:false,localPlayers:4,timedSessions:false,
    });
    expect(modeTags(game)).toEqual(["classico","sem-pressa","dupla","grupo"]);
    expect(filterByMode(games,"grupo",{},[]).map(g=>g.id)).toContain("contrato");
  });
});
