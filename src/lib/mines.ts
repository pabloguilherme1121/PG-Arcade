export function neighbors(cell: number): number[] {
  const row = Math.floor(cell / 8),
    col = cell % 8,
    out: number[] = [];
  for (let y = -1; y <= 1; y++)
    for (let x = -1; x <= 1; x++)
      if (
        (x || y) &&
        row + y >= 0 &&
        row + y < 8 &&
        col + x >= 0 &&
        col + x < 8
      )
        out.push((row + y) * 8 + col + x);
  return out;
}
export function plantMines(first: number, random = Math.random): number[] {
  const safe = new Set([first, ...neighbors(first)]);
  const candidates = Array.from({ length: 64 }, (_, i) => i).filter(
    (i) => !safe.has(i),
  );
  const mines: number[] = [];
  while (mines.length < 10)
    mines.push(
      candidates.splice(Math.floor(random() * candidates.length), 1)[0],
    );
  return mines;
}
export function revealCells(
  cell: number,
  mines: number[],
  revealed: number[],
  flagged: number[],
): number[] {
  const out = new Set(revealed),
    queue = [cell];
  while (queue.length) {
    const c = queue.pop()!;
    if (out.has(c) || flagged.includes(c) || mines.includes(c)) continue;
    out.add(c);
    if (!neighbors(c).some((n) => mines.includes(n)))
      queue.push(...neighbors(c));
  }
  return [...out];
}
