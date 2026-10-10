/** Keep the original 1000-point, difficulty-specific response scoring. */
export function reactionPoints(elapsedMs: number, scoringWindowMs: number): number {
  if (!Number.isFinite(elapsedMs) || !Number.isFinite(scoringWindowMs) || scoringWindowMs <= 0)
    return 0;
  return Math.max(0, Math.round(1000 * (1 - Math.max(0, elapsedMs) / scoringWindowMs)));
}

/** Only successful responses are included; a premature tap is not a reaction time. */
export function reactionSummary(timesMs: readonly number[]): { best: number | null; average: number | null } {
  if (!timesMs.length) return { best: null, average: null };
  return {
    best: Math.min(...timesMs),
    average: Math.round(timesMs.reduce((sum, time) => sum + time, 0) / timesMs.length),
  };
}
