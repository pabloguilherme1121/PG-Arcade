import { it, expect } from "vitest";
import { normalizeProgress, mergeProgress } from "./progress";
it("restores backups without losing better records or duplicating visits", () => {
  const current = normalizeProgress({
    favorites: ["snake"],
    records: { snake: 20, memoria: 12 },
    visits: { snake: 4 },
    last: "snake",
  });
  const result = mergeProgress(current, {
    favorites: ["snake", "palavra"],
    records: { snake: 10, memoria: 8, palavra: 500, evil: 100 },
    visits: { snake: 3 },
    last: "palavra",
  });
  expect(result.records).toEqual({ snake: 20, memoria: 8, palavra: 500 });
  expect(result.visits.snake).toBe(4);
  expect(result.favorites).toEqual(["snake", "palavra"]);
  expect(result.last).toBe("snake");
});
it("ignores unknown games, duplicate favorites and invalid records", () => {
  expect(
    normalizeProgress({
      favorites: ["snake", "snake", "evil"],
      visits: { snake: 3.5, foo: 9 },
      records: { "2048": Infinity, snake: -2, memoria: 24 },
      last: "foo",
    }),
  ).toEqual({
    favorites: ["snake"],
    visits: { snake: 3 },
    records: { memoria: 24 },
    last: null,
  });
});
it("accepts missing and malformed data without crashing", () => {
  expect(normalizeProgress(null).favorites).toEqual([]);
  expect(normalizeProgress({ favorites: "snake", records: 0 }).records).toEqual(
    {},
  );
});
