import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
const statuses = new Set(['candidate', 'certified']);
const slug = /^[a-z][a-z0-9-]*$/;
const pathPattern = /^(?:public\/estrategia\/independentes|scripts|e2e)\/[a-zA-Z0-9_./-]+$/;
export function verifyStrategyRegistry(data, root = process.cwd()) {
  if (data?.target !== 150 || !Array.isArray(data.entries) || data.entries.length > 150)
    throw Error('Strategy registry must target 150 independently audited titles');
  const ids = new Set(), engines = new Set(), mechanics = new Set();
  let certified = 0;
  for (const game of data.entries) {
    if (!game || !slug.test(game.id) || /^est-\d+$/.test(game.id)) throw Error('Campaign mission is not an independent game');
    if (ids.has(game.id)) throw Error(`Duplicated game ID: ${game.id}`);
    if (engines.has(game.engine)) throw Error(`Reused game engine: ${game.engine}`);
    if (!slug.test(game.primaryMechanic) || mechanics.has(game.primaryMechanic)) throw Error(`Reused/invalid primary mechanic: ${game.id}`);
    ids.add(game.id); engines.add(game.engine); mechanics.add(game.primaryMechanic);
    if (!statuses.has(game.status)) throw Error(`Invalid certification status: ${game.id}`);
    if (typeof game.title !== 'string' || game.title.trim().length < 4) throw Error(`Missing title: ${game.id}`);
    if (!Array.isArray(game.difficulty) || game.difficulty.length < 2 || new Set(game.difficulty).size !== game.difficulty.length)
      throw Error(`Independent difficulty required: ${game.id}`);
    if (!Array.isArray(game.playModes) || !game.playModes.includes('solo') || new Set(game.playModes).size !== game.playModes.length)
      throw Error(`Gameplay modes required: ${game.id}`);
    for (const key of ['engine', 'unitTest', 'browserTest']) {
      const path = game[key];
      if (typeof path !== 'string' || !pathPattern.test(path) || path.includes('..') || !existsSync(resolve(root, path)))
        throw Error(`Missing or unsafe ${key}: ${game.id}`);
    }
    if (!game.engine.startsWith('public/estrategia/independentes/') || !game.engine.endsWith('.mjs'))
      throw Error(`Engine must belong to independent library: ${game.id}`);
    if (!game.unitTest.endsWith('.test.mjs') || !game.browserTest.endsWith('.spec.ts')) throw Error(`Test contracts missing: ${game.id}`);
    if (!/^[A-Za-z][A-Za-z0-9]*$/.test(game.factory) || !/^[A-Za-z][A-Za-z0-9]*$/.test(game.transition))
      throw Error(`Factory/transition not named: ${game.id}`);
    if (game.status === 'certified') {
      const proof = game.certification;
      if (game.playModes.length < 2 || !proof || proof.reviewed !== true || !/^[a-f0-9]{40}$/.test(proof.commit) || proof.unitQA !== 'passed' || proof.browserQA !== 'passed')
        throw Error(`Unverified independent game: ${game.id}`);
      certified++;
    } else if (game.certification !== null) throw Error(`Candidate must not claim evidence: ${game.id}`);
  }
  return Object.freeze({ target: data.target, candidates: data.entries.length - certified, certified, remaining: data.target - certified });
}
