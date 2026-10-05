import { it, expect } from "vitest";
import { newRun, moveRun, stepRun, fireRun } from "./runEngine";
import { plantMines, neighbors, revealCells } from "./mines";
it("expeditions continue after a sprint, difficulties affect traffic, survival has no deadline", () => {
  const s = {
    ...newRun(),
    ticks: 300,
    objects: [{ id: 1, lane: 0, y: 0, reward: false }],
  };
  expect(stepRun(s, "rally")).toBe(s);
  const easy = stepRun(s, "rally", () => 0, { difficulty: "easy", limit: 900 });
  const hard = stepRun(s, "rally", () => 0, { difficulty: "hard", limit: 900 });
  expect(easy.ticks).toBe(301);
  expect(hard.objects[0].y).toBeGreaterThan(easy.objects[0].y);
  expect(
    stepRun({ ...s, ticks: 900 }, "rally", () => 0, {
      difficulty: "normal",
      limit: Infinity,
    }).ticks,
  ).toBe(901);
});
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
it("applies one collision hit then grants a short recovery window", () => {
  const s = {
    ...newRun(),
    objects: [
      { id: 1, lane: 1, y: 60, reward: false },
      { id: 2, lane: 1, y: 62, reward: false },
    ],
  };
  const next = stepRun(s, "coleta");
  expect(next.lives).toBe(2);
  expect(next.objects).toHaveLength(0);
  expect(next.crashCooldown).toBeGreaterThan(0);

  const protectedHit = stepRun(
    {
      ...next,
      objects: [{ id: 3, lane: 1, y: 60, reward: false }],
    },
    "coleta",
  );
  expect(protectedHit.lives).toBe(2);

  let recovered = protectedHit;
  for (let i = 0; i < 8; i++)
    recovered = stepRun({ ...recovered, objects: [] }, "coleta");
  const nextCrash = stepRun(
    {
      ...recovered,
      objects: [{ id: 4, lane: 1, y: 60, reward: false }],
    },
    "coleta",
  );
  expect(nextCrash.lives).toBe(1);
});

it("rounds stop at deadline or death, steering settles between lane changes and fire is limited", () => {
  expect(moveRun(newRun(), -10).lane).toBe(0);
  expect(moveRun(newRun(), 10).lane).toBe(2);
  const right = moveRun(newRun(), 1);
  expect(right.lane).toBe(2);
  expect(right.steerCooldown).toBeGreaterThan(0);
  expect(moveRun(right, -1).lane).toBe(2);
  const recovered = stepRun(
    stepRun({ ...right, objects: [] }, "rally"),
    "rally",
  );
  expect(moveRun(recovered, -1).lane).toBe(1);
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


it("builds a bounded clean-run combo and difficulty-specific recovery window", () => {
  let s = {
    ...newRun(),
    objects: [{ id: 1, lane: 1, y: 60, reward: true }],
  };
  s = stepRun(s, "rally", () => 0, { difficulty: "normal", limit: 900 });
  expect(s.streak).toBe(1);
  expect(s.score).toBe(25);

  s = stepRun(
    {
      ...s,
      objects: [{ id: 2, lane: 1, y: 60, reward: true }],
    },
    "rally",
    () => 0,
    { difficulty: "normal", limit: 900 },
  );
  expect(s.streak).toBe(2);
  expect(s.score).toBeGreaterThan(50);

  const easyCrash = stepRun(
    {
      ...newRun(),
      objects: [{ id: 3, lane: 1, y: 60, reward: false }],
    },
    "coleta",
    () => 0,
    { difficulty: "easy", limit: 900 },
  );
  const hardCrash = stepRun(
    {
      ...newRun(),
      objects: [{ id: 4, lane: 1, y: 60, reward: false }],
    },
    "coleta",
    () => 0,
    { difficulty: "hard", limit: 900 },
  );
  expect(easyCrash.streak).toBe(0);
  expect(easyCrash.crashCooldown).toBeGreaterThan(hardCrash.crashCooldown);
});
