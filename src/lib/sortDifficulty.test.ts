import { expect, it } from 'vitest';
import { solveSort } from '../../e2e/sort-solvers';
import { boardClick, newBoard } from './boardExpansion';

for (const id of ['colorsort', 'watersort'] as const) it(`${id} increases colors and vessels without removing spare space`, () => {
  for (const difficulty of [0, 1, 2]) {
    const state = newBoard(id, difficulty);
    expect(new Set(state.cells.filter(Boolean)).size).toBe(difficulty + 2);
    expect(state.cells).toHaveLength((difficulty + 4) * 4);
    expect(state.cells.slice(-8)).toEqual(Array(8).fill(0));
    for (const color of new Set(state.cells.filter(Boolean))) expect(state.cells.filter(value => value === color)).toHaveLength(4);
  }
});

it('rejects a pour without losing the source selection or consuming a move', () => {
  const initial = newBoard('watersort');
  const selected = boardClick(initial, 0);
  const rejected = boardClick(selected, 4);
  expect(rejected.cells).toEqual(initial.cells);
  expect(rejected.moves).toBe(0);
  expect(rejected.selected).toBe(0);
});

for (const id of ['colorsort', 'watersort'] as const) it(`${id} has legal full solutions across levels and palettes`, () => {
  for (const difficulty of [0, 1, 2]) for (const seed of [1, 2, 7, 19]) {
    let state = newBoard(id, difficulty, seed);
    const stacks = Array.from({ length: state.cells.length / 4 }, (_, i) => state.cells.slice(i * 4, i * 4 + 4).filter(Boolean));
    const route = solveSort(stacks, id === 'watersort');
    expect(route.length).toBeGreaterThan(0);
    for (const [from, to] of route) {
      const moves = state.moves;
      state = boardClick(boardClick(state, from * 4), to * 4);
      expect(state.moves).toBe(moves + 1);
    }
    expect(state.status).toBe('won');
  }
});
