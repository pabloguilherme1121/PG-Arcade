import { describe, expect, it } from "vitest";
import {
  applyChessMove,
  chooseChessBotMove,
  createInitialChessState,
  getChessLegalMoves,
  getChessStatus,
  getChessSearchDepth,
  isChessKingInCheck,
  type ChessBoard,
  type ChessState,
} from "./chess";
const position = (
  board: ChessBoard,
  turn: ChessState["turn"] = "white",
): ChessState => ({
  ...createInitialChessState(),
  board,
  turn,
  castling: {
    whiteKingSide: false,
    whiteQueenSide: false,
    blackKingSide: false,
    blackQueenSide: false,
  },
  enPassant: null,
});
describe("chess difficulty", () => {
  it("returns a legal move without mutating the position when analysis runs out of time", () => {
    const state = applyChessMove(createInitialChessState(), { from: 52, to: 36 })!;
    const snapshot = structuredClone(state);
    let time = 0;
    const move = chooseChessBotMove(state, "black", "expert", () => 0, {
      maxMs: 30,
      now: () => time++,
    });
    expect(getChessLegalMoves(state, "black")).toContainEqual(move);
    expect(time).toBeLessThanOrEqual(32);
    expect(state).toEqual(snapshot);
  });
  it("increases search depth through expert difficulty", () => {
    expect(getChessSearchDepth("normal")).toBe(1);
    expect(getChessSearchDepth("hard")).toBe(2);
    expect(getChessSearchDepth("master")).toBe(3);
    expect(getChessSearchDepth("expert")).toBe(4);
  });
});

describe("chess", () => {
  it("hard and master avoid sacrificing a queen for a defended pawn", () => {
    const b: ChessBoard = Array(64).fill(null);
    b[63] = { color: "white", type: "king" };
    b[59] = { color: "white", type: "queen" };
    b[0] = { color: "black", type: "king" };
    b[3] = { color: "black", type: "rook" };
    b[35] = { color: "black", type: "pawn" };
    expect(chooseChessBotMove(position(b), "white", "normal", () => 0)).toEqual(
      { from: 59, to: 35 },
    );
    for (const level of ["hard", "master"] as const)
      expect(
        chooseChessBotMove(position(b), "white", level, () => 0),
      ).not.toEqual({ from: 59, to: 35 });
  });
  it("creates a standard board and 20 legal opening moves", () => {
    const b = createInitialChessState().board;
    expect(b.filter(Boolean)).toHaveLength(32);
    expect(getChessLegalMoves(position(b), "white")).toHaveLength(20);
  });
  it("prevents moves that leave the king in check", () => {
    const b: ChessBoard = Array(64).fill(null);
    b[60] = { color: "white", type: "king" };
    b[52] = { color: "white", type: "rook" };
    b[4] = { color: "black", type: "rook" };
    b[0] = { color: "black", type: "king" };
    expect(isChessKingInCheck(b, "white")).toBe(false);
    expect(
      getChessLegalMoves(position(b), "white").some(
        (m) => m.from === 52 && m.to === 51,
      ),
    ).toBe(false);
  });
  it("promotes pawns to queen", () => {
    const b: ChessBoard = Array(64).fill(null);
    b[60] = { color: "white", type: "king" };
    b[4] = { color: "black", type: "king" };
    b[8] = { color: "white", type: "pawn" };
    const m = getChessLegalMoves(position(b), "white").find(
      (x) => x.from === 8 && x.to === 0,
    )!;
    expect(applyChessMove(position(b), m)?.board[0]?.type).toBe("queen");
  });
  it("detects checkmate", () => {
    const b: ChessBoard = Array(64).fill(null);
    b[0] = { color: "black", type: "king" };
    b[9] = { color: "white", type: "queen" };
    b[18] = { color: "white", type: "king" };
    expect(getChessStatus(position(b, "black")).kind).toBe("checkmate");
  });
  it("master bot always returns a legal move", () => {
    const b = createInitialChessState().board;
    const m = chooseChessBotMove(position(b), "black", "master", () => 0);
    expect(m).not.toBeNull();
    expect(getChessLegalMoves(position(b), "black")).toContainEqual(m);
  });
});

describe("chess promotion choice", () => {
  it("offers all four legal promotions on advance and capture, with queen as default", () => {
    const board: ChessBoard = Array(64).fill(null);
    board[60] = { color: "white", type: "king" };
    board[7] = { color: "black", type: "king" };
    board[8] = { color: "white", type: "pawn" };
    board[1] = { color: "black", type: "rook" };
    const state = position(board);
    for (const to of [0, 1]) {
      const moves = getChessLegalMoves(state).filter((m) => m.from === 8 && m.to === to);
      expect(moves.map((m) => m.promotion)).toEqual(["queen", "rook", "bishop", "knight"]);
      for (const move of moves) expect(applyChessMove(state, move)?.board[to]?.type).toBe(move.promotion);
      expect(applyChessMove(state, { from: 8, to })?.board[to]?.type).toBe("queen");
      expect(applyChessMove(state, { from: 8, to, promotion: "pawn" as never })).toBeNull();
    }
    expect(state.board[8]?.type).toBe("pawn");
  });
});
