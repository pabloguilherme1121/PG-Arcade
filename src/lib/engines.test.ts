import { describe, it, expect } from "vitest";
import {
  slide2048,
  canMove2048,
  spawn2048,
  stepSnake,
  snakeFood,
  shuffledPairs,
  queueSnakeDirection,
  directionFromKey,
  directionFromSwipe,
} from "./engines";
describe("2048", () => {
  it("merges each tile once and scores every merge", () => {
    const r = slide2048([2, 2, 2, 2, ...Array(12).fill(0)], "left");
    expect(r.board.slice(0, 4)).toEqual([4, 4, 0, 0]);
    expect(r.score).toBe(8);
  });
  it("merges in the direction of travel without crossing rows", () => {
    expect(
      slide2048([2, 0, 2, 4, ...Array(12).fill(0)], "right").board.slice(0, 4),
    ).toEqual([0, 0, 4, 4]);
    const b = Array(16).fill(0);
    b[0] = b[4] = 2;
    expect(slide2048(b, "down").board[12]).toBe(4);
  });
  it("does not spawn after a blocked move and detects game over", () => {
    const b = [2, 4, 2, 4, 4, 2, 4, 2, 2, 4, 2, 4, 4, 2, 4, 2];
    expect(canMove2048(b)).toBe(false);
    expect(slide2048(b, "left").changed).toBe(false);
    expect(spawn2048(b)).toEqual(b);
  });
  it("spawns in an empty cell and never overwrites occupied cells", () => {
    expect(spawn2048([2, ...Array(15).fill(0)], () => 0).slice(0, 2)).toEqual([
      2, 2,
    ]);
  });
});
describe("Directional input", () => {
  it("maps arrows and WASD consistently, including uppercase keys", () => {
    expect(directionFromKey("ArrowUp")).toBe("up");
    expect(directionFromKey("w")).toBe("up");
    expect(directionFromKey("W")).toBe("up");
    expect(directionFromKey("A")).toBe("left");
    expect(directionFromKey("s")).toBe("down");
    expect(directionFromKey("D")).toBe("right");
    expect(directionFromKey("Enter")).toBeNull();
  });

  it("ignores short swipes and favors the dominant axis", () => {
    expect(directionFromSwipe(19, 0, 20)).toBeNull();
    expect(directionFromSwipe(30, 25, 20)).toBe("right");
    expect(directionFromSwipe(-30, 25, 20)).toBe("left");
    expect(directionFromSwipe(10, -40, 20)).toBe("up");
    expect(directionFromSwipe(10, 40, 20)).toBe("down");
  });
});

describe("Snake", () => {
  it("buffers a fast corner without allowing an immediate reverse", () => {
    expect(queueSnakeDirection("right", "right", "left")).toBe("right");
    expect(queueSnakeDirection("right", "right", "up")).toBe("up");
    expect(queueSnakeDirection("right", "up", "left")).toBe("left");
    expect(queueSnakeDirection("right", "up", "down")).toBe("up");
  });
  it("grows on food and collides with walls", () => {
    const b = [
      { x: 1, y: 0 },
      { x: 0, y: 0 },
    ];
    expect(stepSnake(b, "right", { x: 2, y: 0 }).body).toHaveLength(3);
    expect(stepSnake(b, "up", { x: 5, y: 5 }).collision).toBe(true);
  });
  it("allows moving into the vacated tail but not the body", () => {
    const b = [
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 0, y: 2 },
      { x: 0, y: 1 },
    ];
    expect(stepSnake(b, "left", { x: 4, y: 4 }).collision).toBe(false);
    expect(stepSnake(b, "down", { x: 4, y: 4 }).collision).toBe(true);
  });
  it("never places food inside the snake and handles a full board", () => {
    expect(snakeFood([{ x: 0, y: 0 }], 2, () => 0)).toEqual({ x: 1, y: 0 });
    expect(snakeFood([{ x: 0, y: 0 }], 1)).toBeNull();
  });
});
it("memory contains exactly two of every pair after shuffling", () => {
  const cards = shuffledPairs(8);
  expect(cards).toHaveLength(16);
  for (let i = 0; i < 8; i++)
    expect(cards.filter((c) => c === i)).toHaveLength(2);
});
