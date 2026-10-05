import { describe, it, expect } from "vitest";
import {
  initialRace,
  steerRace,
  tickRace,
  raceVelocity,
  racePaceOffset,
  moveParking,
  parkingLevels,
  parkingScore,
  parkingSteeringCost,
  toggleLights,
  lightsChallenge,
  hitScore,
  targetGameRules,
} from "./actionGames";
import type { Direction } from "./engines";
import { games } from "./catalog";
import { gameHelp, recordUnits } from "./gameHelp";
describe("Race", () => {
  it("steers one lane at a time and prevents instant double lane changes", () => {
    const state = initialRace();
    const left = steerRace(state, -10);
    expect(left.lane).toBe(0);
    expect(left.steerCooldown).toBeGreaterThan(0);
    expect(steerRace(left, 1).lane).toBe(0);

    let recovered = left;
    for (let i = 0; i < 2; i++)
      recovered = tickRace({ ...recovered, traffic: [] }, 3);
    expect(steerRace(recovered, 1).lane).toBe(1);
    expect(steerRace(state, 10).lane).toBe(2);
    expect(state.lane).toBe(1);
  });
  it("ramps road speed progressively without exceeding the selected pace cap", () => {
    expect(raceVelocity(3, 0)).toBeCloseTo(2.55, 2);
    expect(raceVelocity(3, 300)).toBeGreaterThan(raceVelocity(3, 0));
    expect(raceVelocity(3, 5000)).toBeLessThanOrEqual(4.2);
  });

  it("accelerates and brakes progressively around the selected base pace", () => {
    expect(racePaceOffset(0, 1)).toBeGreaterThan(0);
    expect(racePaceOffset(0, -1)).toBeLessThan(0);
    expect(racePaceOffset(0.8, 1)).toBeLessThanOrEqual(0.9);
    expect(racePaceOffset(-0.8, -1)).toBeGreaterThanOrEqual(-0.9);
    expect(racePaceOffset(0.5, 0)).toBeLessThan(0.5);
    expect(racePaceOffset(-0.5, 0)).toBeGreaterThan(-0.5);
  });

  it("lets traffic cars move at modestly different relative speeds", () => {
    const s = initialRace();
    const next = tickRace(
      {
        ...s,
        traffic: [
          { id: 1, lane: 0, y: 10, speedFactor: 0.85 },
          { id: 2, lane: 2, y: 10, speedFactor: 1.15 },
        ],
      },
      3,
    );
    expect(next.traffic[0].y).toBeLessThan(next.traffic[1].y);
    expect(next.traffic[0].y).toBeGreaterThan(10);
  });

  it("spawns predictable traffic and removes a collided car once", () => {
    let s = initialRace();
    for (let i = 0; i < 16; i++) s = tickRace(s, 3, () => 0);
    expect(s.traffic[0]).toMatchObject({ lane: 0, y: -16 });
    const crash = tickRace({ ...s, traffic: [{ id: 1, lane: 1, y: 72 }] }, 3);
    expect(crash.lives).toBe(2);
    expect(crash.traffic).toHaveLength(0);
    expect(tickRace(crash, 3).lives).toBe(2);
  });
  it("takes at most one life when multiple cars overlap in the same tick", () => {
    const s = initialRace();
    const crash = tickRace(
      {
        ...s,
        traffic: [
          { id: 1, lane: 1, y: 72 },
          { id: 2, lane: 1, y: 78 },
        ],
      },
      3,
    );
    expect(crash.lives).toBe(2);
    expect(crash.traffic).toHaveLength(0);
  });

  it("adds a short recovery window after a crash", () => {
    const s = initialRace();
    const first = tickRace(
      { ...s, traffic: [{ id: 1, lane: 1, y: 72 }] },
      3,
    );
    expect(first.lives).toBe(2);
    expect(first.crashCooldown).toBeGreaterThan(0);

    const protectedHit = tickRace(
      { ...first, traffic: [{ id: 2, lane: 1, y: 72 }] },
      3,
    );
    expect(protectedHit.lives).toBe(2);

    let recovered = protectedHit;
    for (let i = 0; i < 8; i++)
      recovered = tickRace({ ...recovered, traffic: [] }, 3);
    const nextCrash = tickRace(
      { ...recovered, traffic: [{ id: 3, lane: 1, y: 72 }] },
      3,
    );
    expect(nextCrash.lives).toBe(1);
  });

  it("ignores other lanes and stops after the last life", () => {
    const s = initialRace();
    expect(
      tickRace({ ...s, traffic: [{ id: 1, lane: 0, y: 72 }] }, 3).lives,
    ).toBe(3);
    const done = { ...s, lives: 0 };
    expect(tickRace(done, 3)).toBe(done);
  });
});
describe("Parking", () => {
  it("blocks walls, borders and horizontal row wrapping", () => {
    expect(moveParking(0, "left", [])).toBe(0);
    expect(moveParking(5, "right", [])).toBe(5);
    expect(moveParking(30, "down", [])).toBe(30);
    expect(moveParking(0, "right", [1])).toBe(0);
    expect(moveParking(0, "down", [])).toBe(6);
  });
  it("each of three courses has a reachable goal", () => {
    for (const level of parkingLevels) {
      const reached = new Set([level.start]);
      const queue = [level.start];
      for (let h = 0; h < queue.length; h++)
        for (const d of ["up", "down", "left", "right"] as Direction[]) {
          const next = moveParking(queue[h], d, level.walls);
          if (!reached.has(next)) {
            reached.add(next);
            queue.push(next);
          }
        }
      expect(reached.has(level.goal)).toBe(true);
    }
  });
  it("rewards fewer moves and smoother parking maneuvers", () => {
    expect(parkingSteeringCost(null, "up")).toBe(0);
    expect(parkingSteeringCost("up", "up")).toBe(0);
    expect(parkingSteeringCost("up", "right")).toBe(1);
    expect(parkingSteeringCost("up", "down")).toBe(2);
    expect(parkingScore(10)).toBe(90);
    expect(parkingScore(10, 3)).toBeLessThan(parkingScore(10, 0));
    expect(parkingScore(110, 20)).toBe(10);
  });
});
describe("Lights Out", () => {
  it("toggles only orthogonal neighbours without wrapping", () => {
    const empty = Array(25).fill(false);
    const b = toggleLights(empty, 4);
    expect(b.map((v, i) => (v ? i : -1)).filter((i) => i >= 0)).toEqual([
      3, 4, 9,
    ]);
    expect(empty.every((v) => !v)).toBe(true);
    expect(toggleLights(b, 4)).toEqual(empty);
  });
  it("all challenges can be solved with their seed moves", () => {
    const solutions = [
      [6, 12, 18],
      [0, 4, 12, 20, 24],
      [2, 6, 8, 12, 16, 18, 22],
    ];
    solutions.forEach((moves, l) => {
      const b = lightsChallenge(l);
      expect(b.some(Boolean)).toBe(true);
      expect(moves.reduce(toggleLights, b).every((v) => !v)).toBe(true);
    });
  });
});
it("target games scale difficulty without removing reaction time", () => {
  const easyShoot = targetGameRules("shoot", "easy");
  const hardShoot = targetGameRules("shoot", "hard");
  expect(easyShoot.duration).toBeGreaterThan(hardShoot.duration);
  expect(easyShoot.targets).toBeGreaterThan(hardShoot.targets);

  const easyCasual = targetGameRules("casual", "easy");
  const hardCasual = targetGameRules("casual", "hard");
  expect(easyCasual.duration).toBeGreaterThan(hardCasual.duration);
  expect(easyCasual.relocateMs).toBeGreaterThan(hardCasual.relocateMs);
  expect(hardCasual.relocateMs).toBeGreaterThanOrEqual(700);
});

it("shooting combos have a bounded bonus", () => {
  expect(hitScore(0, 0)).toBe(10);
  expect(hitScore(10, 1)).toBe(22);
  expect(hitScore(10, 100)).toBe(30);
});
it("all fifty games have specific help and valid record units", () => {
  expect(games.length).toBe(50);
  for (const g of games) expect(gameHelp[g.id].length).toBeGreaterThan(50);
  expect(Object.keys(recordUnits)).toHaveLength(44);
});
