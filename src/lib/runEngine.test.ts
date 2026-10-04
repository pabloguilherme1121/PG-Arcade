import { it, expect } from "vitest";
import { newRun, moveRun, stepRun, fireRun } from "./runEngine";
import { plantMines, neighbors, revealCells } from "./mines";
it("projectiles consume one enemy and cannot score twice", () => {
  const s = {
    ...newRun(),
    shots: [{ id: 1, lane: 1, y: 50, reward: false }],
    objects: [{ id: 2, lane: 1, y: 40, reward: false }],
  };
  const next = stepRun(s, "orbital");
  expect(next.score).toBe(20);
  expect(next.objects).toHaveLength(0);
  expect(next.shots).toHaveLength(0);
  expect(stepRun(next, "orbital").score).toBe(20);
});
it("collectibles and collisions remove only overlapping objects", () => {
  const s = {
    ...newRun(),
    objects: [
      { id: 1, lane: 1, y: 60, reward: true },
      { id: 2, lane: 0, y: 60, reward: false },
    ],
  };
  expect(stepRun(s, "rally").score).toBe(25);
  const hit = stepRun({ ...s, lane: 0 }, "coleta");
  expect(hit.lives).toBe(2);
  expect(hit.objects).toHaveLength(1);
});
it("rounds stop at deadline or death, steering stays in bounds and fire is limited", () => {
  expect(moveRun(newRun(), -10).lane).toBe(0);
  expect(moveRun(newRun(), 10).lane).toBe(2);
  for (const s of [
    { ...newRun(), lives: 0 },
    { ...newRun(), ticks: 300 },
  ])
    expect(stepRun(s, "rally")).toBe(s);
  expect(fireRun(fireRun(newRun())).shots).toHaveLength(1);
});
it("first mine reveal and its neighbors are safe across corners and center", () => {
  for (const first of [0, 7, 27, 56, 63]) {
    const mines = plantMines(first, () => 0.5);
    expect(new Set(mines).size).toBe(10);
    expect([first, ...neighbors(first)].some((i) => mines.includes(i))).toBe(
      false,
    );
    const open = revealCells(first, mines, [], []);
    expect(open.length).toBeGreaterThan(1);
    expect(open.some((i) => mines.includes(i))).toBe(false);
    expect(revealCells(first, mines, [], [first])).toEqual([]);
  }
});
it("neighbor discovery never wraps across board edges", () => {
  expect(neighbors(0).sort((a, b) => a - b)).toEqual([1, 8, 9]);
  expect(neighbors(7)).not.toContain(8);
  expect(neighbors(63)).toHaveLength(3);
});
