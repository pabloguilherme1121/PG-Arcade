import {describe,expect,it} from "vitest";
import {coverage,distance,missionCompleted,newBeaconDefense,nextBeacon,redundancy,resetBeacon,toggleBeacon,undoBeacon} from "./rules";
describe("Defesa de Faróis: planejamento e cobertura real",()=>{
 it("gera 270 arquipélagos reproduzíveis com solução provada por busca",()=>{
  for(const difficulty of [0,1,2] as const)for(let seed=0;seed<90;seed++){
   const g=newBeaconDefense(difficulty,seed);
   expect(g).toEqual(newBeaconDefense(difficulty,seed));
   expect(g.slots).toHaveLength(9);
   expect(g.routes.length).toBeGreaterThanOrEqual(g.budget);
   expect(g.selected).toEqual([]);
   let solved=false;
   const visit=(selected:number[],start:number)=>{
    if(solved)return;
    const candidate={...g,selected};
    if(missionCompleted(candidate)){solved=true;return;}
    if(selected.length>=g.budget)return;
    for(let i=start;i<9;i++)visit([...selected,i],i+1);
   };
   visit([],0);
   expect(solved).toBe(true);
  }
 });
 it("mede raios por distância ortogonal e penaliza múltiplas coberturas",()=>{
  expect(distance(5,0,24)).toBe(8);
  expect(distance(5,1,6)).toBe(1);
  expect(redundancy([0,1,2,3])).toBe(3);
  expect(()=>distance(5,-1,0)).toThrow();
 });
 it("respeita limite, desfazer e vitória por posicionamentos legítimos",()=>{
  for(const difficulty of [0,1,2] as const){
   const g=newBeaconDefense(difficulty,11);
   let winning: number[]|null=null;
   const find=(selected:number[],start:number)=>{
    if(winning)return;
    if(missionCompleted({...g,selected})){winning=selected;return;}
    if(selected.length===g.budget)return;
    for(let i=start;i<g.slots.length;i++)find([...selected,i],i+1);
   };
   find([],0);
   expect(winning).not.toBeNull();
   let state=g;
   for(const slot of winning!)if(state.phase==="playing")state=toggleBeacon(state,slot);
   expect(state.phase).toBe("won");
   expect(state.score).toBeGreaterThan(0);
   expect(coverage(state).every(count=>count>0)).toBe(true);
   expect(toggleBeacon(state,0)).toBe(state);
   expect(undoBeacon(state).phase).toBe("playing");
   expect(resetBeacon(state)).toEqual(g);
   expect(nextBeacon(g).seed).not.toBe(g.seed);
  }
 });
 it("rejeita posições e parâmetros inválidos",()=>{
  const g=newBeaconDefense();
  expect(toggleBeacon(g,-1)).toBe(g);
  expect(toggleBeacon(g,15)).toBe(g);
  expect(()=>newBeaconDefense(5 as never)).toThrow();
  expect(()=>newBeaconDefense(0,-1)).toThrow();
 });
});