import { describe, expect, it } from "vitest";
import {
  applyCheckersMove,
  chooseCheckersBotMove,
  createCheckersBoard,
  getCheckersLegalMoves,
  getCheckersMovesFrom,
  getCheckersContinuationFrom,
  getCheckersWinner,
  type CheckersBoard,
} from "./checkers";

describe("checkers", () => {
  it("creates classic and quick boards with expected piece counts", () => {
    expect(createCheckersBoard("classic").filter(Boolean)).toHaveLength(24);
    expect(createCheckersBoard("quick").filter(Boolean)).toHaveLength(16);
  });

  it("enforces captures when one is available", () => {
    const board: CheckersBoard = Array.from({ length: 64 }, () => null);
    board[42] = { player: "blue", king: false };
    board[33] = { player: "red", king: false };
    board[44] = { player: "blue", king: false };

    const moves = getCheckersLegalMoves(board, "blue");
    expect(moves).toEqual([{ from: 42, to: 24, capture: 33 }]);
  });

  it("allows regular pieces to capture backwards", () => {
    const board: CheckersBoard = Array.from({ length: 64 }, () => null);
    board[26] = { player: "blue", king: false };
    board[35] = { player: "red", king: false };
    expect(getCheckersMovesFrom(board, 26, true)).toContainEqual({
      from: 26,
      to: 44,
      capture: 35,
    });
  });

  it("applies captures and promotes pieces", () => {
    const board: CheckersBoard = Array.from({ length: 64 }, () => null);
    board[17] = { player: "blue", king: false };
    board[10] = { player: "red", king: false };

    const next = applyCheckersMove(board, { from: 17, to: 3, capture: 10 });
    expect(next[10]).toBeNull();
    expect(next[3]).toEqual({ player: "blue", king: true });
  });

  it("returns a winner when the opponent has no pieces", () => {
    const board: CheckersBoard = Array.from({ length: 64 }, () => null);
    board[42] = { player: "blue", king: false };
    expect(getCheckersWinner(board, "red")).toBe("blue");
  });

  it("hard bot prioritizes a forced capture", () => {
    const board: CheckersBoard = Array.from({ length: 64 }, () => null);
    board[17] = { player: "red", king: false };
    board[26] = { player: "blue", king: false };
    const move = chooseCheckersBotMove(board, "red", "hard", () => 0);
    expect(move?.capture).toBe(26);
    expect(
      getCheckersMovesFrom(board, 17).some(
        (candidate) => candidate.capture === 26,
      ),
    ).toBe(true);
  });

  it("keeps a forced continuation only while another capture exists", () => {
    const board: CheckersBoard = Array.from({ length: 64 }, () => null);
    board[17] = { player: "red", king: false };
    board[26] = { player: "blue", king: false };
    board[44] = { player: "blue", king: false };

    const first = { from: 17, to: 35, capture: 26 };
    const afterFirst = applyCheckersMove(board, first);
    expect(getCheckersContinuationFrom(afterFirst, first)).toBe(35);

    const second = { from: 35, to: 53, capture: 44 };
    const afterSecond = applyCheckersMove(afterFirst, second);
    expect(getCheckersContinuationFrom(afterSecond, second)).toBeNull();
  });

  it("keeps a bot multi-capture on the same piece", () => {
    const board: CheckersBoard = Array.from({ length: 64 }, () => null);
    board[17] = { player: "red", king: false };
    board[26] = { player: "blue", king: false };
    board[44] = { player: "blue", king: false };

    const first = chooseCheckersBotMove(board, "red", "master", () => 0);
    expect(first).toEqual({ from: 17, to: 35, capture: 26 });

    const afterFirst = applyCheckersMove(board, first!);
    const continuation = chooseCheckersBotMove(
      afterFirst,
      "red",
      "master",
      () => 0,
      35,
    );
    expect(continuation).toEqual({ from: 35, to: 53, capture: 44 });
  });

  it("does not switch to another piece during a forced continuation", () => {
    const board: CheckersBoard = Array.from({ length: 64 }, () => null);
    board[17] = { player: "red", king: false };
    board[42] = { player: "red", king: false };
    board[26] = { player: "blue", king: false };

    expect(
      chooseCheckersBotMove(board, "red", "master", () => 0, 42),
    ).toBeNull();
  });
  it("evaluates the entire capture chain before the opponent can reply", () => {
    const board: CheckersBoard = Array.from({ length: 64 }, () => null);
    board[17] = { player: "red", king: false };
    board[21] = { player: "red", king: false };
    for (const square of [26, 44, 30]) board[square] = { player: "blue", king: false };
    const snapshot = structuredClone(board);
    for (const level of ["master", "expert"] as const) {
      expect(chooseCheckersBotMove(board, "red", level, () => 0)).toEqual({ from: 17, to: 35, capture: 26 });
    }
    expect(board).toEqual(snapshot);
  });

});
