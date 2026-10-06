const CACHE = "pg-arcade-2026-10-05-v2";
const ROOT = new URL("./", self.registration.scope).href;
const MAX_RUNTIME_ENTRIES = 120;
const SHELL_REFERENCE_PATTERN = /\b(?:src|href)=["']([^"']+)["']/g;

async function getProtectedShellUrls(cache) {
  const protectedUrls = new Set([ROOT]);
  const shell = await cache.match(ROOT);
  if (!shell) return protectedUrls;

  const html = await shell.clone().text();
  for (const match of html.matchAll(SHELL_REFERENCE_PATTERN)) {
    const reference = match[1];
    if (!reference) continue;

    try {
      const url = new URL(reference, ROOT);
      if (url.origin === self.location.origin) {
        protectedUrls.add(url.href);
      }
    } catch {
      // Ignore malformed optional references in the generated shell.
    }
  }

  return protectedUrls;
}

async function trimRuntimeCache(cache) {
  const protectedUrls = await getProtectedShellUrls(cache);
  const requests = (await cache.keys()).filter(
    (request) => request.url !== ROOT && !protectedUrls.has(request.url),
  );
  const overflow = requests.length - MAX_RUNTIME_ENTRIES;
  if (overflow <= 0) return;

  await Promise.all(
    requests.slice(0, overflow).map((request) => cache.delete(request)),
  );
}

async function cacheRuntimeResponse(request, response) {
  if (!response.ok) return;
  const cache = await caches.open(CACHE);
  await cache.put(request, response.clone());
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
    const navigation = fetch(request)
      .then((response) => ({ response, cacheable: response.ok }))
      .catch(async () => ({
        response: (await caches.match(ROOT)) || Response.error(),
        cacheable: false,
      }));

    event.respondWith(navigation.then(({ response }) => response));
    event.waitUntil(
      navigation.then(async ({ response, cacheable }) => {
        if (!cacheable) return;
        const cache = await caches.open(CACHE);
        await cache.put(ROOT, response.clone());
      }),
    );
    return;
  }

  const asset = caches.match(request).then(async (cached) => {
    if (cached) return { response: cached, cacheable: false };
    const response = await fetch(request);
    return { response, cacheable: response.ok };
  });

  event.respondWith(asset.then(({ response }) => response));
  event.waitUntil(
    asset.then(({ response, cacheable }) =>
      cacheable ? cacheRuntimeResponse(request, response) : undefined,
    ),
  );
});
