import { describe, it, expect } from "vitest";
import {
  handValue,
  diceScore,
  matches,
  adjacent,
  swapJewels,
  makeJewels,
  settleJewels,
  hasJewelMove,
  projectile,
  basketHit,
  arrowImpact,
  arrowPoints,
  bowlingHit,
  golfStroke,
  casualGames,
  moveGridCursor,
} from "./casualCollection";
describe("casual grid controls", () => {
  it("moves within grid rows and columns without wrapping across edges", () => {
    expect(moveGridCursor(5, "ArrowRight", 6, 36)).toBe(5);
    expect(moveGridCursor(6, "ArrowLeft", 6, 36)).toBe(6);
    expect(moveGridCursor(0, "ArrowUp", 6, 36)).toBe(0);
    expect(moveGridCursor(35, "ArrowDown", 6, 36)).toBe(35);
    expect(moveGridCursor(7, "ArrowRight", 6, 36)).toBe(8);
    expect(moveGridCursor(7, "ArrowDown", 6, 36)).toBe(13);
  });
});

describe("casual collection engines", () => {
  it("adjusts aces only as needed and caps face cards", () => {
    expect(handValue([1, 1, 9])).toBe(21);
    expect(handValue([13, 12, 2])).toBe(22);
    expect(handValue([1, 1, 1, 8])).toBe(21);
  });
  it("scores distinct dice combinations and rewards five equal dice", () => {
    expect(diceScore([6, 6, 6, 6, 6])).toBe(130);
    expect(diceScore([1, 2, 3, 4, 5])).toBe(95);
    expect(diceScore([3, 3, 3, 2, 2])).toBe(63);
    expect(diceScore([1, 1, 2, 2, 6])).toBe(32);
  });
  it("does not consider the edge between two rows adjacent", () => {
    expect(adjacent(5, 6)).toBe(false);
    expect(adjacent(5, 11)).toBe(true);
    expect(adjacent(0, 0)).toBe(false);
  });
  it("creates an initial match-free board even with a constant random source", () => {
    expect(matches(makeJewels(() => 0))).toEqual([]);
  });
  it("rejects swaps that do not create matches", () => {
    const board = makeJewels(() => 0);
    expect(swapJewels(board, 5, 6)).toBeNull();
    expect(swapJewels(board, 0, 6)).toBeNull();
  });
  it("removes intersections once and grants increasing cascade points", () => {
    const board = Array.from(
      { length: 36 },
      (_, i) => (i + Math.floor(i / 6)) % 5,
    );
    board[0] = board[1] = board[2] = 4;
    expect(matches(board)).toContain(0);
    let n = 0;
    const resolved = settleJewels(board, () => ((n++ * 3) % 7) / 7);
    expect(resolved.score).toBeGreaterThanOrEqual(30);
    expect(resolved.board).toHaveLength(36);
    expect(resolved.board.every((v) => v >= 0 && v <= 4)).toBe(true);
  });
  it("finds at least one accessible scoring move", () => {
    const board = makeJewels(() => 0.3);
    board[0] = 1;
    board[1] = 2;
    board[2] = 1;
    board[7] = 1;
    expect(hasJewelMove(board)).toBe(true);
    expect(swapJewels(board, 1, 7)).not.toBeNull();
  });
  it("basketball counts descending crossings only", () => {
    expect(
      basketHit([
        { x: 285, y: 135 },
        { x: 285, y: 115 },
      ]),
    ).toBe(false);
    expect(
      basketHit([
        { x: 280, y: 120 },
        { x: 290, y: 130 },
      ]),
    ).toBe(true);
    expect(
      basketHit([
        { x: 320, y: 120 },
        { x: 330, y: 130 },
      ]),
    ).toBe(false);
  });
  it("basketball has a physically reachable basket with the provided controls", () => {
    let reachable = false;
    for (let a = 0; a <= 100; a++)
      for (let p = 10; p <= 100; p++)
        if (basketHit(projectile(a, p, 0), 8)) reachable = true;
    expect(reachable).toBe(true);
  });
  it("archery responds to wind and centers yield the highest score", () => {
    expect(arrowImpact(150, 100, 5)).toBeGreaterThan(150);
    expect(arrowPoints(150)).toBe(100);
    expect(arrowPoints(260)).toBe(0);
  });
  it("bowling keeps previously knocked pins down", () => {
    const pins = Array(10).fill(true);
    pins[0] = false;
    expect(bowlingHit(pins, 50, 100)[0]).toBe(false);
    expect(bowlingHit(pins, 50, 100).filter(Boolean).length).toBeLessThan(9);
  });
  it("golf obstacle stops weak shots and hole requires controlled speed", () => {
    expect(golfStroke(150, 100, 60, true).position).toBe(165);
    expect(golfStroke(300, 60, 25, false).hole).toBe(true);
    expect(golfStroke(300, 53, 100, false).hole).toBe(false);
  });
  it("provides eight unique game IDs and useful instructions", () => {
    expect(new Set(casualGames.map((g) => g.id)).size).toBe(8);
    expect(casualGames.every((g) => g.help.length > 50)).toBe(true);
  });
});
