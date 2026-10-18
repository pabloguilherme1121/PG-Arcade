export const puzzleDifficultyDescriptions: Record<string, readonly string[]> = {
  links: [
    '4 pares em 4×4, com 4 trechos já começados. Continue as pontas preenchidas; os trechos iniciais podem ser apagados.',
    '4 pares em 4×4, somente com os terminais fixos. Conecte cada par e cubra todas as casas.',
    '6 pares em 6×6. Conecte os terminais da mesma cor e número, sem cruzar trilhas; cubra as 36 casas.',
  ],
  colorsort: [
    '2 cores em 4 pilhas, incluindo 2 vazias. Mova uma peça por vez para uma pilha vazia ou com a mesma cor no topo.',
    '3 cores em 5 pilhas, incluindo 2 vazias. Planeje a organização movendo uma peça por vez.',
    '4 cores em 6 pilhas, incluindo 2 vazias. Organize todas as peças sem misturar cores no destino.',
  ],
  watersort: [
    '2 cores em 4 recipientes, incluindo 2 vazios. Despeje o bloco de cor do topo até acabar o espaço no destino.',
    '3 cores em 5 recipientes, incluindo 2 vazios. Cada despejo move o bloco de cor do topo que couber.',
    '4 cores em 6 recipientes, incluindo 2 vazios. Planeje espaço para despejar blocos da mesma cor.',
  ],
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

/** Serpentine segments overlap adjacent rows in at most one column. */
export function initialLinks(difficulty: number, seed: number) {
  const size = difficulty === 2 ? 6 : 4;
  const lengths = difficulty === 0 ? [4,4,4,4] : difficulty === 1 ? [3,5,3,5] : [5,7,5,7,5,7];
  const path = Array.from({ length:size*size }, (_, i) => transformSquare(
    Math.floor(i / size) * size + (Math.floor(i / size) % 2 ? size - 1 - i % size : i % size), size, seed));
  const fixed = Array(size*size).fill(0), goal = Array(size*size).fill(0), cells = Array(size*size).fill(0);
  let offset = 0;
  lengths.forEach((length, color) => {
    const segment = path.slice(offset, offset + length);
    segment.forEach(cell => { goal[cell] = color + 1; });
    for (const cell of [segment[0], segment.at(-1)!]) fixed[cell] = cells[cell] = color + 1;
    if (difficulty === 0) cells[segment[1]] = color + 1;
    offset += length;
  });
  return { size, fixed, goal, cells };
}
