export type ChessColor = "white" | "black";
export type ChessPieceType =
  | "pawn"
  | "knight"
  | "bishop"
  | "rook"
  | "queen"
  | "king";
export type ChessPiece = { color: ChessColor; type: ChessPieceType };
export type ChessBoard = Array<ChessPiece | null>;
export type ChessDifficulty = "easy" | "normal" | "hard" | "master" | "expert";
export type ChessMove = {
  from: number;
  to: number;
  promotion?: Exclude<ChessPieceType, "pawn" | "king">;
  castle?: "king" | "queen";
  enPassantCapture?: number;
};
export type ChessState = {
  board: ChessBoard;
  turn: ChessColor;
  castling: {
    whiteKingSide: boolean;
    whiteQueenSide: boolean;
    blackKingSide: boolean;
    blackQueenSide: boolean;
  };
  enPassant: number | null;
};

const BOARD = 8;
const rc = (index: number) => ({
  row: Math.floor(index / BOARD),
  col: index % BOARD,
});
const idx = (row: number, col: number) => row * BOARD + col;
const inside = (row: number, col: number) =>
  row >= 0 && row < BOARD && col >= 0 && col < BOARD;
const other = (color: ChessColor): ChessColor =>
  color === "white" ? "black" : "white";

export function createInitialChessState(): ChessState {
  const board: ChessBoard = Array.from({ length: 64 }, () => null);
  const back: ChessPieceType[] = [
    "rook",
    "knight",
    "bishop",
    "queen",
    "king",
    "bishop",
    "knight",
    "rook",
  ];
  for (let col = 0; col < 8; col += 1) {
    board[col] = { color: "black", type: back[col] };
    board[8 + col] = { color: "black", type: "pawn" };
    board[48 + col] = { color: "white", type: "pawn" };
    board[56 + col] = { color: "white", type: back[col] };
  }
  return {
    board,
    turn: "white",
    castling: {
      whiteKingSide: true,
      whiteQueenSide: true,
      blackKingSide: true,
      blackQueenSide: true,
    },
    enPassant: null,
  };
}

function rayMoves(
  board: ChessBoard,
  from: number,
  color: ChessColor,
  directions: Array<[number, number]>,
) {
  const { row, col } = rc(from);
  const moves: ChessMove[] = [];
  for (const [dr, dc] of directions) {
    let r = row + dr;
    let c = col + dc;
    while (inside(r, c)) {
      const to = idx(r, c);
      const target = board[to];
      if (!target) moves.push({ from, to });
      else {
        if (target.color !== color && target.type !== "king")
          moves.push({ from, to });
        break;
      }
      r += dr;
      c += dc;
    }
  }
  return moves;
}

function attackSquares(board: ChessBoard, from: number): number[] {
  const piece = board[from];
  if (!piece) return [];
  const { row, col } = rc(from);
  if (piece.type === "pawn") {
    const dr = piece.color === "white" ? -1 : 1;
    return [-1, 1]
      .map((dc) => [row + dr, col + dc] as const)
      .filter(([r, c]) => inside(r, c))
      .map(([r, c]) => idx(r, c));
  }
  if (piece.type === "knight") {
    return [
      [-2, -1],
      [-2, 1],
      [-1, -2],
      [-1, 2],
      [1, -2],
      [1, 2],
      [2, -1],
      [2, 1],
    ]
      .map(([dr, dc]) => [row + dr, col + dc] as const)
      .filter(([r, c]) => inside(r, c))
      .map(([r, c]) => idx(r, c));
  }
  if (piece.type === "king") {
    const squares: number[] = [];
    for (let dr = -1; dr <= 1; dr += 1)
      for (let dc = -1; dc <= 1; dc += 1)
        if ((dr || dc) && inside(row + dr, col + dc))
          squares.push(idx(row + dr, col + dc));
    return squares;
  }
  const dirs =
    piece.type === "bishop"
      ? [
          [-1, -1],
          [-1, 1],
          [1, -1],
          [1, 1],
        ]
      : piece.type === "rook"
        ? [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
          ]
        : [
            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1],
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
          ];
  const squares: number[] = [];
  for (const [dr, dc] of dirs) {
    let r = row + dr,
      c = col + dc;
    while (inside(r, c)) {
      squares.push(idx(r, c));
      if (board[idx(r, c)]) break;
      r += dr;
      c += dc;
    }
  }
  return squares;
}

export function isChessSquareAttacked(
  board: ChessBoard,
  square: number,
  by: ChessColor,
) {
  return board.some(
    (piece, from) =>
      piece?.color === by && attackSquares(board, from).includes(square),
  );
}

export function isChessKingInCheck(board: ChessBoard, color: ChessColor) {
  const king = board.findIndex(
    (piece) => piece?.color === color && piece.type === "king",
  );
  return king >= 0 && isChessSquareAttacked(board, king, other(color));
}

