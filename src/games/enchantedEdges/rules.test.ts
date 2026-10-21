import {describe,expect,it} from "vitest";
import {countJoinedEdges,edgesSolved,newEdgeGame,nextEdges,restartEdges,rotatedEdges,turnEdge,undoEdge} from "./rules";
describe("Bordas Encantadas — mosaicos giratórios com conexões reais",()=>{
 it("gera 300 mosaicos determinísticos com configuração solucionável",()=>{
  for(const difficulty of [0,1,2] as const)for(let seed=0;seed<100;seed++){
   const game=newEdgeGame(difficulty,seed),size=3+difficulty;
   expect(game).toEqual(newEdgeGame(difficulty,seed));
   expect(game.tiles).toHaveLength(size*size);
   expect(game.tiles.every(tile=>tile.base.length===4)).toBe(true);
   const solved={...game,tiles:game.tiles.map(tile=>({...tile,rotation:0}))};
   expect(edgesSolved(solved)).toBe(true);
   expect(countJoinedEdges(solved)).toBe(2*size*(size-1));
   expect(edgesSolved(game)).toBe(false);
  }
 });
 it("gira no sentido horário, respeitando cores, e completa um ciclo em quatro toques",()=>{
  const first=newEdgeGame(0,15),original=first.tiles[0];
  let game=first;
  for(let i=0;i<4;i++)game=turnEdge(game,0);
  expect(rotatedEdges(game.tiles[0])).toEqual(rotatedEdges(original));
  expect(first.tiles[0]).toEqual(original);
  expect(turnEdge(first,-1)).toBe(first);
  expect(turnEdge(first,999)).toBe(first);
  expect(undoEdge(turnEdge(first,0)).tiles).toEqual(first.tiles);
  expect(restartEdges(first)).toEqual(first);
  expect(nextEdges(first).seed).not.toBe(first.seed);
 });
 it("permite vitória com rotações legítimas das peças",()=>{
  for(const difficulty of [0,1,2] as const){
   let game=newEdgeGame(difficulty,13);
   const initial=game.tiles.map(tile=>tile.rotation);
   for(let i=0;i<initial.length&&game.phase==="playing";i++){
    const moves=(4-initial[i])%4;
    for(let k=0;k<moves&&game.phase==="playing";k++)game=turnEdge(game,i);
   }
   expect(game.phase).toBe("won");
   expect(game.score).toBeGreaterThan(0);
   expect(turnEdge(game,0)).toBe(game);
   expect(undoEdge(game).phase).toBe("playing");
  }
 });
 it("não aceita dificuldade ou semente inválida",()=>{
  expect(()=>newEdgeGame(4 as never)).toThrow();
  expect(()=>newEdgeGame(0,-1)).toThrow();
 });
});