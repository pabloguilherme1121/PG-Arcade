import { expect, it } from 'vitest';
import { boardClick, boardValue, knightMoves, newBoard, type BoardState } from './boardExpansion';

it('offers genuinely different clue counts and knight board sizes', () => {
  expect([0, 1, 2].map(d => newBoard('queens', d).fixed.filter(Boolean).length)).toEqual([3, 1, 0]);
  expect([0, 1, 2].map(d => newBoard('magic', d).fixed.filter(Boolean).length)).toEqual([4, 2, 0]);
  expect([0, 1, 2].map(d => newBoard('knight', d).size)).toEqual([5, 5, 6]);
  expect([0, 1, 2].map(d => newBoard('knight', d).cells.filter(Boolean).length)).toEqual([5, 1, 1]);
});

it('explains queen attacks immediately and clears the warning after correction', () => {
  let s = boardClick(boardClick(newBoard('queens', 2), 0), 9);
  expect(s.message).toContain('2 rainhas em conflito');
  expect(s.status).toBe('playing');
  s = boardClick(s, 9);
  expect(s.message).toContain('1 de 8 rainhas, sem conflitos');
});

it('keeps every magic-square clue immutable and compatible with a real solution', () => {
  for (const d of [0, 1, 2]) for (let seed = 1; seed <= 16; seed++) {
    let s = newBoard('magic', d, seed);
    for (let i = 0; i < s.cells.length; i++) {
      if (s.fixed[i]) expect(boardClick(boardValue(s, 0), i).cells).toEqual(s.cells);
      else s = boardClick(boardValue(s, s.goal[i]), i);
    }
    expect(s.status).toBe('won');
  }
});

it('keeps the guided queens compatible with a complete non-attacking arrangement', () => {
  for (const d of [0, 1, 2]) for (let seed = 1; seed <= 16; seed++) {
    let s = newBoard('queens', d, seed);
    const columns = Array(8).fill(-1);
    for (let i = 0; i < 64; i++) if (s.fixed[i]) columns[Math.floor(i / 8)] = i % 8;
    const safe = (row: number, col: number) => columns.every((c, r) => c < 0 || r === row || (c !== col && Math.abs(r - row) !== Math.abs(c - col)));
    function solve(row: number): boolean {
      if (row === 8) return true;
      if (columns[row] >= 0) return safe(row, columns[row]) && solve(row + 1);
      for (let col = 0; col < 8; col++) if (safe(row, col)) {
        columns[row] = col;
        if (solve(row + 1)) return true;
        columns[row] = -1;
      }
      return false;
    }
    expect(solve(0), `${d}/${seed}`).toBe(true);
    for (let row = 0; row < 8; row++) {
      const cell = row * 8 + columns[row];
      if (!s.fixed[cell]) s = boardClick(s, cell);
    }
    expect(s.status).toBe('won');
  }
});

function knightTour(s: BoardState, budget = { remaining: 150000 }): BoardState | null {
  if (s.status === 'won') return s;
  if (s.status === 'lost' || --budget.remaining < 0) return null;
  const candidates = knightMoves(s.selected, s.cells, s.size).sort((a, b) =>
    knightMoves(a, s.cells, s.size).length - knightMoves(b, s.cells, s.size).length);
  for (const cell of candidates) {
    const result = knightTour(boardClick(s, cell), budget);
    if (result) return result;
  }
  return null;
}
it('allows complete legal knight tours in each difficulty and seeded orientation', () => {
  for (const d of [0, 1, 2]) for (let seed = 1; seed <= 16; seed++) {
    const initial = newBoard('knight', d, seed);
    const complete = knightTour(initial);
    expect(complete?.status, `${d}/${seed}`).toBe('won');
    expect(new Set(complete?.cells).size).toBe(initial.size ** 2);
  }
});
