export type RunKind = "rally" | "coleta" | "orbital";
export type RunOptions = {
  difficulty: "easy" | "normal" | "hard";
  limit: number;
};
export const defaultRunOptions: RunOptions = {
  difficulty: "normal",
  limit: 300,
};
export type RunObject = {
  id: number;
  lane: number;
  y: number;
  reward: boolean;
};
export type RunState = {
  lane: number;
  ticks: number;
  score: number;
  lives: number;
  objects: RunObject[];
  shots: RunObject[];
};
export const newRun = (): RunState => ({
  lane: 1,
  ticks: 0,
  score: 0,
  lives: 3,
  objects: [],
  shots: [],
});
export function moveRun(s: RunState, delta: number): RunState {
  return { ...s, lane: Math.max(0, Math.min(2, s.lane + delta)) };
}
export function fireRun(s: RunState): RunState {
  if (s.shots.some((b) => b.y > 55 && b.lane === s.lane)) return s;
  return {
    ...s,
    shots: [
      ...s.shots,
      {
        id: Math.max(s.ticks, ...s.shots.map((b) => b.id)) + 1,
        lane: s.lane,
        y: 74,
        reward: false,
      },
    ],
  };
}
export function stepRun(
  s: RunState,
  kind: RunKind,
  random = Math.random,
  options: RunOptions = defaultRunOptions,
): RunState {
  if (s.lives <= 0 || s.ticks >= options.limit) return s;
  let score = s.score,
    lives = s.lives;
  const ticks = s.ticks + 1;
  const pace =
    (options.difficulty === "easy"
      ? 0.7
      : options.difficulty === "hard"
        ? 1.35
        : 1) * Math.min(1.8, 1 + Math.floor(ticks / 300) * 0.12);
  let shots = s.shots
    .map((b) => ({ ...b, y: b.y - 8 }))
    .filter((b) => b.y > -8);
  const objects = s.objects
    .map((o) => ({ ...o, y: o.y + (kind === "rally" ? 3 : 2) * pace }))
    .filter((o) => {
      if (kind === "orbital") {
        const bullet = shots.find(
          (b) => b.lane === o.lane && Math.abs(b.y - o.y) < 11,
        );
        if (bullet) {
          shots = shots.filter((b) => b !== bullet);
          score += 20;
          return false;
        }
      }
      if (o.lane === s.lane && o.y >= 60 && o.y <= 90) {
        if (o.reward) score += kind === "rally" ? 25 : 10;
        else lives--;
        return false;
      }
      return o.y < 110;
    });
  if (
    ticks %
      (options.difficulty === "easy"
        ? 18
        : options.difficulty === "hard"
          ? 9
          : 12) ===
    0
  )
    objects.push({
      id: ticks,
      lane: Math.floor(random() * 3),
      y: -16,
      reward: kind !== "orbital" && random() > 0.45,
    });
  return { ...s, ticks, objects, shots, score, lives: Math.max(0, lives) };
}
