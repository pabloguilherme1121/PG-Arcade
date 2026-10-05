import { describe, it, expect } from "vitest";
import {
  handValue,
  dealerShouldHit,
  diceScore,
  matches,
  adjacent,
  swapJewels,
  makeJewels,
  settleJewels,
  hasJewelMove,
  projectile,
  basketHit,
  basketEntryQuality,
  arrowImpact,
  arrowTrajectory,
  arrowPoints,
  bowlingHit,
  bowlingTrajectory,
  golfStroke,
  fishingTensionTick,
  fishingReelStep,
  casualGames,
  moveGridCursor,
} from "./casualCollection";
describe("casual grid controls", () => {
  it("moves within grid rows and columns without wrapping across edges", () => {
    expect(moveGridCursor(5, "ArrowRight", 6, 36)).toBe(5);
    expect(moveGridCursor(6, "ArrowLeft", 6, 36)).toBe(6);
    expect(moveGridCursor(0, "ArrowUp", 6, 36)).toBe(0);
    expect(moveGridCursor(35, "ArrowDown", 6, 36)).toBe(35);
    expect(moveGridCursor(7, "ArrowRight", 6, 36)).toBe(8);
    expect(moveGridCursor(7, "ArrowDown", 6, 36)).toBe(13);
  });
});

