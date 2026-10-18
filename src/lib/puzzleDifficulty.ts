export const puzzleDifficultyDescriptions: Record<string, readonly string[]> = {
  queens: [
    '3 rainhas corretas já posicionadas. Complete as outras 5 sem ataques.',
    '1 rainha correta já posicionada. Complete as outras 7 sem ataques.',
    'Tabuleiro vazio: posicione as 8 rainhas sem ataques. Há várias soluções.',
  ],
  magic: [
    '4 números corretos já preenchidos. Complete usando 1 a 9 sem repetir.',
    '2 números corretos já preenchidos. Complete usando 1 a 9 sem repetir.',
    'Sem pistas fixas. Descubra uma disposição de 1 a 9 com soma 15 em cada linha, coluna e diagonal.',
  ],
  knight: [
    'Tabuleiro 5×5 com 5 casas já visitadas. Continue a partir do número 5, usando saltos em L sem repetir casas.',
    'Tabuleiro 5×5: visite as 25 casas usando saltos em L, sem repetir.',
    'Tabuleiro 6×6: planeje um percurso pelas 36 casas usando saltos em L, sem repetir.',
  ],
};

/** Eight square symmetries preserve attacks, knight moves and line sums. */
export function transformSquare(index: number, size: number, seed: number) {
  const variant = (seed - 1) & 7;
  let row = Math.floor(index / size), col = index % size;
  if (variant & 4) col = size - 1 - col;
  for (let rotation = 0; rotation < (variant & 3); rotation++) [row, col] = [col, size - 1 - row];
  return row * size + col;
}

// Complete legal tours establish that every guided prefix has a continuation.
const knightTours: Record<number, readonly number[]> = {
  5: [0,7,4,13,24,17,20,11,2,5,16,23,14,3,6,15,22,19,8,1,10,21,12,9,18],
  6: [0,8,4,17,28,32,24,13,2,6,19,30,26,34,21,10,23,15,11,3,7,18,31,27,35,22,14,1,9,5,16,29,33,20,12,25],
};
export function initialKnightPath(difficulty: number, seed: number) {
  const size = difficulty === 2 ? 6 : 5;
  const route = knightTours[size];
  const path = ((seed - 1) & 8) ? [...route].reverse() : [...route];
  return { size, path: path.slice(0, difficulty === 0 ? 5 : 1).map(cell => transformSquare(cell, size, seed)) };
}
