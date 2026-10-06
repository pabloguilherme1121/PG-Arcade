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
    fetch: async (request: Request) =>
      new Response(`network:${request.url}`, {
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
    seed(url: string, body: string, contentType = "application/octet-stream") {
      entries.set(
        url,
        new Response(body, { headers: { "content-type": contentType } }),
      );
    },
    dispatchFetch(url: string) {
      const event: FetchEventHarness = {
        request: new Request(url),
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
  it("keeps the root shell assets while limiting non-shell runtime entries to 120", async () => {
    const harness = createHarness();
    const appJs = new URL("./assets/index.js", root).href;
    const appCss = new URL("./assets/index.css", root).href;

    harness.seed(
      root,
      '<!doctype html><link rel="stylesheet" href="./assets/index.css"><script type="module" src="./assets/index.js"></script>',
      "text/html",
    );
    harness.seed(appJs, "app", "application/javascript");
    harness.seed(appCss, "css", "text/css");

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
    expect(
      harness.entries.has(new URL("./assets/runtime-new.js", root).href),
    ).toBe(true);

    const protectedUrls = new Set([root, appJs, appCss]);
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
