import {describe,expect,it} from "vitest";
import {currentTide,disembark,newRescueGame,nextRescue,refuelBoat,rescueSurvivor,restartRescue,sail,sailingFuel,waitForTide} from "./rules";
describe("Barcos de Resgate — marés, combustível e logística",()=>{
 it("cria 180 missões com ilhas distintas, estado íntegro e maré reprodutível",()=>{
  for(const d of [0,1,2] as const)for(let seed=0;seed<60;seed++){
   const g=newRescueGame(d,seed);
   expect(g).toEqual(newRescueGame(d,seed));
   expect(g.active).toHaveLength(2+d);
   expect(new Set(g.active).size).toBe(2+d);
   expect(g.remaining).toEqual(g.active);
   expect(g.site).toBe(0);expect(g.onboard).toEqual([]);
   expect(["baixa","subindo","alta"]).toContain(currentTide(g));
  }
 });
 it("cada missão pode terminar com resgate e entrega reais, sem ultrapassar combustível",()=>{
  for(const d of [0,1,2] as const)for(let seed=0;seed<50;seed++){
   let g=newRescueGame(d,seed),steps=0;
   const islands=[...g.active];
   for(const island of islands){
    if(g.phase!=="playing")break;
    if(g.fuel<9)g=refuelBoat(g);
    g=sail(g,island);steps++;
    expect(g.site).toBe(island);
    g=rescueSurvivor(g);steps++;
    expect(g.onboard).toContain(island);
    g=sail(g,0);steps++;
    expect(g.site).toBe(0);
    g=disembark(g);steps++;
   }
   expect(g.phase).toBe("won");
   expect(g.delivered).toBe(g.active.length);
   expect(g.score).toBeGreaterThan(0);
   expect(g.fuel).toBeGreaterThanOrEqual(0);
   expect(g.turns).toBeLessThanOrEqual(g.maxTurns);
   expect(sail(g,1)).toBe(g);
  }
 });
 it("maré alta acrescenta uma unidade real ao custo",()=>{
  const g=newRescueGame(0,0);
  expect(currentTide(g)).toBe("baixa");
  const after=waitForTide(waitForTide(g));
  expect(currentTide(after)).toBe("alta");
  expect(sailingFuel(after,1)).toBe(sailingFuel(g,1)!+1);
 });
 it("rejeita resgate na base e desembarque fora, conservando estado e permitindo reinício",()=>{
  const g=newRescueGame(2,27);
  expect(rescueSurvivor(g)).toBe(g);
  expect(disembark(g)).toBe(g);
  expect(sail(g,0)).toBe(g);
  expect(refuelBoat(g)).toBe(g);
  const sailed=sail(g,1);
  expect(disembark(sailed)).toBe(sailed);
  expect(restartRescue(sailed)).toEqual(g);
  expect(nextRescue(g).seed).not.toBe(g.seed);
 });
 it("recusa dificuldade/seed incorretos",()=>{
  expect(()=>newRescueGame(5 as never)).toThrow();
  expect(()=>newRescueGame(0,-1)).toThrow();
 });
});