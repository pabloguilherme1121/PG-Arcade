import {describe,expect,it} from "vitest";
import {aligned,createClocks,moveClocks,nextClocks,pointerPhase,resetClocks,undoClocks} from "./rules";
describe("Ponteiros em Fase — sincronização por congruências",()=>{
 it("calcula fases periódicas e detecta alinhamento",()=>{
  expect(pointerPhase(3,3,3)).toBe(0);
  expect(pointerPhase(5,1,3)).toBe(3);
  expect(()=>pointerPhase(0,0,0)).toThrow();
 });
 it("gera ao menos 180 desafios determinísticos e sempre resolúveis",()=>{
  for(const difficulty of [0,1,2] as const)for(let seed=0;seed<60;seed++){
   const g=createClocks(difficulty,seed);
   expect(g).toEqual(createClocks(difficulty,seed));
   expect(g.periods).toHaveLength(3+difficulty);
   expect(aligned(g)).toBe(false);
   expect(g.target).toBeGreaterThan(0);
   expect(g.periods.every(period=>pointerPhase(period,g.target,g.target)===0)).toBe(true);
   const other=Array.from({length:g.target},(_,time)=>time).some(time=>g.periods.every(period=>pointerPhase(period,time,g.target)===0));
   expect(other).toBe(false);
  }
 });
 it("avança no tempo, retorna, preserva histórico e pontua apenas quando todas as fases zeram",()=>{
  let g=createClocks(0,33),steps=0;
  const init=g;
  expect(moveClocks(g,-1)).toBe(g);
  while(g.time+10<=g.target){g=moveClocks(g,10);steps++;}
  while(g.phase==="playing"){g=moveClocks(g,1);steps++;if(steps>80)throw Error("Não convergiu");}
  expect(g.time).toBe(init.target);
  expect(g.phase).toBe("won");expect(g.score).toBeGreaterThan(0);
  expect(moveClocks(g,1)).toBe(g);
  expect(undoClocks(g).phase).toBe("playing");
  expect(resetClocks(g)).toEqual(init);
  expect(nextClocks(g).seed).not.toBe(init.seed);
 });
 it("rejeita dificuldade e seed inválidos",()=>{
  expect(()=>createClocks(3 as never)).toThrow();
  expect(()=>createClocks(0,-1)).toThrow();
 });
});
