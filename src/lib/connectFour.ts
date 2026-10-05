import { discWinner, dropDisc } from "./puzzles";

export type DiscDifficulty = "easy" | "normal" | "hard";
const columns = [3, 2, 4, 1, 5, 0, 6];
export function discColumnFromKey(key: string): number | null {
  if (!/^[1-7]$/.test(key)) return null;
  return Number(key) - 1;
}
export function winningDiscs(board: number[]): number[] {
  for (let row = 0; row < 6; row++)
    for (let col = 0; col < 7; col++)
      for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
        const cells = Array.from({ length: 4 }, (_, n) => [row + dr * n, col + dc * n]);
        if (cells.every(([r, c]) => r >= 0 && r < 6 && c >= 0 && c < 7)) {
          const indexes = cells.map(([r, c]) => r * 7 + c);
          if (board[indexes[0]] && indexes.every((i) => board[i] === board[indexes[0]])) return indexes;
        }
      }
  return [];
}

function evaluate(board: number[], player: number) {
  let score = 0;
  for (let r = 0; r < 6; r++) {
    if (board[r * 7 + 3] === player) score += 6;
    if (board[r * 7 + 3] === 3 - player) score -= 6;
    for (let c = 0; c < 7; c++)
      for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
        const cells = Array.from({ length: 4 }, (_, n) => [r + dr * n, c + dc * n]);
        if (!cells.every(([y, x]) => y >= 0 && y < 6 && x >= 0 && x < 7)) continue;
        const values = cells.map(([y, x]) => board[y * 7 + x]);
        const own = values.filter((v) => v === player).length;
        const other = values.filter((v) => v === 3 - player).length;
        if (!other) score += [0, 1, 8, 60, 0][own];
        if (!own) score -= [0, 1, 8, 70, 0][other];
      }
  }
  return score;
}

/** Bounded alpha-beta search: centre ordering, immediate wins and threat blocks. */
export function chooseDiscMove(board: number[], player: number, difficulty: DiscDifficulty, random = Math.random): number | null {
  if (discWinner(board)) return null;
  const legal = columns.filter((c) => !board[c]);
  if (!legal.length) return null;
  if (difficulty === "easy") return legal[Math.min(legal.length - 1, Math.max(0, Math.floor(random() * legal.length)))];
  for (const side of [player, 3 - player])
    for (const c of legal) if (discWinner(dropDisc(board, c, side)!) === side) return c;
  const depth = difficulty === "hard" ? 5 : 3;
  function search(position: number[], remaining: number, turn: number, alpha: number, beta: number): number {
    const winner = discWinner(position);
    if (winner) return winner === player ? 100000 + remaining : -100000 - remaining;
    const moves = columns.filter((c) => !position[c]);
    if (!moves.length) return 0;
    if (!remaining) return evaluate(position, player);
    let value = turn === player ? -Infinity : Infinity;
    for (const c of moves) {
      const score = search(dropDisc(position, c, turn)!, remaining - 1, 3 - turn, alpha, beta);
      value = turn === player ? Math.max(value, score) : Math.min(value, score);
      if (turn === player) alpha = Math.max(alpha, value);
      else beta = Math.min(beta, value);
      if (alpha >= beta) break;
    }
    return value;
  }
  let best = legal[0], score = -Infinity;
  for (const c of legal) {
    const candidate = search(dropDisc(board, c, player)!, depth - 1, 3 - player, score, Infinity);
    if (candidate > score) { score = candidate; best = c; }
  }
  return best;
}
