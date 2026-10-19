import test from "node:test";
import assert from "node:assert/strict";
import { calculateHeadroom } from "./bundle-headroom.mjs";

const LIMITS = { raw: 400 * 1024, gzip: 120 * 1024 };

test("warns before bundle reaches raw and gzip limits", () => {
  const result = calculateHeadroom({ raw: 399.9 * 1024, gzip: 117.8 * 1024 }, LIMITS);
  assert.equal(result.warnRaw, true);
  assert.equal(result.warnGzip, true);
  assert.equal(result.headroomRawKiB, "0.1");
  assert.equal(result.headroomGzipKiB, "2.2");
});

test("does not warn when enough headroom remains", () => {
  const result = calculateHeadroom({ raw: 370 * 1024, gzip: 105 * 1024 }, LIMITS);
  assert.equal(result.warnRaw, false);
  assert.equal(result.warnGzip, false);
});

test("rejects malformed values and distinguishes over-budget from near-budget", () => {
  assert.throws(() => calculateHeadroom({ raw: NaN, gzip: 100 }, LIMITS), /raw/);
  const result = calculateHeadroom({ raw: 405 * 1024, gzip: 125 * 1024 }, LIMITS);
  assert.equal(result.warnRaw, false);
  assert.equal(result.warnGzip, false);
  assert.equal(result.exceedsRaw, true);
  assert.equal(result.exceedsGzip, true);
});
