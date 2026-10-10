import { describe, expect, it } from "vitest";
import { chooseDiscMove, winningDiscs, discColumnFromKey, discLandingIndex, nextDiscColumn } from "./connectFour";
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
  it("cached winning lines match the independent rules engine on legal games", () => {
    let seed = 14831;
    for (let game = 0; game < 30; game++) {
      let board = Array(42).fill(0), player = 1;
      for (let turn = 0; turn < 42; turn++) {
        const legal = Array.from({ length: 7 }, (_, c) => c).filter((c) => !board[c]);
        if (!legal.length) break;
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        board = dropDisc(board, legal[seed % legal.length], player)!;
        const winner = discWinner(board);
        const cells = winningDiscs(board);
        expect(cells.length).toBe(winner ? 4 : 0);
        if (winner) {
          expect(cells.every((i) => board[i] === winner)).toBe(true);
          cells[0] = -1;
          expect(winningDiscs(board)).not.toContain(-1);
          break;
        }
        player = 3 - player;
      }
    }
  });

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

describe("Liga 4 preview and keyboard targeting", () => {
  it("predicts a gravity landing without modifying the board", () => {
    const board = Array(42).fill(0);
    expect(discLandingIndex(board, 3)).toBe(38);
    const placed = dropDisc(board, 3, 1)!;
    expect(discLandingIndex(placed, 3)).toBe(31);
    expect(discLandingIndex(placed, -1)).toBeNull();
    expect(discLandingIndex(placed, 7)).toBeNull();
    expect(board.every(value => value === 0)).toBe(true);
  });

  it("refuses full columns and advances only through playable columns", () => {
    let board = Array(42).fill(0);
    for (let i = 0; i < 6; i++) board = dropDisc(board, 2, (i % 2) + 1)!;
    expect(discLandingIndex(board, 2)).toBeNull();
    expect(nextDiscColumn(board, 3, -1)).toBe(1);
    expect(nextDiscColumn(board, 1, 1)).toBe(3);
    expect(nextDiscColumn(board, 6, 1)).toBe(6);
    expect(nextDiscColumn(board, 0, -1)).toBe(0);
    expect(nextDiscColumn(board, 1, 0)).toBe(1);
  });
});
