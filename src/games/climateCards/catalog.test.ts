import {it,expect} from "vitest";
import {games} from "../../lib/catalog";
import {CATALOG_SIZE} from "../../lib/catalogRelease";
import {gameCapabilities} from "../../lib/gameCapabilities";
import {gameHelp} from "../../lib/gameHelp";
import {recordUnits} from "../../lib/recordUnits";
import {modeTags} from "../../lib/smartDiscovery";
it("Cartas de Climas registra 127 jogos e dupla local sem bot",()=>{
 expect(CATALOG_SIZE).toBe(127);expect(games).toHaveLength(127);
 expect(new Set(games.map(g=>g.id)).size).toBe(127);
 expect(recordUnits.climas).toBe("pontos");
 expect(gameHelp.climas.length).toBeGreaterThan(100);
 expect(gameCapabilities("climas")).toMatchObject({solo:false,online:false,bot:false,localPlayers:2,timedSessions:false,swipe:false});
 expect(modeTags(games.find(g=>g.id==="climas")!)).toEqual(["classico","sem-pressa","dupla"]);
});