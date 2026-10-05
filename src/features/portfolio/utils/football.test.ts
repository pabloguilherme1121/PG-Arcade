import { describe, expect, it } from "vitest";
import {
  chooseFootballKeeperPosition,
  getFootballFlightProfile,
  getFootballTargetX,
  getFootballCurveOffset,
  getFootballShotHeight,
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
  it("uses lift to clear the wall and rejects shots above the crossbar", () => {
    expect(getFootballShotHeight(65, 20)).toBeLessThan(
      getFootballShotHeight(65, 65),
    );
    expect(resolveFootballShot("free-kick", 50, 65, 0, 10, 20).result).toBe(
      "barreira",
    );
    expect(resolveFootballShot("free-kick", 50, 65, 0, 10, 55).result).toBe(
      "gol",
    );
    expect(resolveFootballShot("free-kick", 50, 80, 0, 10, 100).result).toBe(
      "fora",
    );
  });

  it("allows curve to go around a low free-kick wall", () => {
    expect(resolveFootballShot("free-kick", 50, 65, 75, 10, 22).result).toBe(
      "gol",
    );
  });

  it("keeps power limits explicit and applies lift to penalties as well as free kicks", () => {
    expect(resolveFootballShot("penalty", 20, 80, 0, 70, 98).result).toBe("gol");
    expect(resolveFootballShot("penalty", 20, 80, 0, 70, 99).result).toBe("fora");
    expect(resolveFootballShot("penalty", 20, 91, 0, 70, 0).result).toBe("fora");
    expect(resolveFootballShot("penalty", 20, 24, 0, 70, 45).result).toBe("fora");
    expect(resolveFootballShot("penalty", 20, 65, 100, 70, 45)).toEqual(
      resolveFootballShot("penalty", 20, 65, 0, 70, 45),
    );
    expect(getFootballShotHeight(-10, -10)).toBe(0);
    expect(getFootballShotHeight(200, 200)).toBe(90);
    for (const mode of ["penalty", "free-kick"] as const) {
      for (const lift of [0, 45, 100]) {
        const flight = getFootballFlightProfile(mode, 65, 0, lift);
        expect(flight.durationMs).toBeGreaterThanOrEqual(420);
        expect(flight.durationMs).toBeLessThanOrEqual(760);
        expect(Number.isFinite(flight.apexLift)).toBe(true);
      }
    }
  });
});

it("uses a plausible flight profile for power and free-kick bend", () => {
  const placed = getFootballFlightProfile("penalty", 58, 0);
  const driven = getFootballFlightProfile("penalty", 82, 0);
  const curved = getFootballFlightProfile("free-kick", 72, 65, 65);

  expect(driven.durationMs).toBeLessThan(placed.durationMs);
  expect(placed.durationMs).toBeGreaterThanOrEqual(430);
  expect(driven.durationMs).toBeLessThanOrEqual(650);
  expect(curved.bend).toBeGreaterThan(0);
  expect(curved.apexLift).toBeGreaterThan(
    getFootballFlightProfile("free-kick", 72, 65, 25).apexLift,
  );
  expect(curved.scaleAtGoal).toBeLessThan(1);
});
