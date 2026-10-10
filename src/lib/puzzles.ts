export function dropDisc(board: number[], column: number, player: number) {
  if (column < 0 || column > 6 || board[column]) return null;
  const next = [...board];
  for (let row = 5; row >= 0; row--)
    if (!next[row * 7 + column]) {
      next[row * 7 + column] = player;
      return next;
    }
  return null;
}
export function discWinner(board: number[]) {
  for (let row = 0; row < 6; row++)
    for (let col = 0; col < 7; col++) {
      const value = board[row * 7 + col];
      if (!value) continue;
      for (const [dr, dc] of [
        [0, 1],
        [1, 0],
        [1, 1],
        [1, -1],
      ]) {
        if (
          Array.from({ length: 4 }, (_, i) => [
            row + dr * i,
            col + dc * i,
          ]).every(
            ([r, c]) =>
              r >= 0 && r < 6 && c >= 0 && c < 7 && board[r * 7 + c] === value,
          )
        )
          return value;
      }
    }
  return 0;
}
export function movePuzzle(board: number[], index: number) {
  const empty = board.indexOf(0);
  if (
    index < 0 ||
    index >= 9 ||
    Math.abs(Math.floor(index / 3) - Math.floor(empty / 3)) +
      Math.abs((index % 3) - (empty % 3)) !==
      1
  )
    return null;
  const next = [...board];
  [next[index], next[empty]] = [next[empty], next[index]];
  return next;
}
export const solvedPuzzle = [1, 2, 3, 4, 5, 6, 7, 8, 0];
export function puzzleSolved(board: number[]) {
  return board.every((v, i) => v === solvedPuzzle[i]);
}
export function shuffledPuzzle(random = Math.random, steps = 100) {
  let board = [...solvedPuzzle];
  let previous = -1;
  for (let i = 0; i < steps; i++) {
    const empty = board.indexOf(0);
    const options = board
      .map((_, j) => j)
      .filter((j) => j !== previous && movePuzzle(board, j));
    const index = options[Math.floor(random() * options.length)];
    previous = empty;
    board = movePuzzle(board, index)!;
  }
  if (puzzleSolved(board)) board = movePuzzle(board, 7)!;
  return board;
}
