import {describe,expect,it} from "vitest";
import {games} from "../../lib/catalog";
import {CATALOG_SIZE} from "../../lib/catalogRelease";
import {gameCapabilities} from "../../lib/gameCapabilities";
import {gameHelp} from "../../lib/gameHelp";
import {recordUnits} from "../../lib/recordUnits";
import {modeTags} from "../../lib/smartDiscovery";
describe("109º jogo — Engrenagens do Tempo",()=>{
  it("inclui exatamente um ID novo, capa, instruções e pontuação",()=>{
    expect(CATALOG_SIZE).toBe(111);
    expect(games).toHaveLength(CATALOG_SIZE);
    expect(new Set(games.map(g=>g.id)).size).toBe(111);
    expect(games.find(g=>g.id==="engrenagens")?.name).toBe("Engrenagens do Tempo");
    expect(gameHelp.engrenagens.length).toBeGreaterThan(100);
    expect(recordUnits.engrenagens).toBe("pontos");
  });
  it("declara apenas solo, sem cronômetro, grupo ou bot",()=>{
    const game=games.find(g=>g.id==="engrenagens")!;
    expect(gameCapabilities("engrenagens")).toMatchObject({
      solo:true,online:false,timedSessions:false,localPlayers:1,bot:false,swipe:false,
    });
    expect(modeTags(game)).toEqual(["classico","sem-pressa"]);
  });
});