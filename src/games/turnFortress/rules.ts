export type Difficulty = 0 | 1 | 2;
export type UnitKind = "arco" | "escudo" | "canhao";
export type FortressMove = Readonly<{ kind: UnitKind; lane: number } | { kind: "esperar" }>;
export type Wave = Readonly<{ lane: number; hp: number }>;
export type Invader = Readonly<{ id: number; lane: number; hp: number; position: number }>;
export type Defender = Readonly<{ id: number; kind: UnitKind; lane: number }>;
type Snapshot = Readonly<{
  turn: number; health: number; resources: number;
  units: readonly Defender[]; enemies: readonly Invader[];
  phase: "playing" | "won" | "lost"; score: number; message: string;
}>;
export type FortressGame = Readonly<Snapshot & {
  difficulty: Difficulty;
  seed: number;
  initialHealth: number;
  waves: readonly Wave[];
  history: readonly Snapshot[];
}>;

const price: Record<UnitKind, number> = { arco: 2, escudo: 2, canhao: 3 };
export const unitPrices = price;
const nextSeed = (seed: number) => (Math.imul(seed, 1664525) + 1013904223) >>> 0;
const snapshot = (game: FortressGame): Snapshot => ({
  turn: game.turn, health: game.health, resources: game.resources,
  units: game.units, enemies: game.enemies,
  phase: game.phase, score: game.score, message: game.message,
});

export function newFortressGame(difficulty: Difficulty = 0, seed = 23): FortressGame {
  if (![0, 1, 2].includes(difficulty) || !Number.isSafeInteger(seed) || seed < 0 || seed > 0xffffffff) {
    throw new Error("Parâmetros inválidos para a fortaleza");
  }
  const rounds = 6 + difficulty * 2;
  const waves: Wave[] = Array.from({ length: rounds }, (_, i) => ({
    lane: i < 3 ? (i + seed % 3) % 3 : (i + seed % 3 + Math.floor(seed / 4) % 3) % 3,
    hp: 1 + ((Math.imul(i + 1, 1103515245) ^ seed) >>> 0) % 3,
  }));
  const initialHealth = 3 + (difficulty === 2 ? 0 : 1);
  return {
    difficulty, seed, initialHealth, health: initialHealth,
    waves, turn: 0, resources: 6 + difficulty, units: [], enemies: [],
    history: [], phase: "playing", score: 0,
    message: "Escolha um defensor e a linha da fortaleza, ou aguarde a próxima onda.",
  };
}

/** An enemy remains in column zero for one final defense turn before damaging the gate. */
export function advanceFortress(game: FortressGame, move: FortressMove): FortressGame {
  if (game.phase !== "playing") return game;
  if (move.kind !== "esperar" &&
    (!Number.isInteger(move.lane) || move.lane < 0 || move.lane > 2 ||
      game.resources < price[move.kind] ||
      game.units.filter(unit => unit.lane === move.lane).length >= 2)) return game;

  const units: Defender[] = move.kind === "esperar"
    ? [...game.units] : [...game.units, { id: game.turn, lane: move.lane, kind: move.kind }];
  const resources = move.kind === "esperar" ? game.resources : game.resources - price[move.kind];
  const spawning = game.waves[game.turn];
  const enemies: Invader[] = [...game.enemies];
  if (spawning) {
    enemies.push({ id: game.turn, lane: spawning.lane, hp: spawning.hp, position: 3 });
  }

  // Each unit fires once per round at the closest threat within its own lane.
  // Cannons hit for two from any distance but need one turn between shots.
  for (const unit of units) {
    if (unit.kind === "canhao" && (game.turn - unit.id) % 2 !== 0) continue;
    const targets = enemies
      .filter(enemy => enemy.hp > 0 && enemy.lane === unit.lane &&
        (unit.kind !== "escudo" || enemy.position <= 1))
      .sort((a, b) => a.position - b.position || a.id - b.id);
    const target = targets[0];
    if (!target) continue;
    const index = enemies.findIndex(enemy => enemy.id === target.id);
    enemies[index] = { ...target, hp: target.hp - (unit.kind === "arco" ? 1 : 2) };
  }

  const surviving = enemies.filter(enemy => enemy.hp > 0);
  const damage = surviving.filter(enemy => enemy.position === 0).length;
  const health = Math.max(0, game.health - damage);
  const active = surviving.filter(enemy => enemy.position > 0)
    .map(enemy => ({ ...enemy, position: enemy.position - 1 }));
  const turn = game.turn + 1;
  const phase = health <= 0 ? "lost" : turn >= game.waves.length && active.length === 0 ? "won" : "playing";
  const score = phase === "won"
    ? Math.max(100, 1200 + game.difficulty * 250 + health * 120 - turn * 20 - (6 + game.difficulty - resources) * 10)
    : 0;
  const message = phase === "won"
    ? "Fortaleza protegida: todas as ondas foram vencidas."
    : phase === "lost"
      ? "A muralha caiu. Reorganize os defensores e tente outra estratégia."
      : `Rodada ${turn}: ${spawning ? "uma ameaça avançou" : "sem novas ameaças"}. ${damage ? `${damage} dano(s) na muralha.` : "Muralha intacta."}`;
  return {
    ...game, turn, health, resources, units, enemies: active, phase, score, message,
    history: [...game.history, snapshot(game)],
  };
}

export function undoFortress(game: FortressGame): FortressGame {
  if (!game.history.length) return game;
  const last = game.history[game.history.length - 1];
  return { ...game, ...last, history: game.history.slice(0, -1) };
}
export const resetFortress = (game: FortressGame) => newFortressGame(game.difficulty, game.seed);
export const nextFortress = (game: FortressGame) => newFortressGame(game.difficulty, nextSeed(game.seed));
