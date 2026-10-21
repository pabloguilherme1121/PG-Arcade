import {describe,it,expect} from "vitest";
import {games} from "../../lib/catalog";
import {gameCapabilities} from "../../lib/gameCapabilities";
import {modeTags,filterByMode} from "../../lib/smartDiscovery";
import {gameHelp} from "../../lib/gameHelp";
import {recordUnits} from "../../lib/recordUnits";
import {CATALOG_SIZE} from "../../lib/catalogRelease";
describe("Cofre em Equipe — discovery accuracy",()=>{
  it("registers a real new playable title without claiming online, bots or solo",()=>{
    expect(games).toHaveLength(CATALOG_SIZE);
    expect(CATALOG_SIZE).toBe(111);
    expect(new Set(games.map(g=>g.id)).size).toBe(111);
    const capability=gameCapabilities("cofre");
    expect(capability).toMatchObject({solo:false,online:false,localPlayers:4,bot:false,timedSessions:false});
    expect(recordUnits.cofre).toBe("pontos");
    expect(gameHelp.cofre).toMatch(/quatro tentativas|quatro dígitos/i);
  });
  it("offers local group filters but not Solo/online/AI",()=>{
    const game=games.find(x=>x.id==="cofre")!;
    expect(modeTags(game)).toContain("grupo");
    expect(modeTags(game)).toContain("dupla");
    expect(modeTags(game)).not.toContain("bot");
    const list=filterByMode(games,"grupo",{},[]);
    expect(list.map(g=>g.id)).toContain("cofre");
  });
});
