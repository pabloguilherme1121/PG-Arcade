export type Difficulty = 0 | 1 | 2;
export type Meteor = Readonly<{ id: number; column: number; row: number; direction: "down" | "up" }>;
type Snapshot = Readonly<{
  tick: number; shield: number; movedThisTick: boolean; health: number;
  meteors: readonly Meteor[]; reflected: number;
  phase: "playing" | "won" | "lost"; score: number; message: string;
}>;
export type MeteorGame = Readonly<Snapshot & {
  difficulty: Difficulty; seed: number; schedule: readonly number[];
  initialHealth: number; history: readonly Snapshot[];
}>;
const nextSeed = (seed: number) => (Math.imul(seed, 1664525) + 1013904223) >>> 0;
const snapshot = (g: MeteorGame): Snapshot => ({
  tick: g.tick, shield: g.shield, movedThisTick: g.movedThisTick, health: g.health,
  meteors: g.meteors, reflected: g.reflected,
  phase: g.phase, score: g.score, message: g.message,
});

export function newMeteorGame(difficulty: Difficulty = 0, seed = 23): MeteorGame {
  if (![0, 1, 2].includes(difficulty) || !Number.isSafeInteger(seed) || seed < 0 || seed > 0xffffffff)
    throw new Error("Parâmetros de defesa inválidos");
  const count = 4 + difficulty;
  const schedule = Array.from({ length: count }, (_, i) =>
    1 + ((Math.imul(seed + i + 1, 48271) >>> 0) % 5));
  const initialHealth = 3 - difficulty;
  return {
    difficulty, seed, schedule, initialHealth, health: initialHealth,
    tick: 0, shield: 3, movedThisTick: false, meteors: [], reflected: 0,
    phase: "playing", score: 0, history: [],
    message: "Mova o escudo uma casa por turno e reflita cada meteoro antes de atingir a base.",
  };
}

export function moveShield(game: MeteorGame, direction: number): MeteorGame {
  if (game.phase !== "playing" || game.movedThisTick ||
      (direction !== -1 && direction !== 1)) return game;
  const shield = game.shield + direction;
  if (shield < 0 || shield > 6) return game;
  return {
    ...game, shield, movedThisTick: true,
    history: [...game.history, snapshot(game)],
    message: `Escudo na coluna ${shield + 1}. Avance a trajetória.`,
  };
}

/** Meteors travel vertically; a shield strike at row 5 reverses their trajectory. */
export function advanceMeteor(game: MeteorGame): MeteorGame {
  if (game.phase !== "playing") return game;
  const arrivingIndex = game.tick % 7 === 0 ? Math.floor(game.tick / 7) : -1;
  const incoming: Meteor[] = [...game.meteors];
  if (arrivingIndex >= 0 && arrivingIndex < game.schedule.length) {
    incoming.push({ id: arrivingIndex, column: game.schedule[arrivingIndex], row: 0, direction: "down" });
  }
  let health = game.health;
  let reflected = game.reflected;
  const meteors: Meteor[] = [];
  for (const meteor of incoming) {
    if (meteor.direction === "up") {
      const row = meteor.row - 1;
      if (row < 0) reflected++;
      else meteors.push({ ...meteor, row });
      continue;
    }
    const row = meteor.row + 1;
    if (row === 5) {
      if (meteor.column === game.shield) {
        meteors.push({ ...meteor, row: 5, direction: "up" });
      } else {
        health = Math.max(0, health - 1);
      }
    } else {
      meteors.push({ ...meteor, row });
    }
  }
  const tick = game.tick + 1;
  const noMoreSpawns = tick > 7 * (game.schedule.length - 1);
  const timedOut = tick > game.schedule.length * 7 + 13;
  // A base vence se sobreviver até o fim da chuva: vidas extras
  // precisam permitir absorver impactos sem tornar a vitória impossível.
  const allResolved = noMoreSpawns && meteors.length === 0;
  const phase = health <= 0 ? "lost"
    : allResolved ? "won"
      : timedOut ? "lost" : "playing";
  const score = phase === "won"
    ? Math.max(100, 1200 + game.difficulty * 200 + reflected * 220 + health * 90 - tick * 9)
    : reflected * 220;
  const message = phase === "won"
    ? reflected === game.schedule.length
      ? "Todos os meteoros foram refletidos. Vitória!"
      : `A base resistiu: ${reflected} de ${game.schedule.length} meteoros refletidos. Vitória!`
    : health <= 0 ? "A base foi atingida. Derrota."
      : timedOut ? "A operação foi encerrada sem proteger toda a base."
        : `Turno ${tick}: ${reflected} de ${game.schedule.length} meteoros refletidos; muralha ${health}.`;
  return {
    ...game, tick, shield: game.shield, movedThisTick: false,
    health, meteors, reflected, phase, score, message,
    history: [...game.history, snapshot(game)],
  };
}
export function undoMeteor(game: MeteorGame): MeteorGame {
  if (!game.history.length) return game;
  const old = game.history[game.history.length - 1];
  return { ...game, ...old, history: game.history.slice(0, -1) };
}
export const resetMeteor = (game: MeteorGame) => newMeteorGame(game.difficulty, game.seed);
export const nextMeteor = (game: MeteorGame) => newMeteorGame(game.difficulty, nextSeed(game.seed));
