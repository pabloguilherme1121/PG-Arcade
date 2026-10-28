import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

test('PG Estratégia não altera o shell offline do Arcade', async () => {
  const source = readFileSync('public/service-worker.js', 'utf8');
  const handlers = new Map();
  const self = {
    registration: { scope: 'https://example.test/PG-Arcade/' },
    addEventListener(type, fn) { handlers.set(type, fn); },
  };
  runInNewContext(source, {
    self, URL, Set, Promise,
    caches: { match: async () => undefined },
    fetch: async () => ({ ok: false }),
    Response,
  });
  const onFetch = handlers.get('fetch');
  assert.equal(typeof onFetch, 'function');
  for (const suffix of ['estrategia/', 'estrategia/index.html', 'estrategia/app.js', 'estrategia/style.css']) {
    let intercepted = false;
    onFetch({
      request: { method: 'GET', url: `https://example.test/PG-Arcade/${suffix}`, mode: suffix.endsWith('.js') || suffix.endsWith('.css') ? 'cors' : 'navigate' },
      respondWith() { intercepted = true; },
      waitUntil() {},
    });
    assert.equal(intercepted, false, `Arcade root SW não deve capturar ${suffix}`);
  }
  let rootHandled = false;
  onFetch({ request: { method: 'GET', url: 'https://example.test/PG-Arcade/', mode: 'navigate' }, respondWith() { rootHandled = true; }, waitUntil() {} });
  assert.equal(rootHandled, true, 'O shell original ainda precisa de tratamento offline');
});