describe("casual collection engines", () => {
  it("adjusts aces only as needed and caps face cards", () => {
    expect(handValue([1, 1, 9])).toBe(21);
    expect(handValue([13, 12, 2])).toBe(22);
    expect(handValue([1, 1, 1, 8])).toBe(21);
  });

  it("uses realistic dealer stand-on-17 and hard-mode hit-on-soft-17 rules", () => {
    expect(dealerShouldHit([10, 6], 1)).toBe(true);
    expect(dealerShouldHit([10, 7], 1)).toBe(false);
    expect(dealerShouldHit([1, 6], 1)).toBe(false);
    expect(dealerShouldHit([1, 6], 2)).toBe(true);
    expect(dealerShouldHit([10, 7], 2)).toBe(false);
  });
  it("scores distinct dice combinations and rewards five equal dice", () => {
    expect(diceScore([6, 6, 6, 6, 6])).toBe(130);
    expect(diceScore([1, 2, 3, 4, 5])).toBe(95);
    expect(diceScore([3, 3, 3, 2, 2])).toBe(63);
    expect(diceScore([1, 1, 2, 2, 6])).toBe(32);
  });
  it("does not consider the edge between two rows adjacent", () => {
    expect(adjacent(5, 6)).toBe(false);
    expect(adjacent(5, 11)).toBe(true);
    expect(adjacent(0, 0)).toBe(false);
  });
  it("creates an initial match-free board even with a constant random source", () => {
    expect(matches(makeJewels(() => 0))).toEqual([]);
  });
  it("rejects swaps that do not create matches", () => {
    const board = makeJewels(() => 0);
    expect(swapJewels(board, 5, 6)).toBeNull();
    expect(swapJewels(board, 0, 6)).toBeNull();
  });
  it("removes intersections once and grants increasing cascade points", () => {
    const board = Array.from(
      { length: 36 },
      (_, i) => (i + Math.floor(i / 6)) % 5,
    );
    board[0] = board[1] = board[2] = 4;
    expect(matches(board)).toContain(0);
    let n = 0;
    const resolved = settleJewels(board, () => ((n++ * 3) % 7) / 7);
    expect(resolved.score).toBeGreaterThanOrEqual(30);
    expect(resolved.board).toHaveLength(36);
    expect(resolved.board.every((v) => v >= 0 && v <= 4)).toBe(true);
  });
  it("finds at least one accessible scoring move", () => {
    const board = makeJewels(() => 0.3);
    board[0] = 1;
    board[1] = 2;
    board[2] = 1;
    board[7] = 1;
    expect(hasJewelMove(board)).toBe(true);
    expect(swapJewels(board, 1, 7)).not.toBeNull();
  });
  it("basketball counts descending crossings only", () => {
    expect(
      basketHit([
        { x: 285, y: 135 },
        { x: 285, y: 115 },
      ]),
    ).toBe(false);
    expect(
      basketHit([
        { x: 280, y: 120 },
        { x: 290, y: 130 },
      ]),
    ).toBe(true);
    expect(
      basketHit([
        { x: 320, y: 120 },
        { x: 330, y: 130 },
      ]),
    ).toBe(false);
  });
  it("basketball distinguishes a clean swish from a rimmed make", () => {
    expect(
      basketEntryQuality([
        { x: 285, y: 118 },
        { x: 285, y: 132 },
      ], 12),
    ).toBe("swish");
    expect(
      basketEntryQuality([
        { x: 275, y: 118 },
        { x: 278, y: 132 },
      ], 12),
    ).toBe("rim");
    expect(
      basketEntryQuality([
        { x: 320, y: 118 },
        { x: 325, y: 132 },
      ], 12),
    ).toBe("miss");
  });

  it("basketball has a physically reachable basket with the provided controls", () => {
    let reachable = false;
    for (let a = 0; a <= 100; a++)
      for (let p = 10; p <= 100; p++)
        if (basketHit(projectile(a, p, 0), 8)) reachable = true;
    expect(reachable).toBe(true);
  });
  it("archery responds to wind and centers yield the highest score", () => {
    expect(arrowImpact(150, 100, 5)).toBeGreaterThan(150);
    expect(arrowPoints(150)).toBe(100);
    expect(arrowPoints(260)).toBe(0);
  });

  it("archery renders a curved flight path ending at the computed impact", () => {
    const flight = arrowTrajectory(150, 65, 5);
    expect(flight.length).toBeGreaterThan(8);
    expect(flight[0]).toEqual({ x: 30, y: 150 });
    expect(flight.at(-1)?.x).toBe(305);
    expect(flight.at(-1)?.y).toBeCloseTo(arrowImpact(150, 65, 5), 5);
    const midpoint = flight[Math.floor(flight.length / 2)];
    expect(midpoint.y).not.toBe(150);
  });
  it("bowling hook bends late and high power reduces the lateral curve", () => {
    const straight = bowlingTrajectory(50, 65, 0);
    const hook = bowlingTrajectory(50, 65, 80);
    const fastHook = bowlingTrajectory(50, 95, 80);
    expect(straight.at(-1)?.x).toBeCloseTo(150, 5);
    expect(hook.at(-1)!.x).toBeGreaterThan(straight.at(-1)!.x);
    expect(hook.at(-1)!.x - straight.at(-1)!.x).toBeGreaterThan(
      fastHook.at(-1)!.x - straight.at(-1)!.x,
    );
    expect(hook[Math.floor(hook.length / 2)].x).toBeLessThan(hook.at(-1)!.x);
  });

  it("bowling keeps previous pins down and adds realistic pin carry", () => {
    const pins = Array(10).fill(true);
    pins[0] = false;
    expect(bowlingHit(pins, 50, 100)[0]).toBe(false);

    const carried = bowlingHit(Array(10).fill(true), 50, 30, 1);
    expect(carried[3]).toBe(false);
    expect(carried[5]).toBe(false);

    const strike = bowlingHit(Array(10).fill(true), 50, 100, 0);
    expect(strike.every((standing) => !standing)).toBe(true);
  });
  it("golf treats center aim as straight and loses distance off-line", () => {
    const straight = golfStroke(35, 50, 60, false);
    const angled = golfStroke(35, 0, 60, false);
    expect(straight.position).toBeGreaterThan(35);
    expect(straight.position).toBeGreaterThan(angled.position);
  });

  it("golf obstacle stops underpowered crossings and hole rewards controlled pace", () => {
    expect(golfStroke(150, 50, 20, true).position).toBe(165);
    expect(golfStroke(250, 50, 25, false).hole).toBe(true);
    expect(golfStroke(250, 50, 100, false).hole).toBe(false);
  });
  it("fishing tension relaxes between deterministic fish pulls", () => {
    expect(fishingTensionTick(50, 1, 1)).toBeLessThan(50);
    const easyPull = fishingTensionTick(50, 12, 0);
    const hardPull = fishingTensionTick(50, 8, 2);
    expect(hardPull).toBeGreaterThan(easyPull);
    expect(hardPull).toBeGreaterThan(50);
    expect(fishingTensionTick(2, 1, 0)).toBe(0);
  });

  it("fishing reel progress falls as line tension rises", () => {
    const relaxed = fishingReelStep(100, 20, 1);
    const strained = fishingReelStep(100, 80, 1);
    const hard = fishingReelStep(100, 20, 2);
    expect(relaxed.distance).toBeLessThan(strained.distance);
    expect(strained.distance).toBeLessThan(100);
    expect(hard.tension).toBeGreaterThan(relaxed.tension);
    expect(relaxed.tension).toBeGreaterThan(20);
  });

  it("provides eight unique game IDs and useful instructions", () => {
    expect(new Set(casualGames.map((g) => g.id)).size).toBe(8);
    expect(casualGames.every((g) => g.help.length > 50)).toBe(true);
  });
});
