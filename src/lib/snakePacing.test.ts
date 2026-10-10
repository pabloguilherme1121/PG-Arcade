import { describe, expect, it } from "vitest";
import { snakeTickDelay } from "./snakePacing";

describe("snake optional progressive challenge", () => {
  it("keeps existing game speeds unchanged when the challenge is off", () => {
    expect(snakeTickDelay(220, 1000, false)).toBe(220);
    expect(snakeTickDelay(160, 80, false)).toBe(160);
    expect(snakeTickDelay(100, 0, false)).toBe(100);
  });

  it("speeds up after every second fruit without becoming unplayably fast", () => {
    expect(snakeTickDelay(160, 0, true)).toBe(160);
    expect(snakeTickDelay(160, 10, true)).toBe(160);
    expect(snakeTickDelay(160, 20, true)).toBe(148);
    expect(snakeTickDelay(160, 60, true)).toBe(124);
    expect(snakeTickDelay(160, 800, true)).toBe(90);
    expect(snakeTickDelay(100, 40, true)).toBe(90);
  });

  it("ignores negative or invalid score input without making timer speed up", () => {
    expect(snakeTickDelay(160, -20, true)).toBe(160);
    expect(snakeTickDelay(160, Number.NaN, true)).toBe(160);
  });
});
