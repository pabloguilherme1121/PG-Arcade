import {expect,it} from 'vitest';
import legacySource from '../../public/estrategia/catalog.mjs?raw';
import {games} from './catalog';

it('a categoria Estratégia do Arcade e os jogos legados do PG Estratégia não divergem',()=>{
  const start=legacySource.indexOf('export const EXISTING_STRATEGY = Object.freeze(');
  expect(start).toBeGreaterThan(-1);
  const lines=[...legacySource.slice(start).matchAll(/\[\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\]/g)];
  const legacy=lines.map((match)=>[match[1],match[2]] as const);
  const arcade=games.filter(game=>game.category==='Estratégia')
    .map(game=>[game.id,game.name] as const);
  expect(legacy.length).toBe(47);
  expect(new Set(legacy.map(([id])=>id)).size).toBe(legacy.length);
  expect([...legacy].sort(([a],[b])=>a.localeCompare(b)))
    .toEqual([...arcade].sort(([a],[b])=>a.localeCompare(b)));
});
