import { describe, expect, it } from "vitest";
import { memoryAccuracy, memoryFocusTarget } from "./memoryFeedback";

describe("Memory feedback", () => {
  it("reports precision with a zero-attempt starting state", () => {
    expect(memoryAccuracy(0, 0)).toBe(0);
    expect(memoryAccuracy(1, 1)).toBe(100);
    expect(memoryAccuracy(1, 2)).toBe(50);
    expect(memoryAccuracy(3, 4)).toBe(75);
  });
  it("moves within board rows and skips matched or unavailable squares", () => {
    const blocked = [true, false, false, false, true, false, false, false];
    expect(memoryFocusTarget(1, "ArrowRight", blocked)).toBe(2);
    expect(memoryFocusTarget(1, "ArrowDown", blocked)).toBe(5);
    expect(memoryFocusTarget(3, "ArrowRight", blocked)).toBeNull();
    expect(memoryFocusTarget(1, "ArrowLeft", blocked)).toBeNull();
    expect(memoryFocusTarget(7, "ArrowDown", blocked)).toBeNull();
    expect(memoryFocusTarget(5, "ArrowRight", blocked)).toBe(6);
    expect(memoryFocusTarget(5, "ArrowUp", blocked)).toBe(1);
  });
  it("ignores unsupported navigation and full-board lock", () => {
    const blocked = Array(8).fill(true);
    expect(memoryFocusTarget(0, "ArrowRight", blocked)).toBeNull();
    expect(memoryFocusTarget(0, "Escape", blocked)).toBeNull();
  });
});
