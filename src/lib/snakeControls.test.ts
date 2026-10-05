import { describe, it, expect } from "vitest";
import { queueSnakeTurn } from "./snakeControls";

describe("Snake buffered turns", () => {
  it("preserves a quick corner in order without reversing between ticks", () => {
    const first = queueSnakeTurn("right", [], "up");
    expect(queueSnakeTurn("right", first, "left")).toEqual(["up", "left"]);
    expect(queueSnakeTurn("right", first, "down")).toBe(first);
    expect(first).toEqual(["up"]);
  });
  it("ignores repeats, direct reversals and a third queued turn", () => {
    expect(queueSnakeTurn("right", [], "left")).toEqual([]);
    expect(queueSnakeTurn("right", [], "right")).toEqual([]);
    const queue = ["up", "left"] as const;
    expect(queueSnakeTurn("right", [...queue], "down")).toEqual(queue);
  });
});
