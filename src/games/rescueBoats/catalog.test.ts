import {it,expect} from "vitest";
import {games} from "../../lib/catalog";
import {CATALOG_SIZE} from "../../lib/catalogRelease";
import {gameCapabilities} from "../../lib/gameCapabilities";
import {gameHelp} from "../../lib/gameHelp";
import {recordUnits} from "../../lib/recordUnits";
import {modeTags} from "../../lib/smartDiscovery";
it("Barcos de Resgate é o 123º motor, com modos verdadeiros",()=>{
 expect(CATALOG_SIZE).toBe(123);expect(games).toHaveLength(123);
 expect(new Set(games.map(g=>g.id)).size).toBe(123);
 expect(recordUnits.resgate).toBe("pontos");
 expect(gameHelp.resgate.length).toBeGreaterThan(100);
 expect(gameCapabilities("resgate")).toMatchObject({solo:true,online:false,bot:false,localPlayers:1,timedSessions:false,swipe:false});
 expect(modeTags(games.find(g=>g.id==="resgate")!)).toEqual(["classico","sem-pressa"]);
});