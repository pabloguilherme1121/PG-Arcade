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

export function getFootballCurveOffset(
  mode: FootballMode,
  power: number,
  curve: number,
) {
  if (mode !== "free-kick") return 0;
  const normalizedPower = Math.max(0, Math.min(100, power));
  const flightFactor = 0.21 - normalizedPower * 0.00065;
  return curve * Math.max(0.135, flightFactor);
}

export function getFootballShotHeight(power: number, lift: number) {
  const normalizedPower = Math.max(0, Math.min(100, power));
  const normalizedLift = Math.max(0, Math.min(100, lift));
  return Math.max(
    0,
    Math.min(100, normalizedLift * 0.72 + normalizedPower * 0.18),
  );
}

export function getFootballFlightProfile(
  mode: FootballMode,
  power: number,
  curve: number,
  lift = 45,
) {
  const normalizedPower = Math.max(0, Math.min(100, power));
  const durationMs = Math.round(
    Math.max(420, Math.min(760, 760 - normalizedPower * 3.5)),
  );
  const curveOffset = getFootballCurveOffset(mode, normalizedPower, curve);
  const bend = curveOffset * 4.6;
  const normalizedLift = Math.max(0, Math.min(100, lift));
  const apexLift =
    52 +
    normalizedPower * 0.18 +
    normalizedLift * 0.62 +
    (mode === "free-kick" ? Math.abs(curve) * 0.08 : 0);
  const scaleAtGoal = Math.max(
    0.54,
    Math.min(0.68, 0.68 - normalizedPower * 0.0014),
  );
  return { durationMs, bend, apexLift, scaleAtGoal };
}

export function getFootballTargetX(
  mode: FootballMode,
  aim: number,
  curve: number,
  power = 65,
) {
  return aim + getFootballCurveOffset(mode, power, curve);
}

export function resolveFootballShot(
  mode: FootballMode,
  aim: number,
  power: number,
  curve: number,
  keeper: number,
  lift = 45,
) {
  const x = getFootballTargetX(mode, aim, curve, power);
  const height = getFootballShotHeight(power, lift);
  const y = 92 - height * 0.75;
  const result: "gol" | "defesa" | "fora" | "barreira" =
    power > 90 || power < 25 || x < 8 || x > 92 || height > 85
      ? "fora"
      : mode === "free-kick" &&
          Math.abs(aim - 50) < 18 &&
          height < 42 &&
          Math.abs(curve) < 55
        ? "barreira"
        : Math.abs(x - keeper) < (power < 55 ? 18 : 12)
          ? "defesa"
          : "gol";
  return { result, x, y, height };
}
