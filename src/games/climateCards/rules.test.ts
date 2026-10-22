import {describe,expect,it} from "vitest";
import {availableCards,getPower,newClimateGame,nextClimate,nextPlayer,playClimateCard,restartClimate,terrainAt,winningPlayer} from "./rules";
describe("Cartas de Climas: duelo local real para duas pessoas",()=>{
 it("gera 270 partidas determinísticas com mãos próprias e terrenos variáveis",()=>{
  for(const d of [0,1,2] as const)for(let seed=0;seed<90;seed++){
   const g=newClimateGame(d,seed);
   expect(g).toEqual(newClimateGame(d,seed));
   expect(g.hands[0]).toHaveLength(6);expect(g.hands[1]).toHaveLength(6);
   expect(g.rounds).toBe(3+d);
   expect(new Set(g.hands[0].map(c=>c.id)).size).toBe(6);
   expect(["choosing","handoff","finished"]).toContain(g.phase);
   expect([0,1,2]).toContain(terrainAt(g));
  }
 });
 it("não permite visualizar a mão no intervalo e respeita cartas já usadas",()=>{
  const start=newClimateGame(0,31);
  const a=playClimateCard(start,0);
  expect(a.player).toBe(1);
  expect(a.phase).toBe("handoff");
  expect(a.pending).toBe(0);
  expect(availableCards(a)).toHaveLength(0);
  expect(playClimateCard(a,1)).toBe(a);
  const b=nextPlayer(a);
  expect(availableCards(b)).toHaveLength(6);
  const c=playClimateCard(b,0);
  expect(c.history).toHaveLength(1);
  expect(c.round).toBe(1);
  const d=nextPlayer(c);
  expect(availableCards(d)).toHaveLength(5);
  expect(playClimateCard(d,0)).toBe(d);
  expect(start.round).toBe(0);
 });
 it("a força depende do clima do terreno, nunca da identidade do jogador",()=>{
  const card={id:1,power:3,climate:2 as const};
  expect(getPower(card,2)).toBe(6);
  expect(getPower(card,1)).toBe(3);
  expect(()=>getPower({...card,power:9},2)).toThrow();
 });
 it("termina todas as 3 dificuldades com resultado competitivo e sem bot",()=>{
  for(const d of [0,1,2] as const)for(let seed=0;seed<35;seed++){
   let g=newClimateGame(d,seed);
   for(let r=0;r<g.rounds;r++){
    expect(g.phase).toBe("choosing");
    g=playClimateCard(g,availableCards(g)[0].id);
    g=nextPlayer(g);
    g=playClimateCard(g,availableCards(g)[0].id);
    if(r<g.rounds-1)g=nextPlayer(g);
   }
   expect(g.phase).toBe("finished");
   expect(g.history).toHaveLength(g.rounds);
   expect(g.used[0]).toHaveLength(g.rounds);
   expect(g.used[1]).toHaveLength(g.rounds);
   expect(g.scores[0]+g.scores[1]).toBe(g.rounds*2);
   const winner=winningPlayer(g);
   expect(winner===null||winner===0||winner===1).toBe(true);
   expect(playClimateCard(g,5)).toBe(g);
   expect(restartClimate(g)).toEqual(newClimateGame(d,seed));
   expect(nextClimate(g).seed).not.toBe(g.seed);
  }
 });
 it("rejeita configuração inválida",()=>{
  expect(()=>newClimateGame(7 as never)).toThrow();
  expect(()=>newClimateGame(0,-1)).toThrow();
 });
});