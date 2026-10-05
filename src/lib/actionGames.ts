import type { Direction } from "./engines";
export type Traffic = { id: number; lane: number; y: number; speedFactor?: number };
export type RaceState = {
  lane: number;
  traffic: Traffic[];
  ticks: number;
  score: number;
  lives: number;
  crashCooldown: number;
};
export const initialRace = (): RaceState => ({
  lane: 1,
  traffic: [],
  ticks: 0,
  score: 0,
  lives: 3,
  crashCooldown: 0,
});
export function steerRace(state: RaceState, delta: number): RaceState {
  return { ...state, lane: Math.max(0, Math.min(2, state.lane + delta)) };
}
export function raceVelocity(speed: number, ticks: number) {
  const base = Math.max(1, speed);
  const multiplier = 0.85 + Math.min(0.55, Math.max(0, ticks) / 600);
  return Math.min(base * 1.4, base * multiplier);
}

export function tickRace(
  state: RaceState,
  speed: number,
  random = Math.random,
): RaceState {
  if (state.lives <= 0) return state;
  const ticks = state.ticks + 1;
  let lives = state.lives;
  let damaged = false;
  let crashCooldown = Math.max(0, state.crashCooldown - 1);
  const velocity = raceVelocity(speed, state.ticks);
  let traffic = state.traffic
    .map((car) => ({
      ...car,
      y: car.y + velocity * (car.speedFactor ?? 1),
    }))
    .filter((car) => {
      if (car.lane === state.lane && car.y >= 59 && car.y <= 91) {
        if (!damaged && crashCooldown === 0) {
          lives--;
          damaged = true;
          crashCooldown = 8;
        }
        return false;
      }
      return car.y < 110;
    });
  if (ticks % 16 === 0)
    traffic = [
      ...traffic,
      { id: ticks, lane: Math.min(2, Math.floor(random() * 3)), y: -16, speedFactor: 0.84 + random() * 0.32 },
    ];
  return {
    ...state,
    traffic,
    ticks,
    lives: Math.max(0, lives),
    crashCooldown,
    score: state.score + 1,
  };
}
export const parkingLevels = [
  { start: 30, goal: 5, walls: [7, 8, 13, 15, 19, 21, 25, 27, 28] },
  { start: 35, goal: 0, walls: [2, 8, 9, 10, 13, 15, 19, 21, 22, 25, 28] },
  { start: 30, goal: 5, walls: [1, 7, 8, 9, 10, 13, 16, 19, 20, 22, 26, 28] },
];
export function moveParking(position: number, d: Direction, walls: number[]) {
  const [dr, dc] = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] }[
    d
  ];
  const r = Math.floor(position / 6) + dr,
    c = (position % 6) + dc;
  if (r < 0 || r >= 6 || c < 0 || c >= 6 || walls.includes(r * 6 + c))
    return position;
  return r * 6 + c;
}
export function toggleLights(board: boolean[], i: number) {
  const next = [...board];
  const r = Math.floor(i / 5),
    c = i % 5;
  for (const [dr, dc] of [
    [0, 0],
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]) {
    const nr = r + dr,
      nc = c + dc;
    if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5)
      next[nr * 5 + nc] = !next[nr * 5 + nc];
  }
  return next;
}
export function lightsChallenge(level: number) {
  const solutions = [
    [6, 12, 18],
    [0, 4, 12, 20, 24],
    [2, 6, 8, 12, 16, 18, 22],
  ];
  return solutions[Math.max(0, Math.min(2, level))].reduce(
    toggleLights,
    Array(25).fill(false) as boolean[],
  );
}
export function parkingScore(moves: number) {
  return Math.max(10, 100 - moves);
}
export type TargetGameKind = "shoot" | "casual";
export type TargetDifficulty = "easy" | "normal" | "hard";

export function targetGameRules(
  kind: TargetGameKind,
  difficulty: TargetDifficulty,
) {
  if (kind === "shoot") {
    if (difficulty === "easy")
      return { duration: 35, targets: 4, relocateMs: 0 };
    if (difficulty === "hard")
      return { duration: 25, targets: 2, relocateMs: 0 };
    return { duration: 30, targets: 3, relocateMs: 0 };
  }

  if (difficulty === "easy")
    return { duration: 25, targets: 1, relocateMs: 1400 };
  if (difficulty === "hard")
    return { duration: 15, targets: 1, relocateMs: 800 };
  return { duration: 20, targets: 1, relocateMs: 1100 };
}

export function hitScore(score: number, combo: number) {
  return score + 10 + Math.min(combo, 5) * 2;
}
