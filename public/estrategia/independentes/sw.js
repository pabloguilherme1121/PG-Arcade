const CACHE = "pg-estrategia-originais-shell-v16";
const ROOT = new URL("./", self.registration.scope);
const FILES = ["./", "./index.html", "./app.js", "./pg-bot.mjs", "./style.css", "./naval.mjs", "./siege.mjs", "./hex.mjs", "./squad.mjs", "./towers.mjs", "./frontier.mjs", "./winter.mjs", "./draughts.mjs", "./market.mjs", "./manifest.webmanifest"];
const MARKET_PATH = new URL("mercado-de-rotas/", ROOT).pathname;
const COUNCIL_PATH = new URL("conselho-de-reinos/", ROOT).pathname;
const REVERSI_PATH = new URL("reversi-tatico/", ROOT).pathname;
const CIPHER_PATH = new URL("cifras-reais/", ROOT).pathname;
const DRONES_PATH = new URL("comando-de-drones/", ROOT).pathname;
const WORKSHOP_PATH = new URL("oficina-automatos/", ROOT).pathname;
const TRAFFIC_PATH = new URL("controle-trafego/", ROOT).pathname;
const APPROVED = new Set(FILES.map(file => new URL(file, ROOT).pathname));

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith("pg-estrategia-originais-") && key !== CACHE)
      .map(key => caches.delete(key)),
  )).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(ROOT.pathname)) return;
  // This game owns a distinct offline shell. Never serve the catalog HTML for its URL.
  if (url.pathname.startsWith(MARKET_PATH) || url.pathname.startsWith(COUNCIL_PATH) || url.pathname.startsWith(REVERSI_PATH) || url.pathname.startsWith(CIPHER_PATH) || url.pathname.startsWith(DRONES_PATH) || url.pathname.startsWith(WORKSHOP_PATH) || url.pathname.startsWith(TRAFFIC_PATH)) return;
  if (request.mode !== "navigate" && !APPROVED.has(url.pathname)) return;
  event.respondWith((async () => {
    const key = request.mode === "navigate" ? new URL("index.html", ROOT).href : request;
    try {
      const response = await fetch(request);
      if (response.ok) {
        try {
          const cache = await caches.open(CACHE);
          await cache.put(key, response.clone());
        } catch { /* browsing online must still work when storage is full */ }
      }
      return response;
    } catch {
      try { return await caches.match(key) || Response.error(); }
      catch { return Response.error(); }
    }
  })());
});
