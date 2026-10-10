/** Milliseconds between Snake steps. Faster play is always optional and bounded. */
export function snakeTickDelay(baseDelay: number, score: number, progressive: boolean) {
  const base = Math.max(90, Math.round(baseDelay));
  if (!progressive || !Number.isFinite(score)) return base;
  // Each pair of fruits (20 points) speeds the game up by 12ms.
  const fruitPairs = Math.floor(Math.max(0, score) / 20);
  return Math.max(90, base - fruitPairs * 12);
}
