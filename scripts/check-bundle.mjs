import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = "dist/assets";
const limits = { ".js": 450 * 1024, ".css": 250 * 1024 };
const oversized = [];

for (const file of readdirSync(root)) {
  const extension = Object.keys(limits).find((ext) => file.endsWith(ext));
  if (!extension) continue;
  const bytes = statSync(join(root, file)).size;
  if (bytes > limits[extension]) {
    oversized.push(
      `${file}: ${(bytes / 1024).toFixed(1)} KiB > ${limits[extension] / 1024} KiB`,
    );
  }
}

if (oversized.length) {
  console.error("Bundle budget exceeded:\n" + oversized.join("\n"));
  process.exit(1);
}
console.log("Bundle budget OK.");
