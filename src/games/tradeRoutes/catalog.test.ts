import {it,expect} from "vitest";
import {games} from "../../lib/catalog";
import {CATALOG_SIZE} from "../../lib/catalogRelease";
import {gameCapabilities} from "../../lib/gameCapabilities";
import {gameHelp} from "../../lib/gameHelp";
import {recordUnits} from "../../lib/recordUnits";
import {modeTags} from "../../lib/smartDiscovery";
it("Mercadores de Rotas #128 tem contratos corretos de catálogo e modos",()=>{
 expect(CATALOG_SIZE).toBe(128);expect(games).toHaveLength(128);
 expect(new Set(games.map(g=>g.id)).size).toBe(128);
 expect(recordUnits.mercadores).toBe("pontos");
 expect(gameHelp.mercadores.length).toBeGreaterThan(100);
 expect(gameCapabilities("mercadores")).toMatchObject({solo:true,bot:false,online:false,localPlayers:1,timedSessions:false,swipe:false});
 expect(modeTags(games.find(g=>g.id==="mercadores")!)).toEqual(["classico","sem-pressa"]);
});