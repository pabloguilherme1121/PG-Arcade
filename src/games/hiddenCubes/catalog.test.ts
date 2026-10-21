import {it,expect} from "vitest";
import {games} from "../../lib/catalog";
import {CATALOG_SIZE} from "../../lib/catalogRelease";
import {gameCapabilities} from "../../lib/gameCapabilities";
import {gameHelp} from "../../lib/gameHelp";
import {recordUnits} from "../../lib/recordUnits";
import {modeTags} from "../../lib/smartDiscovery";
it("Cubos Ocultos registra 118 jogos sem modos fictícios",()=>{
 expect(CATALOG_SIZE).toBe(118);
 expect(games).toHaveLength(118);
 expect(new Set(games.map(g=>g.id)).size).toBe(118);
 expect(recordUnits.cubos).toBe("pontos");
 expect(gameHelp.cubos.length).toBeGreaterThan(100);
 expect(gameCapabilities("cubos")).toMatchObject({solo:true,online:false,bot:false,localPlayers:1,timedSessions:false,swipe:false});
 expect(modeTags(games.find(g=>g.id==="cubos")!)).toEqual(["classico","sem-pressa"]);
});