import {it,expect} from "vitest";
import {games} from "../../lib/catalog";
import {CATALOG_SIZE} from "../../lib/catalogRelease";
import {gameCapabilities} from "../../lib/gameCapabilities";
import {gameHelp} from "../../lib/gameHelp";
import {recordUnits} from "../../lib/recordUnits";
import {modeTags} from "../../lib/smartDiscovery";
it("Ponteiros em Fase registra 122 IDs e capacidade verdadeira",()=>{
 expect(CATALOG_SIZE).toBe(122);
 expect(games).toHaveLength(122);
 expect(new Set(games.map(g=>g.id)).size).toBe(122);
 expect(recordUnits.ponteiros).toBe("pontos");
 expect(gameHelp.ponteiros.length).toBeGreaterThan(100);
 expect(gameCapabilities("ponteiros")).toMatchObject({solo:true,online:false,bot:false,localPlayers:1,timedSessions:false,swipe:false});
 expect(modeTags(games.find(g=>g.id==="ponteiros")!)).toEqual(["classico","sem-pressa"]);
});
