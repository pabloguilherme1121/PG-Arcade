import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const sw=readFileSync('public/estrategia/independentes/moinhos-pedra/sw.js','utf8');
const parent=readFileSync('public/estrategia/independentes/sw.js','utf8');
test('Moinhos possui cache próprio somente para seus arquivos',()=>{
  assert.match(sw,/self\.registration\.scope/);
  assert.match(sw,/url\.origin!==self\.location\.origin/);
  assert.match(sw,/!url\.pathname\.startsWith\(ROOT\.pathname\)/);
  assert.match(sw,/engine\.mjs/);
  assert.doesNotMatch(sw,/caches\.delete\([^)]*pg-estrategia-warehouse/);
});
test('Service worker do portal não intercepta subsite de Moinhos',()=>{
  assert.match(parent,/const MILLS_PATH = new URL\("moinhos-pedra\/", ROOT\)\.pathname/);
  assert.match(parent,/url\.pathname\.startsWith\(MILLS_PATH\)\) return/);
});
