import {describe,expect,it} from "vitest";
import {createArchipelago,bridgesCross,isConnected,solved,setBridge,undoBridge,restartArchipelago,nextArchipelago} from "./rules";
describe("Pontes do Arquipélago — geração e jogabilidade",()=>{
 it("gera tabuleiros reais solucionáveis em três dificuldades e 120 sementes",()=>{
  for(const difficulty of [0,1,2] as const)for(let seed=0;seed<40;seed++){
   const g=createArchipelago(difficulty,seed);
   expect(g).toEqual(createArchipelago(difficulty,seed));
   expect(g.islands).toHaveLength([6,8,9][difficulty]);
   expect(g.islands.every(i=>i.goal>0)).toBe(true);
   expect(isConnected(g.islands,g.bridges,true)).toBe(true);
   expect(solved(g)).toBe(false);
   const solution={...g,bridges:g.bridges.map(b=>({...b,count:b.solution}))};
   expect(solved(solution)).toBe(true);
   expect(solution.bridges.every((a,i)=>a.count===0||solution.bridges.every((b,j)=>j<=i||b.count===0||!bridgesCross(a,b,g.islands)))).toBe(true);
  }
 });
 it("cicla 0/1/2, oferece desfazer e preserva estado original",()=>{
  const g=createArchipelago(0,13),a=setBridge(g,0),b=setBridge(a,0),c=setBridge(b,0);
  expect([a.bridges[0].count,b.bridges[0].count,c.bridges[0].count]).toEqual([1,2,0]);
  expect(g.bridges[0].count).toBe(0);
  expect(undoBridge(a).bridges).toEqual(g.bridges);
  expect(setBridge(g,-1)).toBe(g);
  expect(setBridge(g,999)).toBe(g);
  expect(restartArchipelago(a)).toEqual(g);
  expect(nextArchipelago(g).seed).not.toBe(g.seed);
 });
 it("permite conquistar vitória sem atalhos nem respostas falsas",()=>{
  const base=createArchipelago(2,93);let play=base;
  for(let i=0;i<base.bridges.length;i++)for(let j=0;j<base.bridges[i].solution;j++)play=setBridge(play,i);
  expect(play.phase).toBe("won");expect(play.score).toBeGreaterThan(0);
  expect(setBridge(play,0)).toBe(play);
  expect(undoBridge(play).phase).toBe("playing");
 });
 it("não aceita configuração inválida",()=>{
  expect(()=>createArchipelago(3 as never)).toThrow();
  expect(()=>createArchipelago(0,-1)).toThrow();
 });
});