export function quizAward(
  difficulty: number,
  streak: number,
  correct: boolean,
): number {
  if (!correct) return 0;
  const level = Math.max(0, Math.min(2, Math.round(difficulty)));
  const base = 100 * (level + 1);
  const bonusSteps = Math.max(0, Math.min(5, Math.floor(streak)));
  return Math.round(base * (1 + bonusSteps * 0.1));
}
