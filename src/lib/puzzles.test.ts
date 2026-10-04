import { describe, it, expect } from "vitest";
import {
  dropDisc,
  discWinner,
  movePuzzle,
  puzzleSolved,
  shuffledPuzzle,
  solvedPuzzle,
} from "./puzzles";
describe("Liga 4", () => {
  it("drops to bottom, rejects full columns and keeps input intact", () => {
    let b = Array(42).fill(0);
    const old = [...b];
    b = dropDisc(b, 0, 1)!;
    expect(b[35]).toBe(1);
    expect(old.every((v) => v === 0)).toBe(true);
    for (let i = 0; i < 5; i++) b = dropDisc(b, 0, 2)!;
    expect(dropDisc(b, 0, 1)).toBeNull();
  });
  it("detects horizontal vertical and both diagonals without wrapping", () => {
    for (const cells of [
      [35, 36, 37, 38],
      [0, 7, 14, 21],
      [0, 8, 16, 24],
      [6, 12, 18, 24],
    ]) {
      const b = Array(42).fill(0);
      cells.forEach((i) => (b[i] = 2));
      expect(discWinner(b)).toBe(2);
    }
    const b = Array(42).fill(0);
    [5, 6, 7, 8].forEach((i) => (b[i] = 1));
    expect(discWinner(b)).toBe(0);
  });
});
describe("Sliding puzzle", () => {
  it("allows only adjacent tiles without wrapping rows", () => {
    expect(movePuzzle(solvedPuzzle, 7)).toEqual([1, 2, 3, 4, 5, 6, 7, 0, 8]);
    expect(movePuzzle(solvedPuzzle, 5)).not.toBeNull();
    expect(movePuzzle(solvedPuzzle, 6)).toBeNull();
    expect(movePuzzle([1, 2, 0, 4, 5, 6, 7, 8, 3], 3)).toBeNull();
  });
  it("always creates valid solvable unsolved boards", () => {
    for (let k = 0; k < 40; k++) {
      const b = shuffledPuzzle();
      expect([...b].sort()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
      expect(puzzleSolved(b)).toBe(false);
      const numbers = b.filter(Boolean);
      let inversions = 0;
      numbers.forEach((v, i) =>
        numbers.slice(i + 1).forEach((w) => {
          if (v > w) inversions++;
        }),
      );
      expect(inversions % 2).toBe(0);
    }
  });
});
