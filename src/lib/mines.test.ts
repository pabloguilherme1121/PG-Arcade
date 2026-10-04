import { expect, it } from "vitest";
import { chordCells, plantMines, neighbors } from "./mines";
it("keeps the first area safe at each difficulty with exactly the configured mines", () => {
  for (const count of [6, 10, 16]) for (const first of [0, 7, 27, 63]) {
    const mines = plantMines(first, () => 0.5, count);
    expect(new Set(mines).size).toBe(count);
    expect([first, ...neighbors(first)].some((n) => mines.includes(n))).toBe(false);
  }
});
it("chords reveal safe neighbors, require exact flags, and punish wrong flags", () => {
  const mines = [1, 10];
  expect(chordCells(0, mines, [0], [])).toBeNull();
  expect(chordCells(0, mines, [0], [1, 8])).toBeNull();
  const safe = chordCells(0, mines, [0], [1]);
  expect(safe?.hitMine).toBe(false);
  expect(safe?.revealed).toEqual(expect.arrayContaining([0, 8, 9]));
  expect(chordCells(0, mines, [0], [8])?.hitMine).toBe(true);
  expect(chordCells(0, mines, [], [1])).toBeNull();
});
