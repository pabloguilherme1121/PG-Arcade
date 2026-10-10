import { describe, expect, it } from "vitest";
import { puzzleManhattanDistance, puzzleInPlaceCount } from "./puzzleFeedback";

describe("Quebra-cabeça premium: progresso sem alterar regras", () => {
  it("returns a solved distance of zero and eight positioned tiles", () => {
    expect(puzzleManhattanDistance([1,2,3,4,5,6,7,8,0])).toBe(0);
    expect(puzzleInPlaceCount([1,2,3,4,5,6,7,8,0])).toBe(8);
  });
  it("tracks how far tiles are from their positions and ignores the empty cell", () => {
    expect(puzzleManhattanDistance([1,2,3,4,5,6,7,0,8])).toBe(1);
    expect(puzzleInPlaceCount([1,2,3,4,5,6,7,0,8])).toBe(7);
    expect(puzzleManhattanDistance([1,2,3,4,0,6,7,5,8])).toBe(2);
    expect(puzzleInPlaceCount([1,2,3,4,0,6,7,5,8])).toBe(6);
  });
});
