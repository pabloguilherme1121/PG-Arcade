/** PG Estratégia: 150 fully playable tactical scenarios in five rule families.
 * IDs and boards are deterministic. Campaign data never mutates PG Arcade's 150 legacy IDs.
 */
export const STRATEGY_FAMILIES = [
  { id: "territorio", name: "Conquista territorial", short: "Avance pela fronteira", tone: "amber" },
  { id: "rotas", name: "Rotas e logística", short: "Ligue bases por terra", tone: "cyan" },
  { id: "exploracao", name: "Expedição tática", short: "Recupere os dois artefatos", tone: "teal" },
  { id: "economia", name: "Economia e recursos", short: "Produza antes do limite", tone: "violet" },
  { id: "defesa", name: "Defesa de território", short: "Resista a três ondas", tone: "rose" },
] as const;
export type StrategyFamily = typeof STRATEGY_FAMILIES[number]["id"];
export type BuildKind = "fazenda" | "mercado" | "torre";
export type StrategyPhase = "playing" | "won" | "lost";
export type Mission = Readonly<{
  id: string;
  name: string;
  family: StrategyFamily;
  index: number;
  tier: 1 | 2 | 3;
  budget: number;
  target: number;
  obstacles: readonly number[];
  description: string;
}>;
export type Structure = Readonly<{ cell: number; kind: BuildKind }>;
export type StrategySession = Readonly<{
  missionId: string;
  phase: StrategyPhase;
  energy: number;
  turns: number;
  captured: readonly number[];
  position: number;
  collected: readonly number[];
  structures: readonly Structure[];
  production: number;
  health: number;
  wave: number;
  score: number;
}>;
const sectors = [
  "Aurora", "Horizonte", "Safira", "Brumas", "Cume", "Sentinela", "Miragem",
  "Fronteira", "Pedra Clara", "Jardins", "Ventos", "Porto Norte", "Vértice",
  "Mirante", "Neblina", "Farol", "Vale Dourado", "Ribeira", "Luar", "Muralha",
  "Oásis", "Vigília", "Leste", "Alvorada", "Portões", "Cobalto", "Estuário",
  "Passagem", "Cidadela", "Horizonte Final",
] as const;
export const STRATEGY_PATH = [0, 1, 2, 3, 4, 5, 11, 17, 23, 29, 35] as const;
const safePath = new Set<number>(STRATEGY_PATH);
function nextRandom(seed: number) {
  return (Math.imul(seed, 1664525) + 1013904223) >>> 0;
}
function obstaclesFor(seed: number, count: number) {
  const cells: number[] = [];
  let random = seed >>> 0;
  let attempts = 0;
  while (cells.length < count && attempts++ < 500) {
    random = nextRandom(random);
    const cell = random % 36;
    if (!safePath.has(cell) && !cells.includes(cell)) cells.push(cell);
  }
  return cells.sort((a, b) => a - b);
}
const introductions: Record<StrategyFamily, string> = {
  territorio: "Conecte a fronteira até a cidadela inimiga, escolhendo cada avanço.",
  rotas: "Ligue os postos pelo traçado contínuo com recursos limitados.",
  exploracao: "Recupere duas relíquias e chegue à saída antes de esgotar a energia.",
  economia: "Combine fazendas e mercados para atingir a meta de produção.",
  defesa: "Posicione torres e resista a três ondas com a base sobrevivente.",
};
export const STRATEGY_MISSIONS: readonly Mission[] = STRATEGY_FAMILIES.flatMap((family, familyIndex) =>
  sectors.map((sector, i) => {
    const tier = (Math.floor(i / 10) + 1) as 1 | 2 | 3;
    const number = String(i + 1).padStart(2, "0");
    const budget = family.id === "economia" ? 9 + tier :
      family.id === "defesa" ? 3 + tier :
      family.id === "exploracao" ? 13 + tier : 11 + tier * 2;
    return {
      id: family.id + "-" + number,
      name: sector + " · " + family.name,
      family: family.id,
      index: i + 1,
      tier,
      budget,
      target: family.id === "economia" ? 10 + tier * 3 : family.id === "defesa" ? 3 : 35,
      obstacles: obstaclesFor((familyIndex + 1) * 7351 + (i + 1) * 193, 3 + tier * 2 + (i % 3)),
      description: introductions[family.id],
    };
  })
);
const missionLookup = new Map(STRATEGY_MISSIONS.map(mission => [mission.id, mission]));
export const missionById = (id: string) => missionLookup.get(id);
export function isNeighbor(a: number, b: number) {
  return Number.isInteger(a) && Number.isInteger(b) && a >= 0 && b >= 0 &&
    a < 36 && b < 36 && Math.abs(Math.floor(a / 6) - Math.floor(b / 6)) +
    Math.abs(a % 6 - b % 6) === 1;
}
export function newStrategySession(mission: Mission): StrategySession {
  return {
    missionId: mission.id,
    phase: "playing",
    energy: mission.budget,
    turns: 0,
    captured: [0],
    position: 0,
    collected: [],
    structures: [],
    production: 0,
    health: 5,
    wave: 0,
    score: 0,
  };
}
function result(state: StrategySession, won: boolean, energy: number, additions: Partial<StrategySession>): StrategySession {
  const phase: StrategyPhase = won ? "won" : energy <= 0 ? "lost" : "playing";
  const turns = state.turns + 1;
  return {
    ...state, ...additions, energy, turns, phase,
    score: won ? Math.max(100, 1600 - turns * 32 + energy * 60 + state.health * 30) : state.score,
  };
}
export function playCell(
  state: StrategySession, mission: Mission, cell: number, kind: BuildKind = "fazenda"
): StrategySession {
  if (state.missionId !== mission.id || state.phase !== "playing" || state.energy <= 0 ||
    !Number.isInteger(cell) || cell < 0 || cell >= 36 || mission.obstacles.includes(cell)) return state;
  if (mission.family === "territorio" || mission.family === "rotas") {
    if (state.captured.includes(cell)) return state;
    const connected = mission.family === "rotas"
      ? isNeighbor(state.captured[state.captured.length - 1], cell)
      : state.captured.some(owned => isNeighbor(owned, cell));
    if (!connected) return state;
    return result(state, cell === 35, state.energy - 1, { captured: [...state.captured, cell], position: cell });
  }
  if (mission.family === "exploracao") {
    if (!isNeighbor(state.position, cell)) return state;
    const collected = (cell === 3 || cell === 23) && !state.collected.includes(cell)
      ? [...state.collected, cell] : [...state.collected];
    return result(state, cell === 35 && collected.length === 2, state.energy - 1,
      { position: cell, captured: [...state.captured, cell], collected });
  }
  if (mission.family === "economia") {
    if (state.structures.some(s => s.cell === cell) || !["fazenda", "mercado"].includes(kind)) return state;
    const structures = [...state.structures, { cell, kind }];
    const farms = new Set(structures.filter(s => s.kind === "fazenda").map(s => s.cell));
    const production = structures.reduce((sum, structure) => sum +
      (structure.kind === "fazenda" ? 3 :
        [...farms].some(farm => isNeighbor(farm, structure.cell)) ? 5 : 1), 0);
    return result(state, production >= mission.target, state.energy - 1, { structures, production });
  }
  if (mission.family === "defesa") {
    if (state.wave > 0 || kind !== "torre" || state.structures.some(s => s.cell === cell)) return state;
    return { ...state, energy: state.energy - 1, turns: state.turns + 1,
      structures: [...state.structures, { cell, kind }] };
  }
  return state;
}
/** A complete wave is one explicit action; no background timers or network state. */
export function playWave(state: StrategySession, mission: Mission): StrategySession {
  if (mission.family !== "defesa" || state.missionId !== mission.id || state.phase !== "playing") return state;
  const threats = [5, 11, 17, 23, 29];
  const coverage = state.structures.reduce((sum, tower) =>
    sum + (threats.some(cell => Math.abs(Math.floor(cell / 6) - Math.floor(tower.cell / 6)) +
      Math.abs(cell % 6 - tower.cell % 6) <= 2) ? 1 : 0), 0);
  const attackers = 2 + mission.tier + Math.floor(state.wave / 2);
  const health = Math.max(0, state.health - Math.max(0, attackers - coverage));
  const wave = state.wave + 1;
  const won = health > 0 && wave >= mission.target;
  const phase: StrategyPhase = health <= 0 ? "lost" : won ? "won" : "playing";
  return { ...state, wave, health, turns: state.turns + 1, phase,
    score: won ? 1500 + health * 150 + state.energy * 80 : state.score };
}
