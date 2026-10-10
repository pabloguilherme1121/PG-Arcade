import { describe, expect, it } from "vitest";
import { targetAccuracy, targetFocusTarget } from "./targetFeedback";

describe("Alvos e estrelas: navegação e precisão", () => {
  it("calculates hit rate only after attempts", () => {
    expect(targetAccuracy(0,0)).toBe(0);
    expect(targetAccuracy(1,1)).toBe(100);
    expect(targetAccuracy(2,4)).toBe(50);
    expect(targetAccuracy(1,3)).toBe(33);
    expect(targetAccuracy(0,5)).toBe(0);
  });
  it("navigates a 3x3 grid without row wrapping", () => {
    expect(targetFocusTarget(4,"ArrowRight")).toBe(5);
    expect(targetFocusTarget(4,"ArrowLeft")).toBe(3);
    expect(targetFocusTarget(4,"ArrowUp")).toBe(1);
    expect(targetFocusTarget(4,"ArrowDown")).toBe(7);
    expect(targetFocusTarget(2,"ArrowRight")).toBeNull();
    expect(targetFocusTarget(3,"ArrowLeft")).toBeNull();
    expect(targetFocusTarget(0,"ArrowUp")).toBeNull();
    expect(targetFocusTarget(8,"ArrowDown")).toBeNull();
    expect(targetFocusTarget(4,"Enter")).toBeNull();
  });
});
