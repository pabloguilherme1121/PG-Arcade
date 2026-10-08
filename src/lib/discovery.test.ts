import { afterEach, describe, expect, it, vi } from "vitest";
import { games } from "./catalog";
import { boardSnapshots, questionSnapshots } from "./previewSnapshots";
import { newGames, type BoardId } from "./newCatalog";
import { newBoard } from "./boardExpansion";
import { question } from "./quizExpansion";
import { expandedGames } from "./expandedCatalog";
import { readFileSync } from "node:fs";
import { categoryGroup, defaultView, gameMode, matchesGame, readCatalogView, recommended, saveCatalogView } from "./discovery";
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

