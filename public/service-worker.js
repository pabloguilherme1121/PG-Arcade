const CACHE = "pg-arcade-2026-10-05-v2";
const ROOT = new URL("./", self.registration.scope).href;
const MAX_RUNTIME_ENTRIES = 120;

async function trimRuntimeCache(cache) {
  const requests = (await cache.keys()).filter(
    (request) => request.url !== ROOT,
  );
  const overflow = requests.length - MAX_RUNTIME_ENTRIES;
  if (overflow <= 0) return;
  await Promise.all(
    requests.slice(0, overflow).map((request) => cache.delete(request)),
  );
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
        .then(async (response) => {
          if (response.ok) {
            const cache = await caches.open(CACHE);
            await cache.put(ROOT, response.clone());
          }
          return response;
        })
        .catch(async () => (await caches.match(ROOT)) || Response.error()),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(async (cached) => {
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(CACHE);
        await cache.put(request, response.clone());
        await trimRuntimeCache(cache);
      }
      return response;
    }),
  );
});
