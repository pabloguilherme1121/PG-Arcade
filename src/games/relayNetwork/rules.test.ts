import {describe,expect,it} from "vitest";
import {createRelayGame,networkSolved,nextRelay,relayMetrics,restartRelay,solutionRelays,toggleRelay,undoRelay} from "./rules";
describe("Rede de Relés: cobertura conectada e energia",()=>{
 it("gera 360 missões reproduzíveis com torres e dispositivos distintos",()=>{
  for(const d of [0,1,2] as const)for(let seed=0;seed<120;seed++){
   const g=createRelayGame(d,seed);
   expect(g).toEqual(createRelayGame(d,seed));
   expect(g.size).toBe(5+d);
   expect(g.devices).toHaveLength(2+d);
   expect(new Set(g.slots).size).toBe(g.slots.length);
   expect(g.slots).toHaveLength(g.budget+5);
   expect(g.slots.some(slot=>g.devices.includes(slot))).toBe(false);
   expect(g.selected).toEqual([]);
  }
 });
 it("constrói uma rede real, energética e totalmente conectada em 360 cenários",()=>{
  for(const d of [0,1,2] as const)for(let seed=0;seed<120;seed++){
   const start=createRelayGame(d,seed);
   let state=start;
   for(const slot of solutionRelays(d)){
    state=toggleRelay(state,slot);
   }
   const m=relayMetrics(state);
   expect(state.phase).toBe("won");
   expect(networkSolved(state)).toBe(true);
   expect(m.unlinked).toBe(0);
   expect(m.energyUsed).toBeLessThanOrEqual(state.energy);
   expect(m.covered).toHaveLength(state.devices.length);
   expect(state.score).toBeGreaterThan(0);
   expect(toggleRelay(state,state.slots[0])).toBe(state);
  }
 });
 it("não considera uma torre desconectada apta a cobrir um dispositivo",()=>{
  const g=createRelayGame(0,27);
  const far=22;
  const isolated=toggleRelay(g,far);
  expect(relayMetrics(isolated).unlinked).toBe(1);
  expect(relayMetrics(isolated).covered).toHaveLength(0);
  expect(networkSolved(isolated)).toBe(false);
 });
 it("limita capacidade, preserva estado e desfaz a última instalação",()=>{
  const start=createRelayGame();
  expect(toggleRelay(start,-1)).toBe(start);
  expect(toggleRelay(start,0)).toBe(start);
  let g=start;
  for(const slot of solutionRelays(0).slice(0,2))g=toggleRelay(g,slot);
  expect(g.selected).toHaveLength(2);
  expect(undoRelay(g).selected).toHaveLength(1);
  expect(restartRelay(g)).toEqual(start);
  expect(nextRelay(start).seed).not.toBe(start.seed);
 });
 it("rejeita configuração inválida",()=>{
  expect(()=>createRelayGame(7 as never)).toThrow();
  expect(()=>createRelayGame(0,-1)).toThrow();
 });
});