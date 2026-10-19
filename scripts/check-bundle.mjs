import { gzipSync } from "node:zlib";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { calculateHeadroom, formatAssetBreakdown } from "./bundle-headroom.mjs";

const root = "dist/assets";
const assetLimits = { ".js": 450 * 1024, ".css": 250 * 1024 };
const initialLimits = { raw: 400 * 1024, gzip: 120 * 1024 };
const violations = [];

for (const file of readdirSync(root)) {
  const extension = Object.keys(assetLimits).find((ext) => file.endsWith(ext));
  if (!extension) continue;
  const bytes = statSync(join(root, file)).size;
  if (bytes > assetLimits[extension]) {
    violations.push(
      `${file}: ${(bytes / 1024).toFixed(1)} KiB > ${assetLimits[extension] / 1024} KiB`,
    );
  }
}

const html = readFileSync("dist/index.html", "utf8");
const initialAssets = [
  ...new Set(
    [...html.matchAll(/(?:src|href)="[^"]*\/assets\/([^"]+\.(?:js|css))"/g)].map(
      (match) => match[1],
    ),
  ),
];

if (!initialAssets.length) {
  violations.push("No initial JS/CSS assets were discovered in dist/index.html.");
}

let initialRaw = 0;
let initialGzip = 0;
const initialDetails = [];
for (const file of initialAssets) {
  const asset = readFileSync(join(root, file));
  const gzipBytes = gzipSync(asset).byteLength;
  initialRaw += asset.byteLength;
  initialGzip += gzipBytes;
  initialDetails.push({ name: file, raw: asset.byteLength, gzip: gzipBytes });
}

if (initialRaw > initialLimits.raw) {
  violations.push(
    `Initial JS/CSS payload: ${(initialRaw / 1024).toFixed(1)} KiB > ${initialLimits.raw / 1024} KiB raw`,
  );
}
if (initialGzip > initialLimits.gzip) {
  violations.push(
    `Initial JS/CSS payload: ${(initialGzip / 1024).toFixed(1)} KiB > ${initialLimits.gzip / 1024} KiB gzip`,
  );
}

console.log(
  `Initial JS/CSS payload: ${(initialRaw / 1024).toFixed(1)} KiB raw / ${(initialGzip / 1024).toFixed(1)} KiB gzip (${initialAssets.join(", ")})`,
);

console.log("Initial bundle assets, largest first:\n" + formatAssetBreakdown(initialDetails));

if (violations.length) {
  console.error("Bundle budget exceeded:\n" + violations.join("\n"));
  process.exit(1);
}
const margin = calculateHeadroom({ raw: initialRaw, gzip: initialGzip }, initialLimits);
console.log(`Bundle remaining: ${margin.headroomRawKiB} KiB raw / ${margin.headroomGzipKiB} KiB gzip.`);
if (margin.warnRaw || margin.warnGzip) {
  const message = `Less than 10 KiB remaining before one or both initial bundle limits. Investigate eager imports before adding runtime SDKs.`;
  if (process.env.GITHUB_ACTIONS === "true") {
    console.log(`::warning title=PG-Arcade bundle headroom::${message}`);
  } else {
    console.warn(message);
  }
}
console.log("Bundle budget OK.");
