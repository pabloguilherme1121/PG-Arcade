/** Percentage of attempts that hit. Empty sessions show zero, not NaN. */
export function targetAccuracy(hits: number, attempts: number): number {
  if (!Number.isFinite(attempts) || attempts <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((Math.max(0,hits) / attempts) * 100)));
}

/** Arrow navigation bounded to the current row on a 3 × 3 arena. */
export function targetFocusTarget(index: number, key: string): number | null {
  if (!Number.isInteger(index) || index < 0 || index > 8) return null;
  const directions: Record<string,number> = { ArrowUp:-3, ArrowDown:3, ArrowLeft:-1, ArrowRight:1 };
  const move=directions[key];
  if (!move) return null;
  const target=index+move;
  if (target<0 || target>8) return null;
  if (Math.abs(move)===1 && Math.floor(index/3)!==Math.floor(target/3)) return null;
  return target;
}
