import {describe,expect,it} from "vitest";
import {changeCube,cubesSolved,generateCubeHeights,getCubeViews,newHiddenCubes,nextCubes,restartCubes,undoCube} from "./rules";
describe("Cubos Ocultos: reconstrução de projeções 3D",()=>{
 it("produz 300 esculturas determinísticas e solucionáveis, com vistas coerentes",()=>{
  for(const difficulty of [0,1,2] as const)for(let seed=0;seed<100;seed++){
   const g=newHiddenCubes(difficulty,seed),solution=generateCubeHeights(difficulty,seed);
   expect(g).toEqual(newHiddenCubes(difficulty,seed));
   expect(g.heights).toHaveLength((3+difficulty)**2);
   expect(solution.every(h=>h>=0&&h<=g.limit)).toBe(true);
   expect(g.target).toEqual(getCubeViews(solution,g.size));
   expect(g.target.front.every(h=>h>0)).toBe(true);
   expect(g.target.side.every(h=>h>0)).toBe(true);
   expect(cubesSolved(g)).toBe(false);
  }
 });
 it("usa máximo em cada linha e coluna, sem confundir ocupação com altura",()=>{
  expect(getCubeViews([1,0,2,3],2)).toEqual({top:[1,0,1,1],front:[2,3],side:[1,3]});
  expect(()=>getCubeViews([1,-1,1,1],2)).toThrow();
  expect(()=>getCubeViews([1,2],2)).toThrow();
 });
 it("cicla alturas, desfaz e protege ações inválidas e imutabilidade",()=>{
  const base=newHiddenCubes(0,17),a=changeCube(base,0),b=changeCube(a,0),c=changeCube(b,0);
  expect([a.heights[0],b.heights[0],c.heights[0]]).toEqual([1,2,0]);
  expect(base.heights[0]).toBe(0);
  expect(changeCube(base,-1)).toBe(base);
  expect(changeCube(base,100)).toBe(base);
  expect(changeCube(base,0,2 as never)).toBe(base);
  expect(undoCube(a).heights).toEqual(base.heights);
  expect(restartCubes(a)).toEqual(base);
  expect(nextCubes(a).seed).not.toBe(base.seed);
 });
 it("permite completar a escultura através das jogadas do jogador",()=>{
  for(const difficulty of [0,1,2] as const){
   const original=newHiddenCubes(difficulty,85),solution=generateCubeHeights(difficulty,85);
   let game=original;
   for(let i=0;i<solution.length&&game.phase==="playing";i++){
    for(let step=0;step<solution[i]&&game.phase==="playing";step++)game=changeCube(game,i);
   }
   expect(game.phase).toBe("won");
   expect(game.score).toBeGreaterThan(0);
   expect(cubesSolved(game)).toBe(true);
   expect(changeCube(game,0)).toBe(game);
   expect(undoCube(game).phase).toBe("playing");
  }
 });
 it("valida dificuldade e semente",()=>{
  expect(()=>newHiddenCubes(3 as never)).toThrow();
  expect(()=>newHiddenCubes(0,-1)).toThrow();
 });
});