import test from "node:test";
import assert from "node:assert/strict";
import { calculateHeadroom, formatAssetBreakdown } from "./bundle-headroom.mjs";

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

test("rejects exact strict raw or gzip limits, not only values above them", () => {
  const exactlyRaw = calculateHeadroom({ raw: LIMITS.raw, gzip: LIMITS.gzip - 1024 }, LIMITS);
  assert.equal(exactlyRaw.exceedsRaw, true);
  assert.equal(exactlyRaw.exceedsGzip, false);
  assert.equal(exactlyRaw.warnRaw, false);
  const exactlyGzip = calculateHeadroom({ raw: LIMITS.raw - 1024, gzip: LIMITS.gzip }, LIMITS);
  assert.equal(exactlyGzip.exceedsRaw, false);
  assert.equal(exactlyGzip.exceedsGzip, true);
  assert.equal(exactlyGzip.warnGzip, false);
});

test("ranks initial assets by bytes and includes gzip contributions", () => {
  const report = formatAssetBreakdown([
    { name: "small.css", raw: 2048, gzip: 600 },
    { name: "large.js", raw: 10240, gzip: 2048 },
    { name: "empty.css", raw: 0, gzip: 0 },
  ]);
  assert.match(report, /large\.js: 10\.0 KiB raw \/ 2\.0 KiB gzip/);
  assert.ok(report.indexOf("large.js") < report.indexOf("small.css"));
  assert.ok(report.indexOf("small.css") < report.indexOf("empty.css"));
});

test("rejects invalid entries in initial asset breakdown", () => {
  assert.throws(
    () => formatAssetBreakdown([{ name: "broken.js", raw: -1, gzip: 10 }]),
    /broken\.js/,
  );
});
