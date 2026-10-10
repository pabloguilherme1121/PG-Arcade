import { describe, expect, it } from "vitest";
import { minesFocusTarget } from "./minesNavigation";

describe("Campo Minado: navigation across 8 by 8 board", () => {
  it("moves within the same row without wrapping or leaving the board", () => {
    const blocked = Array(64).fill(false);
    expect(minesFocusTarget(0, "ArrowLeft", blocked)).toBeNull();
    expect(minesFocusTarget(7, "ArrowRight", blocked)).toBeNull();
    expect(minesFocusTarget(8, "ArrowLeft", blocked)).toBeNull();
    expect(minesFocusTarget(0, "ArrowRight", blocked)).toBe(1);
    expect(minesFocusTarget(8, "ArrowUp", blocked)).toBe(0);
    expect(minesFocusTarget(55, "ArrowDown", blocked)).toBe(63);
    expect(minesFocusTarget(56, "ArrowDown", blocked)).toBeNull();
  });
  it("skips opened or disabled cells but never jumps rows horizontally", () => {
    const blocked = Array(64).fill(false);
    blocked[1] = true;
    blocked[8] = true;
    blocked[16] = true;
    expect(minesFocusTarget(0, "ArrowRight", blocked)).toBe(2);
    expect(minesFocusTarget(0, "ArrowDown", blocked)).toBe(24);
    blocked.fill(true);
    expect(minesFocusTarget(0, "ArrowRight", blocked)).toBeNull();
  });
  it("ignores unrelated keys and invalid index", () => {
    expect(minesFocusTarget(0, "Enter", Array(64).fill(false))).toBeNull();
    expect(minesFocusTarget(-1, "ArrowRight", Array(64).fill(false))).toBeNull();
  });
});
