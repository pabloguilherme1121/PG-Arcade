import { describe, expect, it } from "vitest";
import { canPlaceBlock, newBlockPuzzle, placeBlock, type BlockShape } from "./blockPuzzle";

const single: BlockShape = [[0, 0]];
const square: BlockShape = [[0, 0], [0, 1], [1, 0], [1, 1]];

describe("Blocos Infinito: regras determinísticas e sem jogadas fantasmas", () => {
  it("cria tabuleiro vazio e três peças reproduzíveis, sem usar dados externos", () => {
    const a = newBlockPuzzle(1, 42);
    expect(a).toEqual(newBlockPuzzle(1, 42));
    expect(a.board).toHaveLength(64);
    expect(a.board.every(cell => cell === 0)).toBe(true);
    expect(a.pieces).toHaveLength(3);
    expect(a.pieces.every(Boolean)).toBe(true);
  });

  it("rejeita movimento que cruza a borda, sobrepõe peça ou usa posição inválida", () => {
    const initial = newBlockPuzzle();
    expect(canPlaceBlock(initial.board, square, 7)).toBe(false);
    expect(canPlaceBlock(initial.board, square, -1)).toBe(false);
    const occupied = initial.board.slice();
    occupied[0] = 1;
    expect(canPlaceBlock(occupied, square, 0)).toBe(false);
    expect(placeBlock(initial, 0, -1)).toBe(initial);
  });

  it("limpa linhas e colunas completas no mesmo movimento sem pontuar duas vezes a mesma casa", () => {
    const initial = newBlockPuzzle();
    const board = Array(64).fill(0) as number[];
    for (let c = 0; c < 8; c++) if (c !== 0) board[c] = 1;
    for (let r = 0; r < 8; r++) if (r !== 0) board[r * 8] = 1;
    const game = { ...initial, board, pieces: [single, null, null] as (BlockShape | null)[] };
    const next = placeBlock(game, 0, 0);
    expect(next).not.toBe(game);
    expect(next.board.every(cell => cell === 0)).toBe(true);
    expect(next.score).toBe(210);
    expect(next.moves).toBe(1);
  });

  it("recarrega três peças apenas depois de usar o trio", () => {
    const initial = { ...newBlockPuzzle(), pieces: [single, single, single] as (BlockShape | null)[] };
    const a = placeBlock(initial, 0, 0);
    expect(a.pieces.filter(Boolean)).toHaveLength(2);
    const b = placeBlock(a, 1, 1);
    const c = placeBlock(b, 2, 2);
    expect(c.pieces.filter(Boolean)).toHaveLength(3);
    expect(c.moves).toBe(3);
  });

  it("reconhece derrota real quando as peças restantes não cabem", () => {
    const base = newBlockPuzzle();
    const board = Array.from({ length: 64 }, (_, i) => (Math.floor(i / 8) + i % 8) % 2);
    const game = { ...base, board, pieces: [single, square, null] as (BlockShape | null)[] };
    const next = placeBlock(game, 0, 1);
    expect(next.status).toBe("lost");
    expect(placeBlock(next, 1, 0)).toBe(next);
  });

  it("não permite aplicar duas vezes uma peça já utilizada", () => {
    const start = { ...newBlockPuzzle(), pieces: [single, square, single] as (BlockShape | null)[] };
    const next = placeBlock(start, 0, 0);
    expect(placeBlock(next, 0, 1)).toBe(next);
  });
});
