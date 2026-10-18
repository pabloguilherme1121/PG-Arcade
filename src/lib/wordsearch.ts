const vocabulary = [
  ['SOL', 'LUA', 'MAR', 'RIO', 'CEU', 'FLOR', 'GATO', 'PATO', 'CASA', 'BOLA', 'LAGO', 'FOGO'],
  ['LIVRO', 'PONTE', 'NUVEM', 'FOLHA', 'VENTO', 'PEDRA', 'CAMPO', 'FRUTA', 'PRAIA', 'PLANTA'],
  ['JANELA', 'ESCOLA', 'MUSICA', 'VIAGEM', 'GIRAFA', 'BOSQUE', 'ESTUDO', 'PINTOR', 'JARDIM', 'BARCO'],
] as const;
export const wordSearchDescriptions = [
  '4 palavras curtas, na horizontal ou vertical, sem inversões.',
  '5 palavras de 4 a 6 letras; também podem aparecer na diagonal, sem inversões.',
  '6 palavras de 5 a 6 letras, em todas as direções, inclusive invertidas.',
] as const;

/** Bounded placement with a guaranteed row layout if random packing fails. */
export function makeWordSearch(difficulty: number, rng: () => number) {
  const level = Math.max(0, Math.min(2, Math.round(difficulty)));
  const shuffled = <T>(values: readonly T[]) => {
    const result = [...values];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  const words = shuffled(vocabulary[level]).slice(0, 4 + level);
  const directions = level === 0 ? [[0, 1], [1, 0]]
    : level === 1 ? [[0, 1], [1, 0], [1, 1]]
    : [[0, 1], [1, 0], [1, 1], [1, -1], [0, -1], [-1, 0], [-1, -1], [-1, 1]];
  let grid: string[] = [];
  for (let attempt = 0; attempt < 24; attempt++) {
    grid = Array(36).fill('');
    let placed = 0;
    for (const word of [...words].sort((a, b) => b.length - a.length)) {
      const candidates: number[][] = [];
      for (let from = 0; from < 36; from++) for (const [dy, dx] of directions) {
        const row = Math.floor(from / 6), col = from % 6;
        const endRow = row + dy * (word.length - 1), endCol = col + dx * (word.length - 1);
        if (endRow < 0 || endRow >= 6 || endCol < 0 || endCol >= 6) continue;
        const path = Array.from(word, (_, i) => from + i * (dy * 6 + dx));
        if (path.every((cell, i) => !grid[cell] || grid[cell] === word[i])) candidates.push(path);
      }
      if (!candidates.length) break;
      const path = candidates[Math.floor(rng() * candidates.length)];
      path.forEach((cell, i) => { grid[cell] = word[i]; });
      placed++;
    }
    if (placed === words.length) break;
    if (attempt === 23) {
      grid = Array(36).fill('');
      const rows = shuffled([0, 1, 2, 3, 4, 5]);
      words.forEach((word, i) => [...word].forEach((letter, j) => { grid[rows[i] * 6 + j] = letter; }));
    }
  }
  return { words, grid: grid.map(letter => letter || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(rng() * 26)]) };
}
