export type BlockShape = ReadonlyArray<readonly [number, number]>;
export type BlockDifficulty = 0 | 1 | 2;
export type BlockPuzzleState = {
  board: number[];
  pieces: (BlockShape | null)[];
  score: number;
  combo: number;
  moves: number;
  seed: number;
  difficulty: BlockDifficulty;
  status: "playing" | "lost";
};

const SHAPES: readonly BlockShape[] = [
  [[0, 0]],
  [[0, 0], [0, 1]],
  [[0, 0], [1, 0]],
  [[0, 0], [0, 1], [0, 2]],
  [[0, 0], [1, 0], [2, 0]],
  [[0, 0], [0, 1], [1, 0], [1, 1]],
  [[0, 0], [1, 0], [2, 0], [2, 1]],
  [[0, 0], [0, 1], [0, 2], [1, 1]],
  [[0, 0], [0, 1], [0, 2], [0, 3]],
  [[0, 0], [1, 0], [2, 0], [3, 0]],
  [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]],
];
const POOLS: readonly (readonly number[])[] = [
  [0, 1, 2, 3, 4, 5],
  [1, 2, 3, 4, 5, 6, 7, 8, 9],
  [3, 4, 5, 6, 7, 8, 9, 10],
];

function nextSeed(seed: number) {
  return (Math.imul(seed, 1664525) + 1013904223) >>> 0;
}
function drawPieces(seed: number, difficulty: BlockDifficulty) {
  const pieces: BlockShape[] = [];
  let state = seed;
  for (let i = 0; i < 3; i++) {
    state = nextSeed(state);
    const pool = POOLS[difficulty];
    pieces.push(SHAPES[pool[state % pool.length]]);
  }
  return { pieces, seed: state };
}

export function canPlaceBlock(board: readonly number[], shape: BlockShape, anchor: number): boolean {
  if (board.length !== 64 || !Number.isInteger(anchor) || anchor < 0 || anchor >= 64 || !shape.length) return false;
  const row = Math.floor(anchor / 8), col = anchor % 8;
  return shape.every(([dr, dc]) =>
    Number.isInteger(dr) && Number.isInteger(dc) && dr >= 0 && dc >= 0 &&
    row + dr < 8 && col + dc < 8 && board[(row + dr) * 8 + col + dc] === 0
  );
}

function hasLegalPlacement(board: readonly number[], pieces: readonly (BlockShape | null)[]): boolean {
  return pieces.some(shape => shape !== null &&
    Array.from({ length: 64 }, (_, anchor) => anchor).some(anchor => canPlaceBlock(board, shape, anchor)));
}

export function newBlockPuzzle(difficulty: BlockDifficulty = 1, seed = 1): BlockPuzzleState {
  const safeSeed = Number.isFinite(seed) ? (seed >>> 0) : 1;
  const level: BlockDifficulty = difficulty === 0 || difficulty === 2 ? difficulty : 1;
  const tray = drawPieces(safeSeed, level);
  return { board: Array(64).fill(0), pieces: tray.pieces, score: 0, combo: 0,
    moves: 0, seed: tray.seed, difficulty: level, status: "playing" };
}

export function placeBlock(state: BlockPuzzleState, index: number, anchor: number): BlockPuzzleState {
  if (state.status !== "playing" || !Number.isInteger(index) || index < 0 || index > 2) return state;
  const shape = state.pieces[index];
  if (!shape || !canPlaceBlock(state.board, shape, anchor)) return state;
  const board = state.board.slice();
  const row = Math.floor(anchor / 8), col = anchor % 8;
  for (const [dr, dc] of shape) board[(row + dr) * 8 + col + dc] = 1;

  const rows: number[] = [], cols: number[] = [];
  for (let r = 0; r < 8; r++) if (board.slice(r * 8, r * 8 + 8).every(Boolean)) rows.push(r);
  for (let c = 0; c < 8; c++) if (Array.from({ length: 8 }, (_, r) => board[r * 8 + c]).every(Boolean)) cols.push(c);
  // Clear simultaneously: an intersecting square is removed once.
  for (const r of rows) for (let c = 0; c < 8; c++) board[r * 8 + c] = 0;
  for (const c of cols) for (let r = 0; r < 8; r++) board[r * 8 + c] = 0;
  const cleared = rows.length + cols.length;
  const pieces = state.pieces.slice();
  pieces[index] = null;
  let seed = state.seed;
  if (!pieces.some(Boolean)) {
    const next = drawPieces(seed, state.difficulty);
    pieces.splice(0, pieces.length, ...next.pieces);
    seed = next.seed;
  }
  const combo = cleared ? state.combo + 1 : 0;
  const score = state.score + shape.length * 10 + cleared * 100 * Math.max(1, combo);
  return {
    ...state, board, pieces, score, combo, seed, moves: state.moves + 1,
    status: hasLegalPlacement(board, pieces) ? "playing" : "lost",
  };
}
