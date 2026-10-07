const CACHE = "pg-arcade-2026-10-07-v5";
const ROOT = new URL("./", self.registration.scope).href;
const MAX_RUNTIME_ENTRIES = 120;
const pendingShells = new Set();
let shellGeneration = 0;
let committedGeneration = 0;
let shellCommit = Promise.resolve();

function discoverShell(html) {
  const assets = new Set();
  for (const tag of html.match(/<(?:script|link)\b[^>]*>/gi) || []) {
    if (!/\btype\s*=\s*["']module["']/i.test(tag) &&
        !/\brel\s*=\s*["'](?:stylesheet|modulepreload)["']/i.test(tag)) continue;
    const path = tag.match(/\b(?:src|href)\s*=\s*["']([^"']+)["']/i)?.[1];
    if (!path) continue;
    const url = new URL(path, ROOT);
    if (url.href.startsWith(ROOT)) assets.add(url.href);
  }
  return assets;
}

async function cacheShell(response) {
  const generation = ++shellGeneration;
  const cache = await caches.open(CACHE);
  if (!response.ok) throw new Error("Unable to load the arcade shell");
  const assets = discoverShell(await response.clone().text());
  pendingShells.add(assets);
  try {
    const writes = await Promise.allSettled([...assets].map(async (url) => {
      const asset = await fetch(url, { cache: "reload" });
      if (!asset.ok) throw new Error("Unable to load a shell asset");
      await cache.put(url, asset);
    }));
    const failed = writes.find((write) => write.status === "rejected");
    if (failed) throw failed.reason;
    // Serialize HTML writes so a slow older navigation cannot roll back a
    // newer successful shell. A failed update still leaves the last good one.
    const commit = shellCommit.then(async () => {
      if (generation < committedGeneration) return;
      await cache.put(ROOT, response);
      committedGeneration = generation;
    });
    shellCommit = commit.catch(() => undefined);
    await commit;
  } finally {
    pendingShells.delete(assets);
    await trimRuntimeCache(cache);
  }
}

async function installShell() {
  await cacheShell(await fetch(ROOT, { cache: "reload" }));
  await self.skipWaiting();
}

async function trimRuntimeCache(cache) {
  const shell = await cache.match(ROOT);
  // Only the committed HTML defines the protected shell. Old hashed entry
  // bundles and assets from failed updates must still count toward the limit.
  const shellUrls = new Set([ROOT, ...(shell ? discoverShell(await shell.text()) : [])]);
  // Runtime requests can finish while an update is still writing its assets.
  for (const assets of pendingShells)
    for (const url of assets) shellUrls.add(url);
  const requests = (await cache.keys()).filter(
    (request) => !shellUrls.has(request.url),
  );
  const overflow = requests.length - MAX_RUNTIME_ENTRIES;
  if (overflow <= 0) return;
  await Promise.all(
    requests.slice(0, overflow).map((request) => cache.delete(request)),
  );
}

async function cacheRuntimeResponse(request, response) {
  const cache = await caches.open(CACHE);
  await cache.put(request, response);
  await trimRuntimeCache(cache);
}

self.addEventListener("install", (event) => {
  event.waitUntil(installShell());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("pg-arcade-") && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || !url.href.startsWith(ROOT)) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            event.waitUntil(
              cacheShell(copy).catch(() => undefined),
            );
          }
          return response;
        })
        .catch(async () => (await caches.match(ROOT)) || Response.error()),
    );
    return;
  }

  event.respondWith(
    // Public build assets are identical for every Origin header. Preview servers
    // emit Vary: Origin, while module requests add Origin after shell precaching.
    caches.match(request, {
      ignoreVary: url.href.startsWith(new URL("assets/", ROOT).href),
    }).catch(() => undefined).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            event.waitUntil(cacheRuntimeResponse(request, response.clone()).catch(() => undefined));
          }
          return response;
        }),
    ),
  );
});
