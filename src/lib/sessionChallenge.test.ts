import { expect, it } from "vitest";
import { improvedSessionRecords, improvedGeneralRecord } from "./sessionChallenge";

it("reports fewer moves as an improvement, keeping games and sessions separate", () => {
  const before = { "puzzle|sprint-normal|12": 10, "puzzle|sprint-normal|40": 20 };
  const after = { ...before, "puzzle|sprint-normal|12": 8, "puzzle|sprint-normal|100": 30, "puzzle|free|12": 4, "memoria|sprint-normal|4-900": 5 };
  expect(improvedSessionRecords("puzzle", "sprint-normal", before, after)).toBe(2);
  expect(improvedGeneralRecord("puzzle", 10, 8)).toBe(true);
  expect(improvedGeneralRecord("memoria", 8, 10)).toBe(false);
  expect(improvedGeneralRecord("memoria", 0, 8)).toBe(true);
  expect(improvedGeneralRecord("snake", 10, 8)).toBe(false);
  expect(improvedGeneralRecord("snake", 8, 10)).toBe(true);
  expect(improvedGeneralRecord("puzzle", 8, 0)).toBe(false);
});
