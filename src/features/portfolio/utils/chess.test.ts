import { describe, expect, it } from "vitest";
import {
  applyChessMove,
  chooseChessBotMove,
  createInitialChessState,
  getChessLegalMoves,
  getChessStatus,
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
