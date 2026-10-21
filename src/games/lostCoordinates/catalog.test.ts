import {it,expect} from "vitest";
import {games} from "../../lib/catalog";
import {CATALOG_SIZE} from "../../lib/catalogRelease";
import {gameCapabilities} from "../../lib/gameCapabilities";
import {gameHelp} from "../../lib/gameHelp";
import {recordUnits} from "../../lib/recordUnits";
import {modeTags} from "../../lib/smartDiscovery";
it("Coordenadas Perdidas registra 125 IDs e filtros reais",()=>{
 expect(CATALOG_SIZE).toBe(125);expect(games).toHaveLength(125);
 expect(new Set(games.map(g=>g.id)).size).toBe(125);
 expect(recordUnits.coordenadas).toBe("pontos");
 expect(gameHelp.coordenadas.length).toBeGreaterThan(100);
 expect(gameCapabilities("coordenadas")).toMatchObject({solo:true,online:false,bot:false,localPlayers:1,timedSessions:false,swipe:false});
 expect(modeTags(games.find(g=>g.id==="coordenadas")!)).toEqual(["classico","sem-pressa"]);
});