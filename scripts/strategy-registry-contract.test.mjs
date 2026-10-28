import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { verifyStrategyRegistry } from './strategy-registry.mjs';

const registry = JSON.parse(readFileSync('docs/strategy-verified-registry.json', 'utf8'));

// Metadata is an accounting gate. It does not replace the game's E2E and design review.
test('mission variations and reused engines never increase the audited count', () => {
  const progress = verifyStrategyRegistry(registry);
  assert.equal(progress.target, 150);
  assert.equal(progress.certified + progress.remaining, 150);
  assert.equal(progress.candidates + progress.certified, registry.entries.length);
  for (const mutation of [
    { ...registry.entries[0], id: 'est-003', engine: 'public/estrategia/independentes/dummy.mjs' },
    { ...registry.entries[0], id: 'copy', primaryMechanic: 'different-mechanic' },
    { ...registry.entries[0], id: 'copy', engine: 'public/estrategia/independentes/siege.mjs' },
    { ...registry.entries[0], id: 'copy', engine: 'public/estrategia/independentes/dummy.mjs', primaryMechanic: registry.entries[0].primaryMechanic },
    { ...registry.entries[0], id: 'copy', engine: 'public/estrategia/independentes/dummy.mjs', primaryMechanic: 'different-mechanic', status: 'certified' },
  ]) {
    assert.throws(() => verifyStrategyRegistry({ ...registry, entries: [...registry.entries, mutation] }));
  }
});

test('each registered game exposes deterministic playable factories at all difficulty levels', async () => {
  verifyStrategyRegistry(registry);
  for (const game of registry.entries) {
    const engine = await import(pathToFileURL(resolve(game.engine)).href);
    assert.equal(typeof engine[game.factory], 'function', `${game.id}: missing factory`);
    assert.equal(typeof engine[game.transition], 'function', `${game.id}: missing transition`);
    for (const difficulty of game.difficulty) {
      const first = engine[game.factory]({ difficulty, seed: 101 });
      const second = engine[game.factory]({ difficulty, seed: 101 });
      assert.deepEqual(first, second, `${game.id}: nondeterministic startup`);
      assert.equal(first.id, game.id);
      assert.equal(first.phase, 'playing');
      assert.equal(first.mode, difficulty);
      assert.equal(engine[game.transition](first, { type: '__invalid__' })?.phase, 'playing');
    }
  }
});
