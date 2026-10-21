import {expect,it} from "vitest";
import {games} from "../../lib/catalog";
import {CATALOG_SIZE} from "../../lib/catalogRelease";
import {gameCapabilities} from "../../lib/gameCapabilities";
import {gameHelp} from "../../lib/gameHelp";
import {recordUnits} from "../../lib/recordUnits";
import {modeTags} from "../../lib/smartDiscovery";
it("129º jogo: Rune Cipher tem registro e modos reais",()=>{
 expect(CATALOG_SIZE).toBe(129);
 expect(games).toHaveLength(129);
 expect(new Set(games.map(g=>g.id)).size).toBe(129);
 expect(recordUnits.runas).toBe("pontos");
 expect(gameHelp.runas.length).toBeGreaterThan(100);
 expect(gameCapabilities("runas")).toMatchObject({solo:true,online:false,bot:false,localPlayers:1,timedSessions:false,swipe:false});
 expect(modeTags(games.find(g=>g.id==="runas")!)).toEqual(["classico","sem-pressa"]);
});