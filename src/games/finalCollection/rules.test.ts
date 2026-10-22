import { describe,it,expect } from 'vitest';
import { finalGames, type FinalId } from '../../lib/finalCatalog';
import { games } from '../../lib/catalog';
import { gameHelp } from '../../lib/gameHelp';
import { gameCapabilities } from '../../lib/gameCapabilities';
import { initial, act, won, solutions, undo, weights, values, score, type State } from './rules';
export function solve(id:FinalId):number[]{
 const queue:{state:State;path:number[]}[]=[{state:initial(id),path:[]}],seen=new Set<string>();
 for(let n=0;n<queue.length&&n<10000;n++){
  const {state,path}=queue[n];if(won(id,state.cells))return path;
  for(let i=0;i<(id==='baldes'?6:id==='sapos'?5:5);i++){
   const next=act(id,state,i),key=next.cells.join(',');
   if(!seen.has(key)){seen.add(key);queue.push({state:{...next,history:[]},path:[...path,i]})}
  }
 }throw Error(`No reachable victory: ${id}`);
}
describe('18 complete games and truthful catalog capabilities',()=>{
 it('registers 150 unique titles with instructions and no unsupported clock',()=>{
  expect(games).toHaveLength(150);expect(new Set(games.map(g=>g.id)).size).toBe(150);
  for(const g of finalGames){expect(gameHelp[g.id].length).toBeGreaterThan(100);expect(gameCapabilities(g.id)).toMatchObject({solo:true,timedSessions:false,swipe:false,bot:false,localPlayers:1})}
 });
 for(const {id} of finalGames){
  it(`${id}: starts unfinished, accepts a valid solution, and rejects a damaged solution`,()=>{
   expect(won(id,initial(id).cells)).toBe(false);
   expect(won(id,solutions[id]!)).toBe(true);
   const broken=[...solutions[id]!];broken.fill(0);expect(won(id,broken)).toBe(false);
  });
 }
 for(const id of ['baldes','sapos','panquecas'] as const)it(`${id}: victory is reachable exclusively through legal moves and can be undone`,()=>{
  let state=initial(id);for(const action of solve(id))state=act(id,state,action);
  expect(won(id,state.cells)).toBe(true);expect(won(id,undo(state).cells)).toBe(false);
  expect(act(id,state,0)).toBe(state);expect(score(state)).toBeGreaterThan(0);
 });
 it('rejects illegal frog moves and empty bucket operations without spending a move',()=>{
  expect(act('sapos',initial('sapos'),0)).toEqual(initial('sapos'));
  expect(act('baldes',initial('baldes'),4)).toEqual(initial('baldes'));
 });
 it('the expedition goal is optimal under the actual capacity, not just a label',()=>{
  const possible=Array.from({length:32},(_,mask)=>weights.map((_,i)=>mask>>i&1));
  const best=Math.max(...possible.filter(c=>c.reduce((s,v,i)=>s+v*weights[i],0)<=10).map(c=>c.reduce((s,v,i)=>s+v*values[i],0)));
  expect(best).toBe(18);
 });
 it('invalid domino overlap and touching stars do not win',()=>{
  expect(won('dominosa',Array(24).fill(1))).toBe(false);
  expect(won('constelacao',Array.from({length:16},(_,i)=>Number(i%5===0)))).toBe(false);
 });
});
