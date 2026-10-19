// This is a diagnostic warning only; the original bundle hard limits remain unchanged.
export function calculateHeadroom(
  { raw, gzip },
  limits = { raw: 400 * 1024, gzip: 120 * 1024 },
  thresholdBytes = 10 * 1024,
) {
  for (const [label, bytes] of Object.entries({ raw, gzip, limitRaw: limits.raw, limitGzip: limits.gzip })) {
    if (!Number.isFinite(bytes) || bytes < 0) throw new Error(`Invalid bundle size: ${label}`);
  }
  const rawLeft = limits.raw - raw;
  const gzipLeft = limits.gzip - gzip;
  return {
    headroomRawKiB: (rawLeft / 1024).toFixed(1),
    headroomGzipKiB: (gzipLeft / 1024).toFixed(1),
    exceedsRaw: rawLeft < 0,
    exceedsGzip: gzipLeft < 0,
    warnRaw: rawLeft >= 0 && rawLeft < thresholdBytes,
    warnGzip: gzipLeft >= 0 && gzipLeft < thresholdBytes,
  };
}

/** Diagnostic breakdown of the initial HTML assets, sorted by raw bytes. */
export function formatAssetBreakdown(entries) {
  return [...entries].sort((a, b) => b.raw - a.raw || a.name.localeCompare(b.name)).map(({ name, raw, gzip }) => {
    if (!name || !Number.isFinite(raw) || raw < 0 || !Number.isFinite(gzip) || gzip < 0) {
      throw new Error(`Invalid initial asset: \${name || "unnamed"}`);
    }
    return `\${name}: \${(raw / 1024).toFixed(1)} KiB raw / \${(gzip / 1024).toFixed(1)} KiB gzip`;
  }).join("\\n");
}
