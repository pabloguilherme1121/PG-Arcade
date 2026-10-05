import { describe, it, expect } from "vitest";
import {
  newAction,
  stepAction,
  idleInput,
  actionCollectionGames,
  actionPressure,
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
  it("rebounds breakout on the paddle with impact-dependent angle", () => {
    const s = newAction("breakout");
    s.ball = { x: 265, y: 317, vx: 0, vy: 100, r: 7, kind: "ball", hp: 1 };
    const next = stepAction(s, idleInput, 0.02);
    expect(next.ball.vy).toBeLessThan(0);
    expect(next.ball.vx).toBeGreaterThan(0);
    expect(s.ball.vy).toBe(100);
  });
  it("destroys actual bricks and awards points only on collision", () => {
    const s = newAction("breakout");
    s.ball = { ...s.ball, x: 42, y: 42 };
    const n = stepAction(s, idleInput, 0);
    expect(n.objects.length).toBe(29);
    expect(n.score).toBe(10);
  });
  it("awards pong goals and resets ball rather than firing a score button", () => {
    const s = newAction("pong");
    s.ball.x = 495;
    const n = stepAction(s, idleInput, 0.01);
    expect(n.score).toBe(100);
    expect(n.ball.x).toBe(240);
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
  it("invasion projectile removes one enemy and leaves the formation", () => {
    const s = newAction("invasores");
    s.shots = [{ x: 76, y: 45, vx: 0, vy: 0, r: 3, kind: "laser", hp: 1 }];
    const n = stepAction(s, idleInput, 0);
    expect(n.objects).toHaveLength(23);
    expect(n.score).toBe(25);
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
  it("flapping is an impulse while jetpack consumes held thrust fuel", () => {
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
    expect(stepAction(jet, idleInput, 0.02).fuel).toBeGreaterThan(jet.fuel);
  });
  it("arena collisions consume one life and invulnerability prevents repeat hits", () => {
    const s = newAction("esquiva");
    s.objects = [{ x: s.x, y: s.y, vx: 0, vy: 0, r: 8, kind: "danger", hp: 1 }];
    const n = stepAction(s, idleInput, 0);
    expect(n.lives).toBe(2);
    n.objects = s.objects;
    expect(stepAction(n, idleInput, 0.02).lives).toBe(2);
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
