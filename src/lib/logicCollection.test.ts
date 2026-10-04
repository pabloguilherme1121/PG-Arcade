import { describe, it, expect } from "vitest";
import {
  codeFeedback,
  sudokuSolution,
  validSudoku,
  runs,
  hanoiMove,
  reversiFlips,
  maze,
  path,
  boxEdges,
  completedBoxes,
  sokobanStep,
  fleet,
  logicGames,
} from "./logicCollection";
describe("logic collection rules", () => {
  it("provides ten distinct games and useful instructions", () => {
    expect(new Set(logicGames.map((g) => g.id)).size).toBe(10);
    expect(logicGames.every((g) => g.help.length > 50)).toBe(true);
  });
  it("counts duplicate secret digits only once", () => {
    expect(codeFeedback([1, 1, 2, 3], [1, 2, 1, 1])).toEqual({
      exact: 1,
      misplaced: 2,
    });
    expect(codeFeedback([2, 2, 2], [1, 2, 1])).toEqual({
      exact: 1,
      misplaced: 0,
    });
  });
  it("generates valid Sudoku rows columns and regions for both sizes", () => {
    for (const size of [4, 9])
      for (let seed = 0; seed < 3; seed++) {
        const solution = sudokuSolution(size, seed),
          box = Math.sqrt(size);
        for (let i = 0; i < size; i++) {
          expect(new Set(solution.slice(i * size, (i + 1) * size)).size).toBe(
            size,
          );
          expect(new Set(solution.filter((_, n) => n % size === i)).size).toBe(
            size,
          );
        }
        for (let r = 0; r < size; r += box)
          for (let c = 0; c < size; c += box) {
            const region = [];
            for (let y = 0; y < box; y++)
              for (let x = 0; x < box; x++)
                region.push(solution[(r + y) * size + c + x]);
            expect(new Set(region).size).toBe(size);
          }
      }
  });
  it("separates nonogram runs and describes empty rows", () => {
    expect(runs([true, true, false, true, false])).toEqual([2, 1]);
    expect(runs([false, false])).toEqual([0]);
  });
  it("accepts alternative valid Sudoku solutions and rejects repeats and incomplete values", () => {
    const values = sudokuSolution(4, 0);
    expect(validSudoku(values, 4)).toBe(true);
    expect(
      validSudoku(
        values.map((v) => 5 - v),
        4,
      ),
    ).toBe(true);
    const bad = [...values];
    bad[0] = bad[1];
    expect(validSudoku(bad, 4)).toBe(false);
    bad[0] = 0;
    expect(validSudoku(bad, 4)).toBe(false);
  });
  it("rejects illegal Hanoi moves without mutating towers", () => {
    const towers = [[3, 2], [1], []];
    expect(hanoiMove(towers, 0, 1)).toBeNull();
    expect(hanoiMove(towers, 1, 2)).toEqual([[3, 2], [], [1]]);
    expect(towers).toEqual([[3, 2], [1], []]);
  });
  it("flips only bracketed reversi pieces and never wraps a row", () => {
    const board = Array(36).fill(0);
    board[13] = 2;
    board[14] = 2;
    board[15] = 1;
    expect(reversiFlips(board, 12, 1)).toEqual([13, 14]);
    board[5] = 2;
    board[6] = 1;
    expect(reversiFlips(board, 4, 1)).toEqual([]);
    expect(reversiFlips(board, 15, 1)).toEqual([]);
  });
  it("all maze difficulties connect entry and exit without crossing walls", () => {
    for (const size of [9, 11, 13])
      for (let seed = 0; seed < 10; seed++) {
        const walls = maze(size, seed),
          route = path(walls, size, size + 1, (size - 2) * size + size - 2);
        expect(route.length).toBeGreaterThan(1);
        expect(route.every((i) => !walls[i])).toBe(true);
        route
          .slice(1)
          .forEach((at, i) =>
            expect([1, size]).toContain(Math.abs(at - route[i])),
          );
      }
  });
  it("boxes close only when all four unique edges exist", () => {
    const edges = Array(12).fill(0);
    boxEdges(0, 0, 2)
      .slice(0, 3)
      .forEach((i) => (edges[i] = 1));
    expect(completedBoxes(edges, 2)).toEqual([false, false, false, false]);
    edges[boxEdges(0, 0, 2)[3]] = 2;
    expect(completedBoxes(edges, 2)).toEqual([true, false, false, false]);
  });
  it("Sokoban pushes one box but cannot push two or wrap", () => {
    expect(sokobanStep(8, [9], [], 1)).toEqual({ position: 9, boxes: [10] });
    expect(sokobanStep(8, [9, 10], [], 1)).toBeNull();
    expect(sokobanStep(6, [], [], 1)).toBeNull();
    expect(sokobanStep(8, [9], [10], 1)).toBeNull();
  });
  it("generates a full nonoverlapping fleet with in-bounds paired segments", () => {
    for (const size of [6, 7, 8])
      for (let seed = 0; seed < 30; seed++) {
        const cells = fleet(size, size - 3, seed);
        expect(cells).toHaveLength((size - 3) * 2);
        expect(new Set(cells).size).toBe(cells.length);
        cells.forEach((i) => expect(i >= 0 && i < size * size).toBe(true));
        for (let i = 0; i < cells.length; i += 2) {
          expect(cells[i + 1]).toBe(cells[i] + 1);
          expect(Math.floor(cells[i] / size)).toBe(
            Math.floor(cells[i + 1] / size),
          );
        }
      }
  });
});
