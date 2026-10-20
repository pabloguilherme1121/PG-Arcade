import { CATALOG_SIZE } from "../src/lib/catalogRelease.ts";
import assert from "node:assert/strict";
import test from "node:test";
import { summarizePerformance } from "./summarize-performance.mjs";

const fixture = (version = "156.0", p95 = 200) => ({
  metadata: { browserVersion: version, browser: "chromium", profile: "emulated-cpu-4x", samples: 3 },
  catalog: { cardCount: CATALOG_SIZE },
  catalogViewportSummary: {
    "320": { cardCount: CATALOG_SIZE, samplesWithOverflow: 0, twoFrameScrollP95Ms: { p50: p95 }, longTaskTotalMs: { p50: 638 } },
    "390": { cardCount: CATALOG_SIZE, samplesWithOverflow: 0, twoFrameScrollP95Ms: { p50: p95 }, longTaskTotalMs: { p50: 798 } },
  },
});

test("reports all 103 cards and comparable results when Chromium profile matches", () => {
  const report = summarizePerformance(fixture(), fixture());
  assert.match(report.markdown, new RegExp(CATALOG_SIZE + " cartões"));
  assert.match(report.markdown, /320/);
  assert.match(report.markdown, /390/);
  assert.equal(report.comparable, true);
  assert.deepEqual(report.warnings, []);
});

test("does not claim performance regression across browser versions", () => {
  const report = summarizePerformance(fixture("157.0", 900), fixture("156.0"));
  assert.equal(report.comparable, false);
  assert.deepEqual(report.warnings, []);
  assert.match(report.markdown, /não comparáveis/);
});

test("flags only a measured significant regression on the same environment", () => {
  const report = summarizePerformance(fixture("156.0", 260), fixture("156.0", 200));
  assert.equal(report.comparable, true);
  assert.equal(report.warnings.length, 2);
  assert.match(report.markdown, /Investigar/);
});

test("rejects removed or duplicated catalog counts and horizontal overflow", () => {
  const tooFew = fixture();
  tooFew.catalog.cardCount = CATALOG_SIZE - 1;
  assert.throws(() => summarizePerformance(tooFew, fixture()), new RegExp(String(CATALOG_SIZE)));
  const overflow = fixture();
  overflow.catalogViewportSummary["320"].samplesWithOverflow = 1;
  assert.throws(() => summarizePerformance(overflow, fixture()), /overflow/);
});

test("rejects absent or malformed viewport metrics", () => {
  const missing = fixture();
  delete missing.catalogViewportSummary["390"];
  assert.throws(() => summarizePerformance(missing, fixture()), /390/);
});

test("does not compare catalogs with different amounts of content", () => {
  const baseline = fixture();
  baseline.catalog.cardCount = CATALOG_SIZE - 1;
  baseline.catalogViewportSummary["320"].cardCount = CATALOG_SIZE - 1;
  baseline.catalogViewportSummary["390"].cardCount = CATALOG_SIZE - 1;
  const report = summarizePerformance(fixture(), baseline);
  assert.equal(report.comparable, false);
  assert.deepEqual(report.warnings, []);
});
