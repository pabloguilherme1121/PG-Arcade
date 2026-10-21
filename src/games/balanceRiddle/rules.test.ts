import {describe,expect,it} from "vitest";
import {assignPan,canWeigh,chooseSuspect,chooseWeight,newBalanceGame,nextBalance,restartBalance,submitSuspicion,weighCoins} from "./rules";
describe("Enigma das Balanças: dedução verificável",()=>{
 it("gera 180 casos reais determinísticos com exatamente uma moeda diferente",()=>{
  for(const difficulty of [0,1,2] as const)for(let seed=0;seed<60;seed++){
   const g=newBalanceGame(difficulty,seed);
   expect(g).toEqual(newBalanceGame(difficulty,seed));
   expect(g.count).toBe([4,6,8][difficulty]);
   expect(g.fake).toBeGreaterThanOrEqual(0);expect(g.fake).toBeLessThan(g.count);
   expect(["heavy","light"]).toContain(g.fakeKind);
   expect(g.placements.every(p=>p===0)).toBe(true);
  }
 });
 it("não pesa grupos vazios, desiguais nem aceita salto de fase",()=>{
  const g=newBalanceGame(0,11);
  expect(weighCoins(g)).toBe(g);
  const one=assignPan(g,0);
  expect(canWeigh(one)).toBe(false);
  const both=assignPan(assignPan(one,1),1);
  expect(canWeigh(both)).toBe(true);
  expect(g.placements).toEqual([0,0,0,0]);
  expect(weighCoins(both).history).toHaveLength(1);
 });
 it("simula exatamente pesagens para moedas mais pesadas e leves",()=>{
  for(let seed=0;seed<20;seed++){
   const g=newBalanceGame(0,seed),fake=g.fake,another=(fake+1)%g.count;
   let s=assignPan(g,fake);
   s=assignPan(assignPan(s,another),another);
   const weighed=weighCoins(s);
   expect(weighed.history[0].result).toBe(g.fakeKind==="heavy"?"left":"right");
   expect(weighed.placements.every(p=>p===0)).toBe(true);
  }
 });
 it("declara vitória somente com moeda e natureza corretas; duas acusações erradas terminam",()=>{
  const g=newBalanceGame(2,87);
  const good=submitSuspicion(chooseWeight(chooseSuspect(g,g.fake),g.fakeKind));
  expect(good.phase).toBe("won");expect(good.score).toBeGreaterThan(0);
  expect(weighCoins(good)).toBe(good);
  const bad=chooseWeight(chooseSuspect(g,g.fake),g.fakeKind==="heavy"?"light":"heavy");
  expect(submitSuspicion(bad).phase).toBe("playing");
  expect(submitSuspicion(submitSuspicion(bad)).phase).toBe("lost");
  expect(restartBalance(good)).toEqual(g);
  expect(nextBalance(g).seed).not.toBe(g.seed);
 });
 it("rejeita configurações inválidas",()=>{
  expect(()=>newBalanceGame(3 as never)).toThrow();
  expect(()=>newBalanceGame(0,-1)).toThrow();
 });
});