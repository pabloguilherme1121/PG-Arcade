import {describe,expect,it} from "vitest";
import {areNeighbors,edgeKey,irrigationSolved,measureFlow,newIrrigationGame,nextIrrigation,resetIrrigation,solutionPipes,tapIrrigationCell,togglePipe,undoIrrigation} from "./rules";
describe("Zonas de Irrigação — fluxo e vazamentos",()=>{
 it("gera 360 sistemas determinísticos com orçamento e consumo finitos",()=>{
  for(const difficulty of [0,1,2] as const)for(let seed=0;seed<120;seed++){
   const g=newIrrigationGame(difficulty,seed);
   expect(g).toEqual(newIrrigationGame(difficulty,seed));
   expect(g.pipeBudget).toBe([3,5,8][difficulty]);
   expect(g.fields).toHaveLength(2+difficulty);
   expect(g.demands.every(v=>v>=1&&v<=2)).toBe(true);
   expect(g.supply).toBeGreaterThan(g.demands.reduce((a,b)=>a+b,0));
  }
 });
 it("vence 360 desafios por redes reais sem vazamento nem excedente de consumo",()=>{
  for(const d of [0,1,2] as const)for(let seed=0;seed<120;seed++){
   let game=newIrrigationGame(d,seed);
   for(const [a,b] of solutionPipes(d)){
    game=togglePipe(game,a,b);
   }
   expect(game.phase).toBe("won");
   expect(irrigationSolved(game)).toBe(true);
   const metrics=measureFlow(game);
   expect(metrics.watered).toBe(game.fields.length);
   expect(metrics.leaks).toBe(0);
   expect(metrics.need).toBe(game.demands.reduce((a,b)=>a+b,0));
   expect(metrics.used).toBeLessThanOrEqual(game.supply);
   expect(togglePipe(game,0,1)).toBe(game);
   expect(undoIrrigation(game).phase).toBe("playing");
  }
 });
 it("calcula vazamento em extremidade solta e distingue conexões oblíquas",()=>{
  const g=newIrrigationGame(0,1);
  expect(areNeighbors(4,0,5)).toBe(false);
  expect(areNeighbors(4,0,1)).toBe(true);
  expect(areNeighbors(4,3,4)).toBe(false);
  expect(edgeKey(4,0)).toBe("0-4");
  const leak=togglePipe(g,0,4);
  expect(measureFlow(leak).leaks).toBe(1);
  expect(irrigationSolved(leak)).toBe(false);
 });
 it("seleciona casas com teclado/toque, permite undo e recusa ligações inválidas",()=>{
  const g=newIrrigationGame();
  expect(tapIrrigationCell(g,-1)).toBe(g);
  const a=tapIrrigationCell(g,0),b=tapIrrigationCell(a,1);
  expect(b.edges).toEqual(["0-1"]);
  expect(b.selected).toBeNull();
  expect(tapIrrigationCell(a,0).selected).toBeNull();
  expect(togglePipe(b,0,5)).toBe(b);
  expect(undoIrrigation(b).edges).toEqual([]);
  expect(resetIrrigation(b)).toEqual(g);
  expect(nextIrrigation(g).seed).not.toBe(g.seed);
 });
 it("recusa configuração incorreta",()=>{
  expect(()=>newIrrigationGame(5 as never)).toThrow();
  expect(()=>newIrrigationGame(0,-1)).toThrow();
 });
});