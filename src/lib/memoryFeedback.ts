/** Number of successful pairs relative to completed two-card attempts. */
export function memoryAccuracy(matches: number, attempts: number): number {
  if (attempts <= 0 || !Number.isFinite(attempts)) return 0;
  return Math.round(Math.max(0, Math.min(1, matches / attempts)) * 100);
}

/** Find the next enabled card in the same column or row without wrapping. */
export function memoryFocusTarget(
  from: number,
  key: string,
  blocked: readonly boolean[],
  columns = 4,
): number | null {
  if (from < 0 || from >= blocked.length || columns <= 0) return null;
  const offsets: Record<string, number> = {
    ArrowLeft: -1, ArrowRight: 1, ArrowUp: -columns, ArrowDown: columns,
  };
  const delta = offsets[key];
  if (delta === undefined) return null;
  const originRow = Math.floor(from / columns);
  for (let next = from + delta; next >= 0 && next < blocked.length; next += delta) {
    if (key === "ArrowLeft" || key === "ArrowRight") {
      if (Math.floor(next / columns) !== originRow) break;
    }
    if (!blocked[next]) return next;
  }
  return null;
}
