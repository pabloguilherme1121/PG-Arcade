import {it,expect} from "vitest";
import {games} from "../../lib/catalog";
import {CATALOG_SIZE} from "../../lib/catalogRelease";
import {gameCapabilities} from "../../lib/gameCapabilities";
import {gameHelp} from "../../lib/gameHelp";
import {recordUnits} from "../../lib/recordUnits";
import {modeTags} from "../../lib/smartDiscovery";
it("Fio Condutor registra 123 títulos e metadados honestos",()=>{
 expect(CATALOG_SIZE).toBe(123);
 expect(games).toHaveLength(123);
 expect(new Set(games.map(g=>g.id)).size).toBe(123);
 expect(recordUnits.fios).toBe("pontos");
 expect(gameHelp.fios.length).toBeGreaterThan(100);
 expect(gameCapabilities("fios")).toMatchObject({solo:true,online:false,localPlayers:1,bot:false,swipe:false,timedSessions:false});
 expect(modeTags(games.find(g=>g.id==="fios")!)).toEqual(["classico","sem-pressa"]);
});