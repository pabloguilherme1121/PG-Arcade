import { describe, expect, it } from "vitest";
import { games } from "./catalog";
import { coverArtFor } from "./coverArt";

describe("Capas premium de todo o catálogo", () => {
  it("gives all 100 games their own reproducible cover identity", () => {
    expect(games).toHaveLength(100);
    const ids = games.map(game => coverArtFor(game));
    expect(new Set(ids.map(art => art.id)).size).toBe(games.length);
    expect(new Set(ids.map(art => art.fingerprint)).size).toBe(games.length);
    for (const art of ids) {
      expect(art.code.length).toBeGreaterThanOrEqual(2);
      expect(art.code.length).toBeLessThanOrEqual(4);
      expect(art.background).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(art.accent).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(art.secondary).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(art.ornament).toBeGreaterThanOrEqual(0);
      expect(art.ornament).toBeLessThan(5);
    }
  });
  it("keeps art stable regardless of search, sorting and surrounding entries", () => {
    const first=games.map(coverArtFor);
    const shuffled=[...games].reverse().map(coverArtFor);
    expect(new Map(first.map(art => [art.id, art]))).toEqual(new Map(shuffled.map(art => [art.id, art])));
  });
  it("uses different themes for major gameplay families", () => {
    const chess=coverArtFor(games.find(g=>g.id==="xadrez")!);
    const football=coverArtFor(games.find(g=>g.id==="futebol")!);
    const word=coverArtFor(games.find(g=>g.id==="palavra")!);
    expect(new Set([chess.background,football.background,word.background]).size).toBe(3);
  });
});
