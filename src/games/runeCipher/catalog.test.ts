import {expect,it} from "vitest";
import {games} from "../../lib/catalog";
import {CATALOG_SIZE} from "../../lib/catalogRelease";
import {gameCapabilities} from "../../lib/gameCapabilities";
import {gameHelp} from "../../lib/gameHelp";
import {recordUnits} from "../../lib/recordUnits";
import {modeTags} from "../../lib/smartDiscovery";
it("128º jogo: Rune Cipher tem registro e modos reais",()=>{
 expect(CATALOG_SIZE).toBe(games.length);
 expect(games).toHaveLength(CATALOG_SIZE);
 expect(new Set(games.map(g=>g.id)).size).toBe(CATALOG_SIZE);
 expect(recordUnits.runas).toBe("pontos");
 expect(gameHelp.runas.length).toBeGreaterThan(100);
 expect(gameCapabilities("runas")).toMatchObject({solo:true,online:false,bot:false,localPlayers:1,timedSessions:false,swipe:false});
 expect(modeTags(games.find(g=>g.id==="runas")!)).toEqual(["classico","sem-pressa", "turnos"]);
});