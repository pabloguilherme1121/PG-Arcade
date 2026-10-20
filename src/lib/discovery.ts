import { games, type GameId } from "./catalog";
import { gameCapabilities } from "./gameCapabilities";
import { discoveryFilters, modeTags, modeLabel, supportsSwipe, type DiscoveryFilter } from "./smartDiscovery";

/** Names and descriptions are searched as words, ignoring accents and excess spaces. */
export const searchText = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim().replace(/\s+/g, " ");
let lastQuery: string | undefined;
let queryWords: string[] = [];
let searchIndex = new WeakMap<typeof games[number], string>();
let searchableHelp: Partial<Record<GameId, string>> = {};
/** Detailed instructions augment catalog search after a first query, without increasing initial JS. */
export function setSearchHelpIndex(help: Partial<Record<GameId, string>> | null) {
  searchableHelp = help || {};
  searchIndex = new WeakMap<typeof games[number], string>();
}
export const matchesGame = (game: typeof games[number], query: string) => {
  if (!query.trim()) return true;
  let text = searchIndex.get(game);
  if (text === undefined) {
    text = searchText(`${game.name} ${game.description} ${searchableHelp[game.id] || ''} ${game.category} ${modeTags(game).map(modeLabel).join(" ")} ${gameMode(game.id)} ${supportsSwipe(game.id)?'deslizar gestos':''}`);
    searchIndex.set(game, text);
  }
  if (query !== lastQuery) { lastQuery = query; queryWords = searchText(query).split(" "); }
  return queryWords.every(word => text.includes(word));
};
export const categoryGroup = (category: string) => ["Corrida", "Carros"].includes(category) ? "Carros e corrida" : category;
export const recommended: GameId[] = ["snake", "flood", "liga4", "basquete", "palavra", "rhythm"];

export function gameMode(id: GameId) {
  return !gameCapabilities(id).solo ? "Grupo local" : gameCapabilities(id).localPlayers >= 2 ? "Solo ou dupla local" : "Solo";
}
/** Every current title supports solo play, including local duels with a bot. */
export function supportsPlayerMode(id: GameId, mode: string) {
  return mode === "Todos" || (mode === "Solo" && gameCapabilities(id).solo) ||
    (mode === "Dupla local" && gameCapabilities(id).localPlayers >= 2);
}
export type CatalogView = { query: string; swipeOnly: boolean; category: string; sort: string; mode: string; modeFilter: DiscoveryFilter; scroll: number; returnPage: string; focusId: GameId | null };
export const defaultView: CatalogView = { query: "", swipeOnly: false, category: "Todos", sort: "destaques", mode: "Todos", modeFilter: "todos", scroll: 0, returnPage: "catalogo", focusId: null };
export function readCatalogView(): CatalogView {
  try {
    const data = JSON.parse(sessionStorage.getItem("pg-arcade-catalog-v1") || "null");
    if (!data || typeof data !== "object") return defaultView;
    return { swipeOnly: data.swipeOnly === true, query: typeof data.query === "string" ? data.query.slice(0, 200) : "", category: ["Todos", ...games.map(g => categoryGroup(g.category))].includes(data.category) ? data.category : "Todos", sort: ["destaques", "nome", "visitados", "recomendados"].includes(data.sort) ? data.sort : "destaques", modeFilter: discoveryFilters.some(filter => filter.id === data.modeFilter) ? data.modeFilter : "todos", mode: ["Todos", "Solo", "Dupla local"].includes(data.mode) ? data.mode : "Todos", scroll: Number.isFinite(data.scroll) ? Math.max(0, data.scroll) : 0, returnPage: data.returnPage === "favoritos" ? "favoritos" : "catalogo", focusId: games.some(g => g.id === data.focusId) ? data.focusId : null };
  } catch { return defaultView; }
}
export function saveCatalogView(view: CatalogView) {
  try { sessionStorage.setItem("pg-arcade-catalog-v1", JSON.stringify(view)); } catch { /* In-memory state still works when storage is blocked. */ }
}
