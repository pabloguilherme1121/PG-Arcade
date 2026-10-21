import {it,expect} from "vitest";
import {games} from "../../lib/catalog";
import {CATALOG_SIZE} from "../../lib/catalogRelease";
import {gameCapabilities} from "../../lib/gameCapabilities";
import {gameHelp} from "../../lib/gameHelp";
import {recordUnits} from "../../lib/recordUnits";
import {modeTags} from "../../lib/smartDiscovery";
it("Cidade em Miniatura tem 128 IDs e capacidades de zoneamento solo verdadeiras",()=>{
 expect(CATALOG_SIZE).toBe(128);expect(games).toHaveLength(128);
 expect(new Set(games.map(g=>g.id)).size).toBe(128);
 expect(recordUnits.cidade).toBe("pontos");
 expect(gameHelp.cidade.length).toBeGreaterThan(100);
 expect(gameCapabilities("cidade")).toMatchObject({solo:true,online:false,bot:false,localPlayers:1,timedSessions:false,swipe:false});
 expect(modeTags(games.find(g=>g.id==="cidade")!)).toEqual(["classico","sem-pressa"]);
});