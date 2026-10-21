import {describe,expect,it} from "vitest";
import {composeShadows,createShadowVault,nextShadow,restartShadow,rotateShadow,turnShutter,undoShutter} from "./rules";
describe("Cofre de Sombras — motor de máscaras sobrepostas",()=>{
 it("rotação completa de 360 graus restaura a máscara",()=>{
  for(let pattern=0;pattern<5;pattern++){
   expect(rotateShadow(pattern,0).filter(Boolean).length).toBeGreaterThan(0);
   expect(rotateShadow(pattern,0).filter(Boolean).length).toBe(rotateShadow(pattern,3).filter(Boolean).length);
   expect(()=>rotateShadow(pattern,4 as never)).toThrow();
  }
  expect(()=>rotateShadow(-1,0)).toThrow();
 });
 it("combina sobreposições por paridade, sem modificar as entradas",()=>{
  const setup=[0,1,2] as const;
  const old=[...setup];
  const composed=composeShadows(setup);
  expect(composed).toHaveLength(16);
  expect(composed.every(v=>v===0||v===1)).toBe(true);
  expect(setup).toEqual(old);
 });
 it("gera 180 desafios determinísticos, distintos da tela inicial e solucionáveis",()=>{
  for(const d of [0,1,2] as const)for(let seed=0;seed<60;seed++){
   const g=createShadowVault(d,seed);
   expect(g).toEqual(createShadowVault(d,seed));
   expect(g.solution).toHaveLength(3+d);
   expect(g.target).toHaveLength(16);
   expect(composeShadows(g.solution)).toEqual(g.target);
   expect(composeShadows(g.orientations)).not.toEqual(g.target);
   expect(g.phase).toBe("playing");
  }
 });
 it("permite vencer o enigma, desfazer e reiniciar sem perder a solução",()=>{
  const first=createShadowVault(1,23);
  let g=first;
  for(let index=0;index<first.solution.length;index++){
   for(let turns=0;turns<first.solution[index];turns++)if(g.phase==="playing")g=turnShutter(g,index);
  }
  expect(g.phase).toBe("won");expect(g.score).toBeGreaterThan(0);
  expect(turnShutter(g,0)).toBe(g);
  expect(undoShutter(g).phase).toBe("playing");
  expect(restartShadow(g)).toEqual(first);
  expect(nextShadow(g).seed).not.toBe(first.seed);
 });
 it("rejeita rotação inválida",()=>{
  const g=createShadowVault();
  expect(turnShutter(g,-1)).toBe(g);
  expect(()=>createShadowVault(5 as never)).toThrow();
 });
});