function pseudoMoves(state: ChessState, from: number): ChessMove[] {
  const piece = state.board[from];
  if (!piece) return [];
  const { row, col } = rc(from);
  const board = state.board;
  if (piece.type === "pawn") {
    const dr = piece.color === "white" ? -1 : 1;
    const start = piece.color === "white" ? 6 : 1;
    const promotionRow = piece.color === "white" ? 0 : 7;
    const moves: ChessMove[] = [];
    const oneRow = row + dr;
    if (inside(oneRow, col) && !board[idx(oneRow, col)]) {
      const to = idx(oneRow, col);
      moves.push({
        from,
        to,
        ...(oneRow === promotionRow ? { promotion: "queen" as const } : {}),
      });
      const twoRow = row + dr * 2;
      if (row === start && !board[idx(twoRow, col)])
        moves.push({ from, to: idx(twoRow, col) });
    }
    for (const dc of [-1, 1]) {
      const r = row + dr,
        c = col + dc;
      if (!inside(r, c)) continue;
      const to = idx(r, c);
      const target = board[to];
      if (target && target.color !== piece.color && target.type !== "king")
        moves.push({
          from,
          to,
          ...(r === promotionRow ? { promotion: "queen" as const } : {}),
        });
      else if (
        state.turn === piece.color &&
        !target &&
        state.enPassant === to &&
        board[idx(row, c)]?.type === "pawn" &&
        board[idx(row, c)]?.color === other(piece.color)
      )
        moves.push({ from, to, enPassantCapture: idx(row, c) });
    }
    return moves;
  }
  if (piece.type === "knight") {
    return [
      [-2, -1],
      [-2, 1],
      [-1, -2],
      [-1, 2],
      [1, -2],
      [1, 2],
      [2, -1],
      [2, 1],
    ]
      .map(([dr, dc]) => [row + dr, col + dc] as const)
      .filter(([r, c]) => inside(r, c))
      .map(([r, c]) => ({ from, to: idx(r, c) }))
      .filter(
        (move) =>
          !board[move.to] ||
          (board[move.to]?.color !== piece.color &&
            board[move.to]?.type !== "king"),
      );
  }
  if (piece.type === "bishop")
    return rayMoves(board, from, piece.color, [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ]);
  if (piece.type === "rook")
    return rayMoves(board, from, piece.color, [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]);
  if (piece.type === "queen")
    return rayMoves(board, from, piece.color, [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]);

  const moves: ChessMove[] = [];
  for (let dr = -1; dr <= 1; dr += 1)
    for (let dc = -1; dc <= 1; dc += 1) {
      if (!dr && !dc) continue;
      const r = row + dr,
        c = col + dc;
      if (!inside(r, c)) continue;
      const to = idx(r, c);
      if (
        !board[to] ||
        (board[to]?.color !== piece.color && board[to]?.type !== "king")
      )
        moves.push({ from, to });
    }
  const enemy = other(piece.color);
  const homeRow = piece.color === "white" ? 7 : 0;
  const kingSide =
    piece.color === "white"
      ? state.castling.whiteKingSide
      : state.castling.blackKingSide;
  const queenSide =
    piece.color === "white"
      ? state.castling.whiteQueenSide
      : state.castling.blackQueenSide;
  if (row === homeRow && col === 4 && !isChessKingInCheck(board, piece.color)) {
    if (
      kingSide &&
      !board[idx(homeRow, 5)] &&
      !board[idx(homeRow, 6)] &&
      board[idx(homeRow, 7)]?.type === "rook" &&
      board[idx(homeRow, 7)]?.color === piece.color &&
      !isChessSquareAttacked(board, idx(homeRow, 5), enemy) &&
      !isChessSquareAttacked(board, idx(homeRow, 6), enemy)
    ) {
      moves.push({ from, to: idx(homeRow, 6), castle: "king" });
    }
    if (
      queenSide &&
      !board[idx(homeRow, 1)] &&
      !board[idx(homeRow, 2)] &&
      !board[idx(homeRow, 3)] &&
      board[idx(homeRow, 0)]?.type === "rook" &&
      board[idx(homeRow, 0)]?.color === piece.color &&
      !isChessSquareAttacked(board, idx(homeRow, 3), enemy) &&
      !isChessSquareAttacked(board, idx(homeRow, 2), enemy)
    ) {
      moves.push({ from, to: idx(homeRow, 2), castle: "queen" });
    }
  }
  return moves;
}

