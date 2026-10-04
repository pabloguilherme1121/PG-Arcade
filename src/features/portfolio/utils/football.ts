export type FootballMode = "penalty" | "free-kick";
export type FootballDifficulty =
  | "easy"
  | "normal"
  | "hard"
  | "master"
  | "expert";

export function chooseFootballKeeperPosition(
  difficulty: FootballDifficulty,
  aim: number,
  random: () => number = Math.random,
) {
  const randomPosition = 15 + random() * 70;
  const anticipation = {
    easy: 0.08,
    normal: 0.28,
    hard: 0.52,
    master: 0.72,
    expert: 0.86,
  }[difficulty];
  return Math.max(
    10,
    Math.min(90, randomPosition * (1 - anticipation) + aim * anticipation),
  );
}

export function resolveFootballShot(
  mode: FootballMode,
  aim: number,
  power: number,
  curve: number,
  keeper: number,
) {
  const x = aim + (mode === "free-kick" ? curve * 0.18 : 0);
  const y = 90 - power * 0.7;
  const result: "gol" | "defesa" | "fora" | "barreira" =
    power > 90 || power < 25 || x < 8 || x > 92
      ? "fora"
      : mode === "free-kick" &&
          Math.abs(aim - 50) < 18 &&
          power < 58 &&
          Math.abs(curve) < 40
        ? "barreira"
        : Math.abs(x - keeper) < (power < 55 ? 18 : 12)
          ? "defesa"
          : "gol";
  return { result, x, y };
}
