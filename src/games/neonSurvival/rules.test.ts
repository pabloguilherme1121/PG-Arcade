import { describe, expect, it } from "vitest";
import { makeNeon, startNeon, turnNeon, choosePower, type NeonState } from "./rules";

describe("Sobrevivência Neon: waves, mobility and powers", () => {
  it("generates repeatable enemies and meaningful difficulty settings", () => {
    expect(makeNeon("normal", 7)).toEqual(makeNeon("normal", 7));
    expect(makeNeon("easy", 7).lives).toBeGreaterThan(makeNeon("hard", 7).lives);
    expect(makeNeon("easy", 7).enemies.length).toBeLessThan(makeNeon("hard", 7).enemies.length);
    expect(makeNeon("hard", 7).phase).toBe("ready");
    expect(startNeon(makeNeon("hard", 7)).phase).toBe("playing");
  });
  it("moves within bounds without mutating prior state, and does not move after pause or defeat", () => {
    const first = startNeon(makeNeon("normal", 7));
    const before = structuredClone(first);
    const moved = turnNeon(first, "left");
    expect(moved.player.x).toBe(3);
    expect(first).toEqual(before);
    const atEdge = { ...first, player: { x: 0, y: 0 }, enemies: [] } satisfies NeonState;
    expect(turnNeon(atEdge, "left").player).toEqual({ x: 0, y: 0 });
    expect(turnNeon({ ...first, phase: "paused" }, "up")).toEqual({ ...first, phase: "paused" });
    expect(turnNeon({ ...first, phase: "lost" }, "up")).toEqual({ ...first, phase: "lost" });
  });
  it("pulse clears adjacent enemies, consumes charge and awards points without reading hidden data", () => {
    const start = startNeon(makeNeon("normal", 9));
    const beside = { id: 45, x: 5, y: 4 };
    const far = { id: 46, x: 8, y: 8 };
    const state = { ...start, enemies: [beside, far], charge: 3 } satisfies NeonState;
    const next = turnNeon(state, "pulse");
    expect(next.charge).toBe(0);
    expect(next.score).toBe(10);
    expect(next.enemies.some(e => e.id === beside.id)).toBe(false);
    expect(state.enemies).toHaveLength(2);
    expect(turnNeon({ ...state, charge: 0 }, "pulse")).toEqual({ ...state, charge: 0 });
  });
  it("offers a real upgrade after six moves, then spawns a new horde", () => {
    let state: NeonState = { ...startNeon(makeNeon("easy", 4)), lives: 100, enemies: [] };
    for (let i = 0; i < 6; i++) state = turnNeon(state, i % 2 ? "down" : "up");
    expect(state.phase).toBe("upgrade");
    expect(state.wave).toBe(1);
    const upgraded = choosePower(state, "radius");
    expect(upgraded.phase).toBe("playing");
    expect(upgraded.wave).toBe(2);
    expect(upgraded.radius).toBe(2);
    expect(upgraded.enemies.length).toBeGreaterThan(0);
    expect(choosePower(upgraded, "shield")).toBe(upgraded);
  });
  it("finishes four waves and never records an impossible negative life value", () => {
    let state: NeonState = { ...startNeon(makeNeon("easy", 1)), lives: 100, enemies: [] };
    for (let wave = 1; wave <= 4; wave++) {
      for (let move = 0; move < 6; move++) {
        state = turnNeon(state, move % 2 ? "down" : "up");
        expect(state.lives).toBeGreaterThanOrEqual(0);
      }
      if (wave < 4) {
        expect(state.phase).toBe("upgrade");
        state = { ...choosePower(state, "shield"), enemies: [] };
      }
    }
    expect(state.phase).toBe("won");
    expect(state.turn).toBe(24);
    expect(state.score).toBeGreaterThan(0);
  });
});
