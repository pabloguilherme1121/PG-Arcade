import { describe, expect, it } from "vitest";
import { chooseDiscMove, winningDiscs, discColumnFromKey } from "./connectFour";
import { discWinner, dropDisc } from "./puzzles";
describe("Liga 4 keyboard input", () => {
  it("maps number keys 1 through 7 directly to columns", () => {
    expect(discColumnFromKey("1")).toBe(0);
    expect(discColumnFromKey("4")).toBe(3);
    expect(discColumnFromKey("7")).toBe(6);
    expect(discColumnFromKey("0")).toBeNull();
    expect(discColumnFromKey("8")).toBeNull();
    expect(discColumnFromKey("ArrowLeft")).toBeNull();
  });
});

describe("Liga 4 tactical bot", () => {
  it("wins instead of blocking an opponent and never mutates the board", () => {
    let board = Array(42).fill(0);
    for (const c of [0, 1, 2]) board = dropDisc(board, c, 2)!;
    for (const c of [4, 5, 6]) board = dropDisc(board, c, 1)!;
    const original = [...board];
    for (const level of ["normal", "hard"] as const) {
      expect(chooseDiscMove(board, 2, level)).toBe(3);
      expect(winningDiscs(dropDisc(board, 3, 2)!)).toEqual([35, 36, 37, 38]);
    }
    expect(board).toEqual(original);
  });
  it("blocks vertical threats, skips full columns and handles terminal boards", () => {
    let board = Array(42).fill(0);
    for (let n = 0; n < 3; n++) board = dropDisc(board, 5, 1)!;
    expect(chooseDiscMove(board, 2, "hard")).toBe(5);
    for (let n = 0; n < 6; n++) board = dropDisc(board, 0, n % 2 + 1)!;
    for (const level of ["easy", "normal", "hard"] as const) expect(chooseDiscMove(board, 2, level, () => 1)).not.toBe(0);
    board = dropDisc(board, 5, 1)!;
    expect(chooseDiscMove(board, 2, "hard")).toBeNull();
  });
  it("finishes complete bot matches with legal moves and no mutation", () => {
    for (const level of ["normal", "hard"] as const) {
      let board = Array(42).fill(0), player = 1;
      for (let n = 0; n < 42 && !discWinner(board); n++) {
        const column = chooseDiscMove(board, player, level);
        if (column === null) { expect(board.every(Boolean)).toBe(true); break; }
        const next = dropDisc(board, column, player);
        expect(next).not.toBeNull();
        expect(next!.filter(Boolean)).toHaveLength(n + 1);
        board = next!; player = 3 - player;
      }
      expect(!!discWinner(board) || board.every(Boolean)).toBe(true);
    }
  });
});
