export type Difficulty = 0 | 1 | 2;
export type Lane = 0 | 1;
export type Departure = Readonly<{ id: number; startLane: Lane; destination: Lane }>;
export type Train = Readonly<Departure & { lane: Lane; position: number; dwell: number }>;
type Snapshot = Readonly<{
  switches: readonly [boolean, boolean]; turn: number; flips: number;
  trains: readonly Train[]; delivered: number; collisions: number;
  phase: "playing" | "won" | "lost"; score: number; message: string;
}>;
export type TrainGame = Readonly<Snapshot & {
  difficulty: Difficulty; seed: number;
  schedule: readonly Departure[]; flipBudget: number;
  history: readonly Snapshot[];
}>;
const advanceSeed = (seed: number) => (Math.imul(seed, 1664525) + 1013904223) >>> 0;
const snapshot = (game: TrainGame): Snapshot => ({
  switches: game.switches, turn: game.turn, flips: game.flips,
  trains: game.trains, delivered: game.delivered, collisions: game.collisions,
  phase: game.phase, score: game.score, message: game.message,
});

export function newTrainGame(difficulty: Difficulty = 0, seed = 23): TrainGame {
  if (![0, 1, 2].includes(difficulty) || !Number.isSafeInteger(seed) || seed < 0 || seed > 0xffffffff) {
    throw new Error("Parâmetros de tráfego inválidos");
  }
  const count = 3 + difficulty;
  const schedule: Departure[] = Array.from({ length: count }, (_, id) => ({
    id,
    startLane: (((seed >>> (id % 16)) + id + (id % 3 === 0 ? 1 : 0)) % 2) as Lane,
    destination: ((seed + id) % 2) as Lane,
  }));
  return {
    difficulty, seed, schedule, flipBudget: count * 2,
    switches: [false, false], turn: 0, flips: 0, trains: [],
    delivered: 0, collisions: 0, phase: "playing", score: 0, history: [],
    message: "Configure os desvios antes de avançar cada turno.",
  };
}

/** Switch flips are free in time but use a finite budget and can be undone. */
export function toggleRailSwitch(game: TrainGame, junction: number): TrainGame {
  if (game.phase !== "playing" || !Number.isInteger(junction) ||
      (junction !== 0 && junction !== 1) || game.flips >= game.flipBudget) return game;
  const switches: [boolean, boolean] = junction === 0
    ? [!game.switches[0], game.switches[1]]
    : [game.switches[0], !game.switches[1]];
  return {
    ...game, switches, flips: game.flips + 1,
    history: [...game.history, snapshot(game)],
    message: `Desvio ${junction + 1} ${switches[junction] ? "cruza as linhas" : "mantém as linhas"}.`,
  };
}

/**
 * Departures occur every two ticks. Trains advance toward column 5, with
 * independent junctions at columns 2 and 4. Unloading occupies the station
 * for three turns; two trains in the same station lane collide.
 */
export function advanceTrain(game: TrainGame): TrainGame {
  if (game.phase !== "playing") return game;
  const departing = game.turn % 2 === 0
    ? game.schedule[Math.floor(game.turn / 2)] : undefined;
  const moving: Train[] = [...game.trains];
  if (departing) moving.push({ ...departing, lane: departing.startLane, position: 0, dwell: 0 });
  let delivered = game.delivered;
  let wrongStation = false;
  const nextTrains: Train[] = [];
  for (const train of moving) {
    if (train.position === 5) {
      if (train.dwell > 1) {
        nextTrains.push({ ...train, dwell: train.dwell - 1 });
      } else if (train.lane === train.destination) {
        delivered++;
      } else {
        wrongStation = true;
      }
      continue;
    }
    const position = train.position + 1;
    const flip = position === 2 ? game.switches[0] : position === 4 ? game.switches[1] : false;
    const lane = (flip ? 1 - train.lane : train.lane) as Lane;
    nextTrains.push({ ...train, position, lane, dwell: position === 5 ? 3 : 0 });
  }
  const occupied = new Set<string>();
  let collisions = game.collisions;
  for (const train of nextTrains) {
    const key = `${train.position}:${train.lane}`;
    if (occupied.has(key)) collisions++;
    occupied.add(key);
  }
  const turn = game.turn + 1;
  const timeout = turn > 2 * game.schedule.length + 14;
  const phase = collisions > 0 || wrongStation || timeout
    ? "lost" : delivered === game.schedule.length && nextTrains.length === 0
      ? "won" : "playing";
  const score = phase === "won"
    ? Math.max(100, 1500 + game.difficulty * 250 - turn * 12 - game.flips * 25)
    : 0;
  const message = collisions > 0
    ? "Colisão: trens ocuparam a mesma posição. Corrija os desvios e tente novamente."
    : wrongStation ? "Um trem chegou à estação errada. A missão terminou."
      : timeout ? "Tempo de operação esgotado. Reinicie o planejamento."
        : phase === "won" ? "Todos os trens chegaram às estações corretas. Vitória!"
          : `Turno ${turn}: ${delivered} de ${game.schedule.length} cargas entregues.`;
  return {
    ...game, turn, trains: nextTrains, delivered, collisions, phase, score, message,
    history: [...game.history, snapshot(game)],
  };
}

export function undoTrain(game: TrainGame): TrainGame {
  if (!game.history.length) return game;
  const old = game.history[game.history.length - 1];
  return { ...game, ...old, history: game.history.slice(0, -1) };
}
export const resetTrain = (game: TrainGame) => newTrainGame(game.difficulty, game.seed);
export const nextTrain = (game: TrainGame) => newTrainGame(game.difficulty, advanceSeed(game.seed));
