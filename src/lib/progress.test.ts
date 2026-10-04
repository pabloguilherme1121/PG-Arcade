import { it, expect } from "vitest";
import { normalizeProgress } from "./progress";
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
