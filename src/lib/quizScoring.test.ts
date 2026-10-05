import { describe, expect, it } from "vitest";
import { quizAward } from "./quizScoring";

describe("quiz streak scoring", () => {
  it("preserves the base score for the first correct answer", () => {
    expect(quizAward(0, 0, true)).toBe(100);
    expect(quizAward(1, 0, true)).toBe(200);
    expect(quizAward(2, 0, true)).toBe(300);
  });

  it("rewards consecutive correct answers without allowing an unbounded multiplier", () => {
    expect(quizAward(1, 1, true)).toBe(220);
    expect(quizAward(1, 3, true)).toBe(260);
    expect(quizAward(1, 9, true)).toBe(300);
  });

  it("awards no points to an incorrect answer", () => {
    expect(quizAward(2, 5, false)).toBe(0);
  });
});
