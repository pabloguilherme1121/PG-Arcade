import {it,expect} from "vitest";
import {games} from "../../lib/catalog";
import {CATALOG_SIZE} from "../../lib/catalogRelease";
import {gameCapabilities} from "../../lib/gameCapabilities";
import {gameHelp} from "../../lib/gameHelp";
import {recordUnits} from "../../lib/recordUnits";
import {modeTags} from "../../lib/smartDiscovery";
it("Cofre de Sombras entrega 127 IDs e capacidades corretas",()=>{
 expect(CATALOG_SIZE).toBe(127);
 expect(games).toHaveLength(127);
 expect(new Set(games.map(g=>g.id)).size).toBe(127);
 expect(recordUnits.sombras).toBe("pontos");
 expect(gameHelp.sombras.length).toBeGreaterThan(100);
 expect(gameCapabilities("sombras")).toMatchObject({solo:true,bot:false,online:false,timedSessions:false,swipe:false,localPlayers:1});
 expect(modeTags(games.find(g=>g.id==="sombras")!)).toEqual(["classico","sem-pressa"]);
});
