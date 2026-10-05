import { describe, expect, it } from "vitest";
import {
  chooseFootballKeeperPosition,
  getFootballFlightProfile,
  getFootballTargetX,
  getFootballCurveOffset,
  resolveFootballShot,
} from "./football";
describe("football shots", () => {
  it("makes harder keepers anticipate the selected corner", () => {
    const easy = chooseFootballKeeperPosition("easy", 80, () => 0);
    const master = chooseFootballKeeperPosition("master", 80, () => 0);
    expect(Math.abs(master - 80)).toBeLessThan(Math.abs(easy - 80));
  });
  it("uses the curved final target when reading free kicks", () => {
    const target = getFootballTargetX("free-kick", 50, 80, 65);
    expect(target).toBeGreaterThan(60);
    const easy = chooseFootballKeeperPosition("easy", target, () => 0);
    const expert = chooseFootballKeeperPosition("expert", target, () => 0);
    expect(Math.abs(expert - target)).toBeLessThan(Math.abs(easy - target));
  });

  it("lets slower free kicks bend more because the ball stays in flight longer", () => {
    const slower = Math.abs(getFootballCurveOffset("free-kick", 55, 80));
    const driven = Math.abs(getFootballCurveOffset("free-kick", 85, 80));
    expect(slower).toBeGreaterThan(driven);
    expect(getFootballCurveOffset("penalty", 55, 80)).toBe(0);
  });
  it("rejects excessive power and shots outside the goal", () => {
    expect(resolveFootballShot("penalty", 50, 100, 0, 0).result).toBe("fora");
    expect(resolveFootballShot("penalty", 0, 60, 0, 50).result).toBe("fora");
  });
  it("allows the keeper to save and rewards placement", () => {
    expect(resolveFootballShot("penalty", 50, 65, 0, 50).result).toBe("defesa");
    expect(resolveFootballShot("penalty", 20, 65, 0, 70).result).toBe("gol");
  });
  it("requires height or curve to beat the free-kick wall", () => {
    expect(resolveFootballShot("free-kick", 50, 40, 0, 10).result).toBe(
      "barreira",
    );
    expect(resolveFootballShot("free-kick", 50, 65, 70, 10).result).toBe("gol");
  });
});

it("uses a plausible flight profile for power and free-kick bend", () => {
  const placed = getFootballFlightProfile("penalty", 58, 0);
  const driven = getFootballFlightProfile("penalty", 82, 0);
  const curved = getFootballFlightProfile("free-kick", 72, 65);

  expect(driven.durationMs).toBeLessThan(placed.durationMs);
  expect(placed.durationMs).toBeGreaterThanOrEqual(430);
  expect(driven.durationMs).toBeLessThanOrEqual(650);
  expect(curved.bend).toBeGreaterThan(0);
  expect(curved.scaleAtGoal).toBeLessThan(1);
});
