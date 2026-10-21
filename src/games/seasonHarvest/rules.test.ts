import {describe,expect,it} from "vitest";
import {canHarvest,cropYield,forecast,harvestPlot,newHarvestGame,nextHarvest,resetHarvest,restSeason,selectCrop,selectPlot,undoHarvest} from "./rules";
describe("Colheita das Estações — rotação, solo e água",()=>{
 it("gera 300 cenários determinísticos com metas e reservas auditáveis",()=>{
  for(const d of [0,1,2] as const)for(let seed=0;seed<100;seed++){
   const g=newHarvestGame(d,seed);
   expect(g).toEqual(newHarvestGame(d,seed));
   expect(g.soil).toEqual([2,2,2,2]);
   expect(g.maxSeasons).toBe([6,7,8][d]);
   expect(g.goal).toBe([24,30,38][d]);
   expect(["seca","amena","chuvosa"]).toContain(forecast(seed,0));
  }
 });
 it("os três níveis são vencíveis, em 180 seeds, por rotação e manejo legítimos",()=>{
  for(const d of [0,1,2] as const)for(let seed=0;seed<60;seed++){
   let g=newHarvestGame(d,seed);
   for(let plot=0;plot<4&&g.phase==="playing";plot++){
    g=harvestPlot(selectPlot(selectCrop(g,2),plot));
   }
   for(let i=0;i<4&&g.phase==="playing";i++){
    g=harvestPlot(selectPlot(selectCrop(g,0),i));
   }
   expect(g.phase).toBe("won");
   expect(g.points).toBeGreaterThanOrEqual(g.goal);
   expect(g.water).toBeGreaterThanOrEqual(0);
   expect(g.season).toBeLessThanOrEqual(g.maxSeasons);
   expect(harvestPlot(g)).toBe(g);
  }
 });
 it("a seca exige mais água, leguminosas restauram solo e undo restaura tudo",()=>{
  expect(cropYield(2,"seca")).toBeLessThan(cropYield(2,"chuvosa"));
  const g=newHarvestGame(0,0);
  expect(forecast(g.seed,g.season)).toBe("seca");
  const a=harvestPlot(g);
  expect(a.water).toBe(g.water-3);
  expect(a.soil[0]).toBe(0);
  const b=harvestPlot(selectCrop(a,0));
  expect(b.soil[0]).toBe(1);
  expect(undoHarvest(b).soil).toEqual(a.soil);
  expect(undoHarvest(a)).toEqual(g);
  expect(g.soil[0]).toBe(2);
 });
 it("ações inválidas não gastam recursos; descanso eleva fertilidade e água",()=>{
  const g=newHarvestGame(0,3);
  expect(selectPlot(g,-1)).toBe(g);
  expect(selectCrop(g,9 as never)).toBe(g);
  const a=harvestPlot(g),b=selectPlot(a,0);
  expect(canHarvest(b)).toBe(false);
  expect(harvestPlot(b)).toBe(b);
  const rest=restSeason(b);
  expect(rest.soil[0]).toBeGreaterThan(b.soil[0]);
  expect(rest.water).toBeGreaterThan(b.water);
  expect(resetHarvest(a)).toEqual(g);
  expect(nextHarvest(g).seed).not.toBe(g.seed);
 });
 it("recusa configuração inválida",()=>{
  expect(()=>newHarvestGame(5 as never)).toThrow();
  expect(()=>newHarvestGame(0,-1)).toThrow();
 });
});