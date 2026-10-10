/** Navigate the 8×8 Minefield without wrapping rows or targeting disabled cells. */
export function minesFocusTarget(
  from: number,
  key: string,
  blocked: readonly boolean[],
): number | null {
  if (from < 0 || from >= blocked.length) return null;
  const offsets: Record<string, number> = {
    ArrowLeft: -1, ArrowRight: 1, ArrowUp: -8, ArrowDown: 8,
  };
  const delta = offsets[key];
  if (delta === undefined) return null;
  const row = Math.floor(from / 8);
  for (let next = from + delta; next >= 0 && next < blocked.length; next += delta) {
    if ((key === "ArrowLeft" || key === "ArrowRight") && Math.floor(next / 8) !== row)
      break;
    if (!blocked[next]) return next;
  }
  return null;
}
