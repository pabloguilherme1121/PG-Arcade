import { games, type GameId } from "./catalog";

/** Names and descriptions are searched as words, ignoring accents and excess spaces. */
export const searchText = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim().replace(/\s+/g, " ");
export const matchesGame = (game: typeof games[number], query: string) => {
  const text = searchText(`${game.name} ${game.description} ${game.category}`);
  return searchText(query).split(" ").every(word => text.includes(word));
};
export const categoryGroup = (category: string) => ["Corrida", "Carros"].includes(category) ? "Carros e corrida" : category;
export const recommended: GameId[] = ["snake", "flood", "liga4", "basquete", "palavra", "rhythm"];

export function gameMode(id: GameId) {
  return ["liga4", "velha", "xadrez", "damas", "domino"].includes(id) ? "Solo ou dupla local" : "Solo";
}
export type CatalogView = { query: string; category: string; sort: string; mode: string; scroll: number; returnPage: string; focusId: GameId | null };
export const defaultView: CatalogView = { query: "", category: "Todos", sort: "destaques", mode: "Todos", scroll: 0, returnPage: "catalogo", focusId: null };
export function readCatalogView(): CatalogView {
  try {
    const data = JSON.parse(sessionStorage.getItem("pg-arcade-catalog-v1") || "null");
    if (!data || typeof data !== "object") return defaultView;
    return { query: typeof data.query === "string" ? data.query.slice(0, 200) : "", category: ["Todos", ...games.map(g => categoryGroup(g.category))].includes(data.category) ? data.category : "Todos", sort: ["destaques", "nome", "visitados"].includes(data.sort) ? data.sort : "destaques", mode: ["Todos", "Solo", "Dupla local"].includes(data.mode) ? data.mode : "Todos", scroll: Number.isFinite(data.scroll) ? Math.max(0, data.scroll) : 0, returnPage: data.returnPage === "favoritos" ? "favoritos" : "catalogo", focusId: games.some(g => g.id === data.focusId) ? data.focusId : null };
  } catch { return defaultView; }
}
export function saveCatalogView(view: CatalogView) {
  try { sessionStorage.setItem("pg-arcade-catalog-v1", JSON.stringify(view)); } catch { /* In-memory state still works when storage is blocked. */ }
}