function applyUnchecked(state: ChessState, move: ChessMove): ChessState {
  const board = state.board.map((piece) => (piece ? { ...piece } : null));
  const piece = board[move.from];
  if (!piece) return state;
  const target = board[move.to];
  board[move.from] = null;
  if (move.enPassantCapture !== undefined) board[move.enPassantCapture] = null;
  board[move.to] = { ...piece, type: move.promotion ?? piece.type };
  if (move.castle) {
    const row = piece.color === "white" ? 7 : 0;
    const rookFrom = move.castle === "king" ? idx(row, 7) : idx(row, 0);
    const rookTo = move.castle === "king" ? idx(row, 5) : idx(row, 3);
    board[rookTo] = board[rookFrom];
    board[rookFrom] = null;
  }
  const castling = { ...state.castling };
  if (piece.type === "king") {
    if (piece.color === "white") {
      castling.whiteKingSide = false;
      castling.whiteQueenSide = false;
    } else {
      castling.blackKingSide = false;
      castling.blackQueenSide = false;
    }
  }
  const disableRook = (square: number) => {
    if (square === 63) castling.whiteKingSide = false;
    if (square === 56) castling.whiteQueenSide = false;
    if (square === 7) castling.blackKingSide = false;
    if (square === 0) castling.blackQueenSide = false;
  };
  if (piece.type === "rook") disableRook(move.from);
  if (target?.type === "rook") disableRook(move.to);
  const fromRC = rc(move.from),
    toRC = rc(move.to);
  const enPassant =
    piece.type === "pawn" && Math.abs(toRC.row - fromRC.row) === 2
      ? idx((toRC.row + fromRC.row) / 2, fromRC.col)
      : null;
  return { board, turn: other(state.turn), castling, enPassant };
}

export function getChessLegalMoves(
  state: ChessState,
  color: ChessColor = state.turn,
): ChessMove[] {
  const basis = color === state.turn ? state : { ...state, turn: color };
  return basis.board.flatMap((piece, from) => {
    if (piece?.color !== color) return [];
    return pseudoMoves(basis, from).filter(
      (move) => !isChessKingInCheck(applyUnchecked(basis, move).board, color),
    );
  });
}

export function applyChessMove(
  state: ChessState,
  move: Pick<ChessMove, "from" | "to"> & Partial<ChessMove>,
): ChessState | null {
  const legal = getChessLegalMoves(state, state.turn);
  const found = legal.find(
    (candidate) => candidate.from === move.from && candidate.to === move.to,
  );
  if (!found) return null;
  return applyUnchecked(state, found);
}

export function getChessStatus(state: ChessState): {
  kind: "playing" | "check" | "checkmate" | "stalemate";
  winner?: ChessColor;
} {
  const moves = getChessLegalMoves(state, state.turn);
  const check = isChessKingInCheck(state.board, state.turn);
  if (!moves.length)
    return check
      ? { kind: "checkmate", winner: other(state.turn) }
      : { kind: "stalemate" };
  return { kind: check ? "check" : "playing" };
}

const values: Record<ChessPieceType, number> = {
  pawn: 1,
  knight: 3.2,
  bishop: 3.3,
  rook: 5,
  queen: 9,
  king: 100,
};
function evaluate(state: ChessState, color: ChessColor) {
  const status = getChessStatus(state);
  if (status.kind === "checkmate")
    return status.winner === color ? 10000 : -10000;
  if (status.kind === "stalemate") return 0;
  let score = 0;
  state.board.forEach((piece, index) => {
    if (!piece) return;
    const { row, col } = rc(index);
    const center = 3.5 - (Math.abs(3.5 - row) + Math.abs(3.5 - col)) / 7;
    const pieceScore =
      values[piece.type] + (piece.type !== "king" ? center * 0.08 : 0);
    score += piece.color === color ? pieceScore : -pieceScore;
  });
  return score;
}
function minimax(
  state: ChessState,
  root: ChessColor,
  depth: number,
  alpha: number,
  beta: number,
): number {
  const status = getChessStatus(state);
  if (depth <= 0 || status.kind === "checkmate" || status.kind === "stalemate")
    return evaluate(state, root);
  const moves = getChessLegalMoves(state, state.turn).sort(
    (a, b) =>
      (state.board[b.to] ? values[state.board[b.to]!.type] : 0) -
      (state.board[a.to] ? values[state.board[a.to]!.type] : 0),
  );
  const maximize = state.turn === root;
  let best = maximize ? -Infinity : Infinity;
  for (const move of moves) {
    const next = applyUnchecked(state, move);
    const score = minimax(next, root, depth - 1, alpha, beta);
    best = maximize ? Math.max(best, score) : Math.min(best, score);
    if (maximize) alpha = Math.max(alpha, best);
    else beta = Math.min(beta, best);
    if (beta <= alpha) break;
  }
  return best;
}

export function chooseChessBotMove(
  state: ChessState,
  color: ChessColor,
  difficulty: ChessDifficulty,
  random: () => number = Math.random,
): ChessMove | null {
  const basis = color === state.turn ? state : { ...state, turn: color };
  const moves = getChessLegalMoves(basis, color);
  if (!moves.length) return null;
  if (difficulty === "easy")
    return moves[Math.floor(random() * moves.length)] ?? moves[0];
  const depth =
    difficulty === "normal"
      ? 1
      : difficulty === "hard"
        ? 2
        : difficulty === "master"
          ? 3
          : 3;
  const scored = moves.map((move) => {
    const next = applyUnchecked(basis, move);
    const tactical = difficulty === "expert" && move.castle ? 0.05 : 0;
    return {
      move,
      score: minimax(next, color, depth - 1, -Infinity, Infinity) + tactical,
    };
  });
  scored.sort((a, b) => b.score - a.score);
  if (difficulty === "normal" && scored.length > 2 && random() > 0.72)
    return scored[1].move;
  return scored[0].move;
}
