import { readFileSync } from "node:fs";
import vm from "node:vm";
import { describe, expect, it } from "vitest";

const workerSource = readFileSync("public/service-worker.js", "utf8");
const scope = "https://example.test/PG-Arcade/";
const root = scope;

type FetchEventHarness = {
  request: Request;
  respondWith(promise: Promise<Response> | Response): void;
  waitUntil(promise: Promise<unknown>): void;
  response?: Promise<Response>;
  background: Promise<unknown>[];
};

function createHarness(blockedPutUrl?: string) {
  const entries = new Map<string, Response>();
  const network = new Map<string, Response>();
  const handlers = new Map<string, (event: FetchEventHarness) => void>();
  const background: Promise<unknown>[] = [];
  let releasePut: (() => void) | undefined;
  const putGate = blockedPutUrl
    ? new Promise<void>((resolve) => {
        releasePut = resolve;
      })
    : Promise.resolve();

  const normalize = (request: Request | string) =>
    typeof request === "string" ? request : request.url;

  const cache = {
    async keys() {
      return [...entries.keys()].map((url) => new Request(url));
    },
    async match(request: Request | string) {
      return entries.get(normalize(request))?.clone();
    },
    async put(request: Request | string, response: Response) {
      const url = normalize(request);
      if (url === blockedPutUrl) await putGate;
      entries.set(url, response.clone());
    },
    async delete(request: Request | string) {
      return entries.delete(normalize(request));
    },
    async add(request: Request | string) {
      entries.set(normalize(request), new Response("cached"));
    },
  };

  const context = vm.createContext({
    URL,
    Request,
    Response,
    Promise,
    Set,
    console,
    fetch: async (request: Request | string) =>
      network.get(normalize(request))?.clone() || new Response(normalize(request) === root
        ? '<script type="module" src="./assets/index.js"></script><link rel="stylesheet" href="./assets/index.css"><link rel="modulepreload" href="./assets/vendor.js"><link rel="icon" href="./icon.svg">'
        : `network:${normalize(request)}`, {
        status: 200,
        headers: { "content-type": "application/javascript" },
      }),
    caches: {
      async open() {
        return cache;
      },
      async keys() {
        return ["pg-arcade-2026-10-05-v2"];
      },
      async delete() {
        return true;
      },
      async match(request: Request | string) {
        return cache.match(request);
      },
    },
    self: {
      registration: { scope },
      location: { origin: new URL(scope).origin },
      clients: { claim: async () => undefined },
      skipWaiting: async () => undefined,
      addEventListener(type: string, handler: (event: FetchEventHarness) => void) {
        handlers.set(type, handler);
      },
    },
  });

  vm.runInContext(workerSource, context);

  return {
    entries,
    network,
    async install() {
      const pending: Promise<unknown>[] = [];
      handlers.get("install")?.({
        waitUntil(promise: Promise<unknown>) { pending.push(promise); },
      } as FetchEventHarness);
      await Promise.all(pending);
    },
    seed(url: string, body: string, contentType = "application/octet-stream") {
      entries.set(
        url,
        new Response(body, { headers: { "content-type": contentType } }),
      );
    },
    dispatchFetch(url: string, mode?: string) {
      const request = new Request(url);
      if (mode) Object.defineProperty(request, "mode", { value: mode });
      const event: FetchEventHarness = {
        request,
        respondWith(promise) {
          event.response = Promise.resolve(promise);
        },
        waitUntil(promise) {
          background.push(Promise.resolve(promise));
        },
        background,
      };
      handlers.get("fetch")?.(event);
      const response = event.response;
      if (!response) throw new Error("service worker did not respond");
      return { ...event, response };
    },
    releasePut() {
      releasePut?.();
    },
  };
}

