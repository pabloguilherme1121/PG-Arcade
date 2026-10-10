import { describe, expect, it } from "vitest";
import { spawn2048, stepSnake } from "./engines";
import { shuffledPuzzle, puzzleSolved } from "./puzzles";

describe("Snake portals", () => {
  it("crosses every edge while classic walls remain fatal", () => {
    for (const [point, direction, destination] of [
      [{ x: 0, y: 5 }, "left", { x: 15, y: 5 }],
      [{ x: 15, y: 5 }, "right", { x: 0, y: 5 }],
      [{ x: 5, y: 0 }, "up", { x: 5, y: 15 }],
      [{ x: 5, y: 15 }, "down", { x: 5, y: 0 }],
    ] as const) {
      expect(stepSnake([point], direction, { x: 8, y: 8 }).collision).toBe(true);
      const result = stepSnake([point], direction, { x: 8, y: 8 }, 16, true);
      expect(result.collision).toBe(false);
      expect(result.body[0]).toEqual(destination);
    }
  });
  it("still detects body collisions and grows on food across a portal", () => {
    const body = [{ x: 0, y: 5 }, { x: 15, y: 5 }, { x: 14, y: 5 }];
    expect(stepSnake(body, "left", { x: 8, y: 8 }, 16, true).collision).toBe(true);
    const result = stepSnake([{ x: 0, y: 5 }], "left", { x: 15, y: 5 }, 16, true);
    expect(result.ate).toBe(true);
    expect(result.body).toHaveLength(2);
  });
});
it("2048 difficulty changes the spawn distribution without overwriting tiles", () => {
  const board = [8, ...Array(15).fill(0)];
  expect(spawn2048(board, () => .8, .98)).toContain(2);
  expect(spawn2048(board, () => .8, .7)).toContain(4);
  expect(spawn2048(board, () => .8, .7)[0]).toBe(8);
  expect(board.filter(Boolean)).toEqual([8]);
});
it("every puzzle difficulty produces a solvable, unfinished permutation", () => {
  for (const depth of [12, 40, 100]) {
    for (let sample = 0; sample < 20; sample++) {
      const board = shuffledPuzzle(Math.random, depth);
      expect([...board].sort()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
      const tiles = board.filter(Boolean);
      const inversions = tiles.reduce((total, value, i) => total + tiles.slice(i + 1).filter((next) => value > next).length, 0);
      expect(inversions % 2).toBe(0);
      expect(puzzleSolved(board)).toBe(false);
    }
  }
});
