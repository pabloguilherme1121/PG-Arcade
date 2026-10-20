/** Deterministic compact turn-based survival: no timers, storage or external data. */
export type NeonDifficulty = "easy" | "normal" | "hard";
export type NeonAction = "up" | "down" | "left" | "right" | "pulse";
export type NeonPower = "shield" | "radius";
export type NeonPhase = "ready" | "playing" | "paused" | "upgrade" | "won" | "lost";
export type NeonEnemy = Readonly<{ id: number; x: number; y: number }>;
export type NeonState = Readonly<{
  difficulty: NeonDifficulty;
  seed: number;
  wave: number;
  turn: number;
  lives: number;
  player: Readonly<{ x: number; y: number }>;
  charge: number;
  radius: number;
  enemies: readonly NeonEnemy[];
  score: number;
  phase: NeonPhase;
}>;
export const NEON_GRID_SIZE = 9;
const edge = [
  [0, 0], [8, 8], [0, 8], [8, 0], [4, 0], [4, 8], [0, 4], [8, 4],
  [2, 0], [6, 8], [8, 2], [0, 6], [6, 0], [2, 8], [8, 6], [0, 2],
] as const;
const config: Record<NeonDifficulty, { lives: number; foes: number }> = {
  easy: { lives: 5, foes: 2 },
  normal: { lives: 4, foes: 3 },
  hard: { lives: 3, foes: 4 },
};
function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
function spawnHorde(state: NeonState, wave: number): NeonEnemy[] {
  const count = Math.min(8, config[state.difficulty].foes + wave - 1);
  const occupied = new Set(state.enemies.map(enemy => enemy.x + ":" + enemy.y));
  const additions: NeonEnemy[] = [];
  let attempt = 0;
  while (additions.length < count && attempt < edge.length) {
    const [x, y] = edge[(state.seed + wave * 5 + attempt) % edge.length];
    attempt++;
    const key = x + ":" + y;
    if (occupied.has(key) || distance({ x, y }, state.player) < 3) continue;
    occupied.add(key);
    additions.push({ id: wave * 100 + additions.length, x, y });
  }
  return [...state.enemies, ...additions].slice(0, 12);
}
export function makeNeon(difficulty: NeonDifficulty = "normal", seed = 1): NeonState {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff || !config[difficulty])
    throw Error("Configuração inválida de Sobrevivência Neon.");
  const state: NeonState = {
    difficulty, seed, wave: 1, turn: 0, lives: config[difficulty].lives,
    player: { x: 4, y: 4 }, charge: 3, radius: 1, enemies: [], score: 0, phase: "ready",
  };
  return { ...state, enemies: spawnHorde(state, 1) };
}
export function startNeon(state: NeonState): NeonState {
  return state.phase === "ready" ? { ...state, phase: "playing" } : state;
}
function chase(enemy: NeonEnemy, player: NeonState["player"], turn: number): NeonEnemy {
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  if (Math.abs(dx) > Math.abs(dy) || (Math.abs(dx) === Math.abs(dy) && (turn + enemy.id) % 2 === 0))
    return { ...enemy, x: enemy.x + Math.sign(dx) };
  return { ...enemy, y: enemy.y + Math.sign(dy) };
}
/** Every command advances precisely one turn. Zero life always ends the run. */
export function turnNeon(state: NeonState, action: NeonAction): NeonState {
  if (state.phase !== "playing") return state;
  if (!["up", "down", "left", "right", "pulse"].includes(action)) return state;
  if (action === "pulse" && state.charge < 3) return state;
  let player = state.player, charge = state.charge, score = state.score;
  let enemies: readonly NeonEnemy[] = state.enemies;
  if (action === "pulse") {
    const survivors = enemies.filter(enemy => distance(enemy, player) > state.radius);
    score += (enemies.length - survivors.length) * 10;
    enemies = survivors;
    charge = 0;
  } else {
    const vector = {
      up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0],
    }[action];
    player = {
      x: Math.max(0, Math.min(8, player.x + vector[0])),
      y: Math.max(0, Math.min(8, player.y + vector[1])),
    };
    charge = Math.min(3, charge + 1);
  }
  const turn = state.turn + 1;
  const occupied = new Set<string>();
  const roaming: NeonEnemy[] = [];
  let touched = false;
  for (const enemy of enemies) {
    const candidate = state.difficulty === "easy" && turn % 2 === 1 ? enemy : chase(enemy, player, turn);
    const chosen = occupied.has(candidate.x + ":" + candidate.y) ? enemy : candidate;
    if (chosen.x === player.x && chosen.y === player.y) {
      touched = true;
      continue;
    }
    occupied.add(chosen.x + ":" + chosen.y);
    roaming.push(chosen);
  }
  const lives = Math.max(0, state.lives - (touched ? 1 : 0));
  const phase: NeonPhase =
    lives === 0 ? "lost" : turn === 24 ? "won" : turn % 6 === 0 ? "upgrade" : "playing";
  return { ...state, player, charge, enemies: roaming, turn, lives,
    score: score + (turn % 6 === 0 ? state.wave * 30 : 0), phase };
}
export function choosePower(state: NeonState, power: NeonPower): NeonState {
  if (state.phase !== "upgrade" || (power !== "shield" && power !== "radius")) return state;
  const upgraded: NeonState = { ...state,
    lives: power === "shield" ? Math.min(6, state.lives + 1) : state.lives,
    radius: power === "radius" ? Math.min(3, state.radius + 1) : state.radius,
    wave: state.wave + 1, phase: "playing",
  };
  return { ...upgraded, enemies: spawnHorde(upgraded, upgraded.wave) };
}
