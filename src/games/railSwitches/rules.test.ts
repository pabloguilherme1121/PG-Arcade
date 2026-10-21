import {describe,expect,it} from "vitest";
import {changeSwitch,createRails,routeTrains,resetRails,nextRails,testRoute} from "./rules";
describe("Trilhos Cruzados: 111º jogo, motor de permutações",()=>{
 it("encontra saída exata e impede que trens ocupem a mesma saída",()=>{
  expect(routeTrains([0,0,0])).toEqual([0,1,2]);
  expect(routeTrains([1])).toEqual([1,0,2]);
  expect(routeTrains([1,2])).toEqual([2,0,1]);
  for(const modes of [[1,2,1],[0,2,2,1],[2,1,1,0,2]] as const)
   expect(new Set(routeTrains(modes))).toEqual(new Set([0,1,2]));
 });
 it("gera 180 metas não triviais, reproduzíveis e solucionáveis",()=>{
  for(const difficulty of [0,1,2] as const)for(let seed=0;seed<60;seed++){
   const g=createRails(difficulty,seed);
   expect(g).toEqual(createRails(difficulty,seed));
   expect(g.switches).toHaveLength([3,4,5][difficulty]);
   expect(g.target).toHaveLength(3);
   expect(g.target).not.toEqual([0,1,2]);
   let sequence:number[]|null=null;
   const search=(modes:number[],n:number):boolean=>{
    if(n===g.switches.length){if(routeTrains(modes as never).every((lane,i)=>lane===g.target[i])){sequence=modes;return true;}return false;}
    for(const m of [0,1,2])if(search([...modes,m],n+1))return true;
    return false;
   };
   expect(search([],0)).toBe(true);
   expect(sequence).not.toBeNull();
  }
 });
 it("altera desvios, testa erros, vence e protege o progresso",()=>{
  const init=createRails(1,41);
  expect(changeSwitch(init,-1)).toBe(init);
  expect(testRoute(init).phase).toBe("planning");
  expect(testRoute(init).attempts).toBe(1);
  const solution=(()=>{const walk=(n:number,g:typeof init):typeof init|null=>{
   if(n===g.switches.length)return g.switches.length&&g.target.every((v,i)=>routeTrains(g.switches)[i]===v)?g:null;
   for(let mode=0;mode<3;mode++){let next=g;for(let k=0;k<mode;k++)next=changeSwitch(next,n);const result=walk(n+1,next);if(result)return result;}
   return null;
  };return walk(0,init)})();
  expect(solution).not.toBeNull();
  const won=testRoute(solution!);
  expect(won.phase).toBe("won");expect(won.score).toBeGreaterThan(0);
  expect(changeSwitch(won,0)).toBe(won);
  expect(testRoute(won)).toBe(won);
  expect(resetRails(won)).toEqual(init);
  expect(nextRails(init).seed).not.toBe(init.seed);
 });
 it("rejeita entradas fora dos limites",()=>{
  expect(()=>createRails(3 as never)).toThrow();
  expect(()=>createRails(0,-1)).toThrow();
  expect(()=>routeTrains([3 as never])).toThrow();
 });
});
