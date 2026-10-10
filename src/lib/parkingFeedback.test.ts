import { describe, expect, it } from "vitest";
import { parkingExitCells, parkingShortestPath } from "./parkingFeedback";
import { moveParking, parkingLevels } from "./actionGames";

describe("Estacionamento: assistente de percurso sem mudar a física", () => {
  it("finds legal shortest routes to the goal for all three levels", () => {
    for (const level of parkingLevels) {
      const route=parkingShortestPath(level.start,level.goal,level.walls);
      expect(route).not.toBeNull();
      expect(route![0]).toBe(level.start);
      expect(route!.at(-1)).toBe(level.goal);
      for (let i=1;i<route!.length;i++) {
        expect(level.walls).not.toContain(route![i]);
        expect(["up","down","left","right"].some(d =>
          moveParking(route![i-1],d as "up"|"down"|"left"|"right",level.walls)===route![i]
        )).toBe(true);
      }
      expect(new Set(route).size).toBe(route!.length);
    }
  });
  it("stops at destination and refuses unreachable cells", () => {
    expect(parkingShortestPath(5,5,[])).toEqual([5]);
    expect(parkingShortestPath(0,35,[1,6])).toBeNull();
    expect(parkingShortestPath(0,1,[1])).toBeNull();
  });
  it("highlights only legal neighboring tiles with no row-wrap", () => {
    expect(parkingExitCells(0,[])).toEqual([1,6]);
    expect(parkingExitCells(5,[])).toEqual([4,11]);
    expect(parkingExitCells(30,parkingLevels[0].walls)).toEqual([24,31]);
    expect(parkingExitCells(0,[1,6])).toEqual([]);
  });
});
