import { afterEach, describe, expect, it, vi } from "vitest";
import { games } from "./catalog";
import { boardSnapshots, questionSnapshots } from "./previewSnapshots";
import { newGames, type BoardId } from "./newCatalog";
import { newBoard } from "./boardExpansion";
import { question } from "./quizExpansion";
import { expandedGames } from "./expandedCatalog";
import { readFileSync } from "node:fs";
import { categoryGroup, supportsPlayerMode, defaultView, gameMode, matchesGame, setSearchHelpIndex, readCatalogView, recommended, saveCatalogView } from "./discovery";
afterEach(() => vi.unstubAllGlobals());
describe("catalog discovery", () => {
  it("finds multiword accented names despite repeated whitespace and word order", () => {
    const flood = games.find(g => g.id === "flood")!;
    expect(matchesGame(flood, "   CORES   maré  ")).toBe(true);
    expect(matchesGame(flood, "cores inexistente")).toBe(false);
    expect(categoryGroup("Corrida")).toBe(categoryGroup("Carros"));
  });
  it("offers varied existing starting picks without claiming online modes", () => {
    expect(new Set(recommended).size).toBe(6);
    expect(recommended.every(id => games.some(g => g.id === id))).toBe(true);
    expect(gameMode("liga4")).toBe("Solo ou dupla local");
    expect(gameMode("flood")).toBe("Solo");
    expect(gameMode("fractions")).toBe("Solo");
  });
  it("recovers from unavailable, malformed and stale catalog storage", () => {
    vi.stubGlobal("sessionStorage", {getItem: () => {throw new Error("blocked");}, setItem: () => {throw new Error("blocked");}});
    expect(readCatalogView()).toEqual(defaultView);
    expect(() => saveCatalogView(defaultView)).not.toThrow();
    vi.stubGlobal("sessionStorage", {getItem: () => JSON.stringify({category:"Removed",sort:"unknown",mode:"Online",scroll:-5,focusId:"missing"})});
    expect(readCatalogView()).toEqual(defaultView);
  });

  it("restores smart filters and recommendations after reload, while accepting older sessions", () => {
    const stored = { ...defaultView, sort: "recomendados", modeFilter: "dupla" as const, swipeOnly: true, scroll: 160, focusId: "xadrez" as const };
    let raw = JSON.stringify(stored);
    vi.stubGlobal("sessionStorage", {
      getItem: () => raw,
      setItem: (_key: string, value: string) => { raw = value; },
    });
    expect(readCatalogView()).toEqual(stored);
    saveCatalogView({ ...stored, modeFilter: "favoritos" });
    expect(readCatalogView()).toEqual({ ...stored, modeFilter: "favoritos" });
    raw = JSON.stringify({ ...stored, modeFilter: "invalid-mode", sort: "invalid-sort" });
    expect(readCatalogView()).toEqual({ ...stored, modeFilter: "todos", sort: "destaques" });
    raw = JSON.stringify({ query: "xadrez", category: "Todos", sort: "nome", mode: "Todos" });
    expect(readCatalogView()).toEqual({ ...defaultView, query: "xadrez", sort: "nome" });
  });
  it("provides engine-derived sample states for all new board and quiz games", () => {
    for (const g of newGames) {
      if (g.family === "board") expect(boardSnapshots[g.id]?.cells, g.id).toEqual(newBoard(g.id as BoardId,1,1).cells);
      if (g.family === "quiz") expect(questionSnapshots[g.id]?.prompt, g.id).toEqual(question(g.id,1,1,0).prompt);
    }
  });
  it("ships locally authored dimensioned scenes for every first-expansion mechanic", () => {
    for (const g of expandedGames) {
      const svg = readFileSync(`public/previews/${g.id}.svg`, "utf8");
      expect(svg, g.id).not.toContain("\uFFFD");
      expect(svg, g.id).toContain('viewBox="0 0 240 150"');
      expect(svg, g.id).toContain('width="240"');
      expect(svg, g.id).toContain('height="150"');
    }
  });
});


it("solo filtering includes games with a bot, while local duels remain restricted", () => {
  expect(supportsPlayerMode("xadrez", "Solo")).toBe(true);
  expect(supportsPlayerMode("damas", "Solo")).toBe(true);
  expect(supportsPlayerMode("snake", "Solo")).toBe(true);
  expect(supportsPlayerMode("xadrez", "Dupla local")).toBe(true);
  expect(supportsPlayerMode("snake", "Dupla local")).toBe(false);
});

it("empty search retains every title before and after a specific query", () => {
  for (const query of ["", "   ", "\t\n"]) {
    expect(games.filter(game => matchesGame(game, query))).toEqual(games);
  }
  const chess = games.find(game => game.id === "xadrez")!;
  expect(matchesGame(chess, "XÁDREZ")).toBe(true);
  expect(matchesGame(chess, "inexistente")).toBe(false);
  expect(matchesGame(chess, "")).toBe(true);
});


it("reveals detailed search terms on demand and invalidates cached misses", () => {
  const flood = games.find(g => g.id === "flood")!;
  setSearchHelpIndex(null);
  expect(matchesGame(flood, "ultrametamorfose")).toBe(false);
  setSearchHelpIndex({ flood: "ultrametamorfose é um termo adicional de ajuda" });
  expect(matchesGame(flood, "ultrametamorfose")).toBe(true);
  setSearchHelpIndex(null);
  expect(matchesGame(flood, "ultrametamorfose")).toBe(false);
});

it('finds popular names and game identifiers without loading detailed help', () => {
  setSearchHelpIndex(null);
  for (const [id, query] of [['snake', 'COBRINHA'], ['minas', 'minesweeper'], ['velha', 'tic tac toe'], ['xadrez', 'chess'], ['liga4', 'ligue quatro']] as const) {
    expect(matchesGame(games.find(game => game.id === id)!, query), query).toBe(true);
  }
  expect(games.filter(game => matchesGame(game, 'cobrinha')).map(game => game.id)).toEqual(['snake']);
  expect(matchesGame(games.find(game => game.id === 'snake')!, 'cobrinha inexistente')).toBe(false);
});

it('filters and restores groups using implemented player counts', () => {
  expect(games.filter(game => supportsPlayerMode(game.id, 'Grupo local (3–4)')).map(game => game.id).sort())
    .toEqual(['cofre', 'comum', 'contrato', 'leilao', 'passagem']);
  vi.stubGlobal('sessionStorage', { getItem: () => JSON.stringify({mode: 'Grupo local (3–4)'}) });
  expect(readCatalogView().mode).toBe('Grupo local (3–4)');
});
