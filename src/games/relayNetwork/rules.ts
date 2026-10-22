export type Difficulty = 0 | 1 | 2;
export type RelayGame = Readonly<{
  difficulty: Difficulty;
  seed: number;
  size: number;
  base: number;
  pads: readonly number[];
  devices: readonly number[];
  solution: readonly number[];
  budget: number;
  relays: readonly number[];
  history: readonly (readonly number[])[];
  moves: number;
  phase: "playing" | "won";
  score: number;
}>;
export type RelayCoverage = Readonly<{
  connected: number;
  isolated: number;
  served: number;
  active: readonly number[];
  uncovered: readonly number[];
}>;

const advanceSeed = (seed: number) => (Math.imul(seed, 1664525) + 1013904223) >>> 0;
const distance = (a: number, b: number, size: number) =>
  Math.abs(Math.floor(a / size) - Math.floor(b / size)) + Math.abs(a % size - b % size);

function rotate(index: number, size: number, turns: number): number {
  let x = index % size, y = Math.floor(index / size);
  for (let t = 0; t < turns; t++) [x, y] = [size - 1 - y, x];
  return y * size + x;
}

export function newRelayGame(difficulty: Difficulty = 0, seed = 23): RelayGame {
  if (![0, 1, 2].includes(difficulty) || !Number.isSafeInteger(seed) || seed < 0 || seed > 0xffffffff) {
    throw Error("Parâmetros inválidos para a rede");
  }
  const size = 5 + difficulty;
  const turns = seed % 4;
  const solution = Array.from({length: 3 + difficulty}, (_, row) => rotate(row * size + 1, size, turns));
  const devices = Array.from({length: 3 + difficulty}, (_, row) => rotate(row * size + 2, size, turns));
  const extraPads = [size * size - 1, size * size - 2, size * size - size + 1]
    .map(index => rotate(index, size, turns));
  const pads = [...new Set([...solution, ...extraPads])];
  return {
    difficulty, seed, size, base: rotate(0, size, turns), pads, devices, solution,
    budget: solution.length, relays: [], history: [], moves: 0, phase: "playing", score: 0,
  };
}

export function isRelayPad(game: RelayGame, cell: number): boolean {
  return Number.isInteger(cell) && game.pads.includes(cell);
}

export function relaySolution(game: RelayGame): readonly number[] {
  return game.solution;
}

/** Only relays connected orthogonally to the base or a powered relay transmit signal. */
export function relayCoverage(game: RelayGame): RelayCoverage {
  const connected = new Set<number>();
  const reachable = [game.base];
  for (let i = 0; i < reachable.length; i++) {
    const origin = reachable[i];
    for (const relay of game.relays) {
      if (!connected.has(relay) && distance(origin, relay, game.size) === 1) {
        connected.add(relay);
        reachable.push(relay);
      }
    }
  }
  const active = [...connected];
  const uncovered = game.devices.filter(device =>
    !active.some(relay => distance(device, relay, game.size) <= 1)
  );
  return {
    connected: active.length,
    isolated: game.relays.length - active.length,
    served: game.devices.length - uncovered.length,
    active,
    uncovered,
  };
}

export function toggleRelay(game: RelayGame, cell: number): RelayGame {
  if (game.phase !== "playing" || !isRelayPad(game, cell)) return game;
  const exists = game.relays.includes(cell);
  if (!exists && game.relays.length >= game.budget) return game;
  const relays = exists ? game.relays.filter(r => r !== cell) : [...game.relays, cell];
  const candidate: RelayGame = {
    ...game, relays, history: [...game.history, game.relays],
    moves: game.moves + 1, phase: "playing", score: 0,
  };
  const coverage = relayCoverage(candidate);
  if (coverage.served === game.devices.length && coverage.isolated === 0) {
    return {
      ...candidate, phase: "won",
      score: Math.max(100, 1600 + game.difficulty * 180 - candidate.moves * 30 - relays.length * 15),
    };
  }
  return candidate;
}

export function undoRelay(game: RelayGame): RelayGame {
  if (!game.history.length) return game;
  return {
    ...game, relays: game.history[game.history.length - 1],
    history: game.history.slice(0, -1),
    moves: Math.max(0, game.moves - 1), phase: "playing", score: 0,
  };
}

export const resetRelay = (game: RelayGame) => newRelayGame(game.difficulty, game.seed);
export const nextRelay = (game: RelayGame) => newRelayGame(game.difficulty, advanceSeed(game.seed));
