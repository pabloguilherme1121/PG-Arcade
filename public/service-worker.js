const CACHE = "pg-arcade-2026-10-05-v2";
const ROOT = new URL("./", self.registration.scope).href;
const MAX_RUNTIME_ENTRIES = 120;

function isShellRequest(request) {
  if (request.url === ROOT) return true;
  const url = new URL(request.url);
  return /\/assets\/index(?:-[^/]+)?\.(?:js|css)$/.test(url.pathname);
}

async function trimRuntimeCache(cache) {
  const requests = (await cache.keys()).filter(
    (request) => !isShellRequest(request),
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
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.add(ROOT))
      .then(() => self.skipWaiting()),
  );
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
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            event.waitUntil(
              caches.open(CACHE).then((cache) => cache.put(ROOT, copy)),
            );
          }
          return response;
        })
        .catch(async () => (await caches.match(ROOT)) || Response.error()),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            event.waitUntil(cacheRuntimeResponse(request, response.clone()));
          }
          return response;
        }),
    ),
  );
});
