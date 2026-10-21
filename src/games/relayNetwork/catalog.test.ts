import {it,expect} from "vitest";
import {games} from "../../lib/catalog";
import {CATALOG_SIZE} from "../../lib/catalogRelease";
import {gameCapabilities} from "../../lib/gameCapabilities";
import {gameHelp} from "../../lib/gameHelp";
import {recordUnits} from "../../lib/recordUnits";
import {modeTags} from "../../lib/smartDiscovery";
it("Rede de Relés #129 não anuncia capacidades falsas",()=>{
 expect(CATALOG_SIZE).toBe(129);expect(games).toHaveLength(129);
 expect(new Set(games.map(g=>g.id)).size).toBe(129);
 expect(recordUnits.reles).toBe("pontos");
 expect(gameHelp.reles.length).toBeGreaterThan(100);
 expect(gameCapabilities("reles")).toMatchObject({solo:true,online:false,bot:false,localPlayers:1,timedSessions:false,swipe:false});
 expect(modeTags(games.find(g=>g.id==="reles")!)).toEqual(["classico","sem-pressa"]);
});