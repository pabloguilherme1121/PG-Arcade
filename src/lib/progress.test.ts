import { it, expect } from "vitest";
import { normalizeProgress, mergeProgress, emptyProgress } from "./progress";
it("does not count imported records as visits or visits as records", () => {
  const result = mergeProgress(emptyProgress(), {
    records: { snake: 20 },
    visits: { palavra: 3 },
  });
  expect(result.visits).toEqual({ palavra: 3 });
  expect(result.records).toEqual({ snake: 20 });
});
it("discards zero results that do not represent explored games or records", () => {
  expect(normalizeProgress({ visits: { snake: 0, palavra: 0.5 }, records: { memoria: 0 } }))
    .toEqual(emptyProgress());
});
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
