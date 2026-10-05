import { describe, it, expect } from "vitest";
import {
  newAction,
  stepAction,
  idleInput,
  actionCollectionGames,
  actionPressure,
  isExposedInvader,
  invasionFormationFactor,
} from "./actionCollection";
describe("action collection physics", () => {
  it("defines ten distinct games and bounds frame delta", () => {
    expect(new Set(actionCollectionGames.map((g) => g.id)).size).toBe(10);
    for (const g of actionCollectionGames) {
      const s = stepAction(newAction(g.id), idleInput, 5);
      expect(s.time).toBe(0.04);
      expect(Number.isFinite(s.x + s.y + s.score)).toBe(true);
    }
  });
  it("rebounds breakout with impact angle, paddle motion and bounded speed", () => {
    const s = newAction("breakout");
    s.ball = { x: 265, y: 317, vx: 0, vy: 420, r: 7, kind: "ball", hp: 1 };
    const still = stepAction(s, idleInput, 0.02);
    const moving = stepAction(
      s,
      { ...idleInput, right: true },
      0.02,
    );
    expect(still.ball.vy).toBeLessThan(0);
    expect(Math.abs(still.ball.vy)).toBeLessThanOrEqual(340);
    expect(moving.ball.vx).toBeGreaterThan(still.ball.vx);
    expect(s.ball.vy).toBe(420);
  });
  it("destroys actual bricks and awards points only on collision", () => {
    const s = newAction("breakout");
    s.ball = { ...s.ball, x: 42, y: 42 };
    const n = stepAction(s, idleInput, 0);
    expect(n.objects.length).toBe(29);
    expect(n.score).toBe(10);
  });
  it("pong paddle motion adds controlled spin without unbounded ball speed", () => {
    const base = newAction("pong");
    base.paddle = 180;
    base.ball = { x: 35, y: 186, vx: -300, vy: 0, r: 7, kind: "ball", hp: 1 };

    const still = stepAction(base, idleInput, 0.02);
    const moving = stepAction(
      base,
      { ...idleInput, down: true },
      0.02,
    );

    expect(moving.ball.vx).toBeGreaterThan(0);
    expect(Math.abs(moving.ball.vx)).toBeLessThanOrEqual(320);
    expect(moving.ball.vy).toBeGreaterThan(still.ball.vy);
  });

  it("awards pong goals and resets ball rather than firing a score button", () => {
    const s = newAction("pong");
    s.ball.x = 495;
    const n = stepAction(s, idleInput, 0.01);
    expect(n.score).toBe(100);
    expect(n.ball.x).toBe(240);
  });
  it("asteroid ship conserves momentum in vacuum while speed remains capped", () => {
    const coasting = newAction("asteroides");
    coasting.vx = 100;
    coasting.vy = -40;
    const next = stepAction(coasting, idleInput, 0.04);
    expect(next.vx).toBeCloseTo(100, 6);
    expect(next.vy).toBeCloseTo(-40, 6);

    const fast = newAction("asteroides");
    fast.angle = 0;
    fast.vx = 255;
    const accelerated = stepAction(
      fast,
      { ...idleInput, up: true },
      0.04,
    );
    expect(Math.hypot(accelerated.vx, accelerated.vy)).toBeLessThanOrEqual(260);
  });

  it("asteroid shots inherit ship momentum in vacuum", () => {
    const s = newAction("asteroides");
    s.angle = 0;
    s.vx = 80;
    s.vy = -20;
    s.spawn = 1;
    const n = stepAction(s, { ...idleInput, action: true }, 0);
    expect(n.shots).toHaveLength(1);
    expect(n.shots[0].vx).toBeGreaterThan(330);
    expect(n.shots[0].vy).toBe(-20);
  });

  it("asteroids split after a projectile hit and wrap the ship", () => {
    const s = newAction("asteroides");
    s.x = 481;
    s.objects = [{ x: 80, y: 80, vx: 0, vy: 0, r: 22, kind: "rock", hp: 1 }];
    s.shots = [{ x: 80, y: 80, vx: 0, vy: 0, r: 3, kind: "laser", hp: 1 }];
    const n = stepAction(s, idleInput, 0.01);
    expect(n.x).toBe(1);
    expect(n.objects).toHaveLength(2);
    expect(n.score).toBe(20);
  });
  it("only exposed invaders can fire through their column", () => {
    const front = { x: 100, y: 120, vx: 0, vy: 0, r: 13, kind: "invader", hp: 1 };
    const back = { x: 100, y: 80, vx: 0, vy: 0, r: 13, kind: "invader", hp: 1 };
    const side = { x: 150, y: 80, vx: 0, vy: 0, r: 13, kind: "invader", hp: 1 };
    const formation = [back, front, side];
    expect(isExposedInvader(front, formation)).toBe(true);
    expect(isExposedInvader(back, formation)).toBe(false);
    expect(isExposedInvader(side, formation)).toBe(true);
  });

  it("speeds the invader formation up as enemies are eliminated", () => {
    expect(invasionFormationFactor(24)).toBe(1);
    expect(invasionFormationFactor(12)).toBeGreaterThan(1);
    expect(invasionFormationFactor(1)).toBeGreaterThan(
      invasionFormationFactor(12),
    );
    expect(invasionFormationFactor(0)).toBeLessThanOrEqual(1.9);
  });

  it("invasion projectile removes one enemy and leaves the formation", () => {
    const s = newAction("invasores");
    s.shots = [{ x: 76, y: 45, vx: 0, vy: 0, r: 3, kind: "laser", hp: 1 }];
    const n = stepAction(s, idleInput, 0);
    expect(n.objects).toHaveLength(23);
    expect(n.score).toBe(25);
  });
  it("runner supports a shorter jump when the player releases early", () => {
    const s = newAction("runner");
    const launched = stepAction(
      s,
      { ...idleInput, action: true },
      0.02,
    );
    const held = stepAction(
      launched,
      { ...idleInput, action: true },
      0.02,
    );
    const released = stepAction(launched, idleInput, 0.02);
    expect(released.vy).toBeGreaterThan(held.vy);
    expect(released.vy).toBeLessThan(0);
  });

  it("runner jump requires a fresh press after landing", () => {
    const s = newAction("runner");
    const n = stepAction(s, { ...idleInput, action: true }, 0.02);
    expect(n.y).toBeLessThan(s.y);
    expect(n.vy).toBeLessThan(0);
    n.y = 286;
    n.vy = 0;
    expect(stepAction(n, { ...idleInput, action: true }, 0.02).vy).toBe(0);
  });
  it("flight flap adds lift to current momentum instead of resetting velocity", () => {
    const falling = newAction("voo");
    falling.vy = 160;
    const corrected = stepAction(
      falling,
      { ...idleInput, action: true },
      0.02,
    );
    expect(corrected.vy).toBeLessThan(160);
    expect(corrected.vy).toBeGreaterThan(-200);

    const rising = newAction("voo");
    rising.vy = -80;
    const boosted = stepAction(
      rising,
      { ...idleInput, action: true },
      0.02,
    );
    expect(boosted.vy).toBeLessThan(corrected.vy);
    expect(boosted.vy).toBeGreaterThanOrEqual(-220);
  });

  it("flapping is an impulse while jetpack fuel only decreases under thrust", () => {
    const flight = stepAction(
      newAction("voo"),
      { ...idleInput, action: true },
      0.02,
    );
    expect(flight.vy).toBeLessThan(0);
    const jet = stepAction(
      newAction("jetpack"),
      { ...idleInput, action: true },
      0.02,
    );
    expect(jet.fuel).toBeLessThan(100);
    expect(jet.vy).toBeLessThan(0);
    expect(stepAction(jet, idleInput, 0.02).fuel).toBe(jet.fuel);
  });

  it("jetpack fuel canisters refill part of the tank instead of teleporting to full", () => {
    const s = newAction("jetpack");
    s.fuel = 20;
    s.objects = [
      { x: 95, y: s.y, vx: 0, vy: 0, r: 13, kind: "fuel", hp: 1 },
    ];
    const n = stepAction(s, idleInput, 0);
    expect(n.fuel).toBeGreaterThan(20);
    expect(n.fuel).toBeLessThan(100);
    expect(n.objects).toHaveLength(0);
  });
  it("arena movement accelerates and coasts briefly instead of stopping instantly", () => {
    const s = newAction("esquiva");
    const moving = stepAction(
      s,
      { ...idleInput, right: true },
      0.04,
    );
    const coasting = stepAction(moving, idleInput, 0.04);
    expect(moving.vx).toBeGreaterThan(0);
    expect(coasting.x).toBeGreaterThan(moving.x);
    expect(coasting.vx).toBeGreaterThan(0);
    expect(coasting.vx).toBeLessThan(moving.vx);
  });

  it("arena collisions consume one life and invulnerability prevents repeat hits", () => {
    const s = newAction("esquiva");
    s.objects = [{ x: s.x, y: s.y, vx: 0, vy: 0, r: 8, kind: "danger", hp: 1 }];
    const n = stepAction(s, idleInput, 0);
    expect(n.lives).toBe(2);
    n.objects = s.objects;
    expect(stepAction(n, idleInput, 0.02).lives).toBe(2);
  });
  it("lunar side thrusters consume less fuel than the main engine", () => {
    const s = newAction("pouso");
    const coast = stepAction(s, idleInput, 0.04);
    const side = stepAction(s, { ...idleInput, right: true }, 0.04);
    const main = stepAction(s, { ...idleInput, up: true }, 0.04);
    expect(side.fuel).toBeLessThan(coast.fuel);
    expect(main.fuel).toBeLessThan(side.fuel);
    expect(side.vx).toBeGreaterThan(coast.vx);
  });

  it("lunar landing rewards safe velocity and rejects a crash", () => {
    const s = newAction("pouso");
    s.x = 345;
    s.y = 321;
    s.vy = 12;
    const landed = stepAction(s, idleInput, 0);
    expect(landed.score).toBe(400);
    expect(landed.level).toBe(2);
    s.vy = 70;
    const crash = stepAction(s, idleInput, 0);
    expect(crash.score).toBe(0);
    expect(crash.lives).toBe(2);
  });
  it("drift braking creates controllable lateral slip instead of rigid rotation", () => {
    const base = newAction("drift");
    base.vx = 140;
    base.angle = 0;

    const grip = stepAction(
      base,
      { ...idleInput, left: true, up: true },
      0.04,
    );
    const slide = stepAction(
      base,
      { ...idleInput, left: true, down: true },
      0.04,
    );

    expect(Math.abs(slide.vy)).toBeGreaterThan(Math.abs(grip.vy));
    expect(slide.y).not.toBe(base.y);
    expect(slide.vx).toBeLessThan(base.vx);
  });

  it("drift checkpoints must be crossed in order", () => {
    const s = newAction("drift");
    s.x = 240;
    s.y = 307;
    expect(stepAction(s, idleInput, 0).score).toBe(0);
    s.x = 420;
    s.y = 180;
    const n = stepAction(s, idleInput, 0);
    expect(n.score).toBe(50);
    expect(n.checkpoint).toBe(1);
  });
  it("mission has a duration limit while endurance remains open", () => {
    const s = newAction("esquiva");
    s.time = 179.99;
    expect(stepAction(s, idleInput, 0.02).done).toBe(true);
    s.mode = "endless";
    expect(stepAction(s, idleInput, 0.02).done).toBe(false);
  });
  it("difficulty adjusts pressure and lives across five levels", () => {
    const easy = newAction("pong", "easy");
    const normal = newAction("pong", "normal");
    const hard = newAction("pong", "hard");
    const master = newAction("pong", "master");
    const expert = newAction("pong", "expert");
    expect(easy.lives).toBe(5);
    expect(normal.lives).toBe(3);
    expect(hard.lives).toBe(3);
    expect(master.lives).toBe(2);
    expect(expert.lives).toBe(2);
    const speeds = [easy, normal, hard, master, expert].map(
      (state) => stepAction(state, idleInput, 0.02).ball.x - state.ball.x,
    );
    expect(speeds).toEqual([...speeds].sort((a, b) => a - b));
  });

  it("keeps action pressure monotonic and capped over long sessions", () => {
    const levels = ["easy", "normal", "hard", "master", "expert"] as const;
    const start = levels.map((level) => actionPressure(level, 0));
    const late = levels.map((level) => actionPressure(level, 1200));
    for (let i = 1; i < levels.length; i++) {
      expect(start[i]).toBeGreaterThan(start[i - 1]);
      expect(late[i]).toBeGreaterThan(late[i - 1]);
    }
    expect(actionPressure("easy", 1200)).toBe(actionPressure("easy", 0));
    expect(actionPressure("expert", 1200)).toBeLessThanOrEqual(2.15);
  });
  it("ramps normal and hard pressure but caps long-session speed", () => {
    const displacement = (level: "easy" | "normal" | "hard", time: number) => {
      const state = newAction("pong", level, "endless");
      state.time = time;
      return stepAction(state, idleInput, 0.02).ball.x - state.ball.x;
    };
    expect(displacement("easy", 120)).toBe(displacement("easy", 0));
    for (const level of ["normal", "hard"] as const) {
      expect(displacement(level, 120)).toBeGreaterThan(displacement(level, 0));
      expect(displacement(level, 1200)).toBe(displacement(level, 120));
    }
    expect(displacement("hard", 0)).toBeGreaterThan(displacement("normal", 120));
  });

});
