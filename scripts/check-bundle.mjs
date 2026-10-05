import { gzipSync } from "node:zlib";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

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
for (const file of initialAssets) {
  const asset = readFileSync(join(root, file));
  initialRaw += asset.byteLength;
  initialGzip += gzipSync(asset).byteLength;
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

if (violations.length) {
  console.error("Bundle budget exceeded:\n" + violations.join("\n"));
  process.exit(1);
}
console.log("Bundle budget OK.");
