import { expect, it } from 'vitest';
import { solveLinks } from '../../e2e/links-solver';
import { boardClick, boardSolved, newBoard } from './boardExpansion';
it('offers guided 4x4, independent 4x4 and six-pair 6x6 paths', () => {
  const levels = [0,1,2].map(d => newBoard('links',d));
  expect(levels.map(s => s.size)).toEqual([4,4,6]);
  expect(levels.map(s => new Set(s.fixed.filter(Boolean)).size)).toEqual([4,4,6]);
  expect(levels[0].cells.filter(Boolean).length).toBeGreaterThan(levels[0].fixed.filter(Boolean).length);
});
it('resumes a partial path after selecting another color', () => {
  let s = boardClick(boardClick(newBoard('links'),3),7);
  s = boardClick(s,0);
  const moves = s.moves;
  s = boardClick(s,7);
  expect(s.selected).toBe(7); expect(s.value).toBe(2); expect(s.moves).toBe(moves);
  s = boardClick(s,6);
  expect(s.cells[6]).toBe(2);
});

for (const difficulty of [0,1,2]) it(`links ${difficulty} can be completed legally in every orientation`, () => {
  for(let seed=1;seed<=8;seed++) {
    let state=newBoard('links',difficulty,seed);
    const initial=[...state.cells];
    for(const path of solveLinks(initial,state.fixed,state.size)) {
      state=boardClick(state,path[0]);
      for(const index of path.slice(1,-1)) state=boardClick(state,index);
    }
    expect(state.status, `${difficulty}/${seed}`).toBe('won');
  }
});
it('does not count erasing an empty cell as a move',()=>{
  const initial=newBoard('links');initial.value=0;
  expect(boardClick(initial,1)).toBe(initial);
});

it('rejects a disconnected cycle even when every terminal path is complete',()=>{
  const state=newBoard('links',2);
  state.cells=[1,1,1,1,1,1,2,2,2,2,2,2,3,3,3,3,3,3,4,4,1,1,5,5,6,6,1,1,7,7,8,8,8,8,8,8];
  state.fixed=Array(36).fill(0);
  for(const [color,a,b] of [[1,0,5],[2,6,11],[3,12,17],[4,18,19],[5,22,23],[6,24,25],[7,28,29],[8,30,35]]) state.fixed[a]=state.fixed[b]=color;
  expect(boardSolved(state)).toBe(false);
});
