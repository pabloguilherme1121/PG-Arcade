import {it,expect} from "vitest";
import {games} from "../../lib/catalog";
import {CATALOG_SIZE} from "../../lib/catalogRelease";
import {gameCapabilities} from "../../lib/gameCapabilities";
import {gameHelp} from "../../lib/gameHelp";
import {recordUnits} from "../../lib/recordUnits";
import {modeTags} from "../../lib/smartDiscovery";
it("Bordas Encantadas: 127 jogos com modos verdadeiros",()=>{
 expect(CATALOG_SIZE).toBe(127);expect(games).toHaveLength(127);
 expect(new Set(games.map(g=>g.id)).size).toBe(127);
 expect(recordUnits.bordas).toBe("pontos");
 expect(gameHelp.bordas.length).toBeGreaterThan(100);
 expect(gameCapabilities("bordas")).toMatchObject({solo:true,online:false,bot:false,localPlayers:1,timedSessions:false,swipe:false});
 expect(modeTags(games.find(g=>g.id==="bordas")!)).toEqual(["classico","sem-pressa"]);
});