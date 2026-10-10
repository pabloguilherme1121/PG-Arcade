/** Manhattan tile distance is a visual progress hint, not the exact move count. */
export function puzzleManhattanDistance(board: readonly number[]): number {
  return board.reduce((total, value, index) => {
    if (!value) return total;
    const target = value - 1;
    return total + Math.abs(Math.floor(index / 3) - Math.floor(target / 3))
      + Math.abs(index % 3 - target % 3);
  }, 0);
}

/** Count correctly placed numbered tiles without counting the empty space. */
export function puzzleInPlaceCount(board: readonly number[]): number {
  return board.filter((tile, index) => tile !== 0 && tile === index + 1).length;
}
