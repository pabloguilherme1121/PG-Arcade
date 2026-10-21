import {it,expect} from "vitest";
import {games} from "../../lib/catalog";
import {CATALOG_SIZE} from "../../lib/catalogRelease";
import {gameCapabilities} from "../../lib/gameCapabilities";
import {gameHelp} from "../../lib/gameHelp";
import {recordUnits} from "../../lib/recordUnits";
import {modeTags} from "../../lib/smartDiscovery";
it("Defesa de Faróis #126 registra 126 jogos e capacidades reais",()=>{
 expect(CATALOG_SIZE).toBe(126);expect(games).toHaveLength(126);
 expect(new Set(games.map(g=>g.id)).size).toBe(126);
 expect(recordUnits.farois).toBe("pontos");
 expect(gameHelp.farois.length).toBeGreaterThan(100);
 expect(gameCapabilities("farois")).toMatchObject({solo:true,online:false,bot:false,localPlayers:1,timedSessions:false,swipe:false});
 expect(modeTags(games.find(g=>g.id==="farois")!)).toEqual(["classico","sem-pressa"]);
});