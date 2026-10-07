import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");

describe("production shell", () => {
  it("publishes accurate SEO and installable-app metadata", () => {
    const html = read("index.html");
    expect(html).toContain("100 jogos");
    expect(html).toContain('rel="canonical"');
    expect(html).toContain('rel="manifest"');
    expect(html).toContain('property="og:title"');

    const manifest = JSON.parse(read("public/manifest.webmanifest"));
    expect(manifest.name).toBe("PG Arcade");
    expect(manifest.start_url).toBe("./");
    expect(manifest.display).toBe("standalone");
    expect(manifest.icons.length).toBeGreaterThan(0);
  });

  it("ships a scoped service worker with explicit cache cleanup", () => {
    const worker = read("public/service-worker.js");
    expect(worker).toContain("pg-arcade-");
    expect(worker).toContain("caches.delete");
    expect(worker).toContain("request.mode === \"navigate\"");
    expect(worker).toContain("MAX_RUNTIME_ENTRIES");
    expect(worker).toContain("trimRuntimeCache");
    expect(worker).toContain("event.waitUntil(cacheRuntimeResponse");
  });
});
