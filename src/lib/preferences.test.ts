import { expect, it } from "vitest";
import { normalizePreferences } from "./preferences";
it("normalizes corrupted visual preferences without enabling unknown effects", () => {
  for (const raw of [null, [], 2, "x", { contrast: "true", motion: "fast" }])
    expect(normalizePreferences(raw)).toEqual({ contrast: false, motion: "system" });
  expect(normalizePreferences({ contrast: true, motion: "reduced" })).toEqual({ contrast: true, motion: "reduced" });
});