describe("service worker runtime cache policy", () => {
  it("protects a pending update from concurrent runtime eviction and trims after commit", async () => {
    const nextAsset = new URL("./assets/index-next.js", root).href;
    const nextVendor = new URL("./assets/vendor-next.js", root).href;
    const harness = createHarness(nextAsset);
    await harness.install();
    for (let index = 0; index < 120; index += 1)
      harness.seed(new URL(`./assets/runtime-${index}.js`, root).href, "chunk");
    harness.network.set(root, new Response('<script type="module" src="./assets/index-next.js"></script><link rel="modulepreload" href="./assets/vendor-next.js">'));
    const navigation = harness.dispatchFetch(root, "navigate");
    await navigation.response;
    await expect.poll(() => harness.entries.has(nextVendor)).toBe(true);
    for (let index = 0; index < 130; index += 1) {
      const runtime = harness.dispatchFetch(new URL(`./assets/fresh-${index}.js`, root).href);
      await runtime.response;
      await runtime.background.at(-1);
    }
    expect(harness.entries.has(nextVendor)).toBe(true);
    harness.releasePut();
    await Promise.all(navigation.background);
    expect(harness.entries.has(nextAsset)).toBe(true);
    expect(harness.entries.size).toBeLessThanOrEqual(123);
  });
  it("evicts obsolete entry bundles while preserving the committed offline shell", async () => {
    const harness = createHarness();
    await harness.install();
    for (let index = 0; index < 130; index += 1) {
      harness.seed(new URL(`./assets/index-old-${index}.js`, root).href, "obsolete");
    }
    const event = harness.dispatchFetch(new URL("./assets/fresh.js", root).href);
    await event.response;
    await Promise.all(event.background);
    expect(harness.entries.size).toBeLessThanOrEqual(124);
    expect(harness.entries.has(new URL("./assets/index.js", root).href)).toBe(true);
    expect(harness.entries.has(new URL("./assets/index.css", root).href)).toBe(true);
    expect(harness.entries.has(new URL("./assets/vendor.js", root).href)).toBe(true);
    expect(harness.entries.has(new URL("./assets/index-old-0.js", root).href)).toBe(false);
  });
  it("keeps the old offline HTML when a new navigation shell asset fails", async () => {
    const harness = createHarness();
    harness.seed(root, "old HTML", "text/html");
    const nextAsset = new URL("./assets/index-next.js", root).href;
    harness.network.set(root, new Response('<script type="module" src="./assets/index-next.js"></script>'));
    harness.network.set(nextAsset, new Response("missing", { status: 404 }));
    const event = harness.dispatchFetch(root, "navigate");
    expect(await (await event.response).text()).toContain("index-next.js");
    await Promise.all(event.background);
    expect(await harness.entries.get(root)?.text()).toBe("old HTML");
  });

  it("returns new navigation HTML promptly and commits it only after its shell assets", async () => {
    const nextAsset = new URL("./assets/index-next.js", root).href;
    const harness = createHarness(nextAsset);
    harness.seed(root, "old HTML", "text/html");
    const nextHtml = '<script type="module" src="./assets/index-next.js"></script><link rel="modulepreload" href="./assets/vendor-next.js">';
    harness.network.set(root, new Response(nextHtml));
    const event = harness.dispatchFetch(root, "navigate");
    expect(await (await event.response).text()).toBe(nextHtml);
    expect(await harness.entries.get(root)?.clone().text()).toBe("old HTML");
    harness.releasePut();
    await Promise.all(event.background);
    expect(await harness.entries.get(root)?.text()).toBe(nextHtml);
    expect(harness.entries.has(nextAsset)).toBe(true);
    expect(harness.entries.has(new URL("./assets/vendor-next.js", root).href)).toBe(true);
  });
  it("installs the complete initial shell before controlling the first visit", async () => {
    const harness = createHarness();
    await harness.install();
    expect([...harness.entries.keys()]).toEqual(expect.arrayContaining([
      root, new URL("./assets/index.js", root).href,
      new URL("./assets/index.css", root).href,
      new URL("./assets/vendor.js", root).href,
    ]));
    expect(harness.entries.has(new URL("./icon.svg", root).href)).toBe(false);
  });
  it("keeps the root shell assets while limiting non-shell runtime entries to 120", async () => {
    const harness = createHarness();
    const appJs = new URL("./assets/index.js", root).href;
    const appCss = new URL("./assets/index.css", root).href;
    const sharedModule = new URL("./assets/jsx-runtime.js", root).href;

    harness.seed(
      root,
      '<!doctype html><link rel="stylesheet" href="./assets/index.css"><script type="module" src="./assets/index.js"></script><link rel="modulepreload" href="./assets/jsx-runtime.js">',
      "text/html",
    );
    harness.seed(appJs, "app", "application/javascript");
    harness.seed(appCss, "css", "text/css");
    harness.seed(sharedModule, "module", "application/javascript");

    for (let index = 0; index < 120; index += 1) {
      harness.seed(new URL(`./assets/runtime-${index}.js`, root).href, "chunk");
    }

    const event = harness.dispatchFetch(
      new URL("./assets/runtime-new.js", root).href,
    );
    await event.response;
    await Promise.all(event.background);

    expect(harness.entries.has(root)).toBe(true);
    expect(harness.entries.has(appJs)).toBe(true);
    expect(harness.entries.has(appCss)).toBe(true);
    expect(harness.entries.has(sharedModule)).toBe(true);
    expect(
      harness.entries.has(new URL("./assets/runtime-new.js", root).href),
    ).toBe(true);

    const protectedUrls = new Set([root, appJs, appCss, sharedModule]);
    const runtimeCount = [...harness.entries.keys()].filter(
      (url) => !protectedUrls.has(url),
    ).length;
    expect(runtimeCount).toBeLessThanOrEqual(120);
  });

  it("returns a network response before a slow cache write completes", async () => {
    const assetUrl = new URL("./assets/slow.js", root).href;
    const harness = createHarness(assetUrl);
    harness.seed(
      root,
      '<!doctype html><script type="module" src="./assets/index.js"></script>',
      "text/html",
    );

    const event = harness.dispatchFetch(assetUrl);
    const responseWonRace = await Promise.race([
      event.response.then(() => true),
      new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 50)),
    ]);

    expect(responseWonRace).toBe(true);

    harness.releasePut();
    await event.response;
    await Promise.all(event.background);
  });
});
