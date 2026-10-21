import {it,expect} from "vitest";
import {games} from "../../lib/catalog";
import {CATALOG_SIZE} from "../../lib/catalogRelease";
import {gameCapabilities} from "../../lib/gameCapabilities";
import {gameHelp} from "../../lib/gameHelp";
import {recordUnits} from "../../lib/recordUnits";
import {modeTags} from "../../lib/smartDiscovery";
it("Alquimia de Elementos completa o 128º motor sem modos fictícios",()=>{
 expect(CATALOG_SIZE).toBe(games.length);expect(games).toHaveLength(CATALOG_SIZE);
 expect(new Set(games.map(g=>g.id)).size).toBe(CATALOG_SIZE);
 expect(recordUnits.alquimia).toBe("pontos");
 expect(gameHelp.alquimia.length).toBeGreaterThan(100);
 expect(gameCapabilities("alquimia")).toMatchObject({solo:true,online:false,bot:false,localPlayers:1,timedSessions:false,swipe:false});
 expect(modeTags(games.find(g=>g.id==="alquimia")!)).toEqual(["classico","sem-pressa"]);
});