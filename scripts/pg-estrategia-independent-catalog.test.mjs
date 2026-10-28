import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {MISSIONS,EXISTING_STRATEGY} from '../public/estrategia/catalog.mjs';
import {createNaval} from '../public/estrategia/independentes/naval.mjs';
import {createSiege} from '../public/estrategia/independentes/siege.mjs';
import {createSquad} from '../public/estrategia/independentes/squad.mjs';

const engines=[
  {id:'frota-oculta',init:createNaval,kind:'naval',file:'naval.mjs'},
  {id:'cartas-de-cerco',init:createSiege,kind:'cards',file:'siege.mjs'},
  {id:'patrulha-tatica',init:createSquad,kind:'squad',file:'squad.mjs'},
];
test('catálogo independente conta somente engines reais, não missões nem atalhos herdados',()=>{
 assert.equal(engines.length,3);
 const ids=engines.map(e=>e.id);
 assert.equal(new Set(ids).size,ids.length);
 assert.equal(new Set(engines.map(e=>e.kind)).size,ids.length);
 assert.equal(new Set(engines.map(e=>e.init)).size,ids.length);
 assert.equal(MISSIONS.length,150);
 const legacy=new Set(EXISTING_STRATEGY.map(e=>e[0]));
 for(const e of engines){
   assert.equal(legacy.has(e.id),false,e.id+' não é alias do Arcade');
   assert.equal(MISSIONS.some(m=>m.id===e.id),false,e.id+' não é missão');
   const state=e.init({difficulty:'recruta',seed:31});
   assert.equal(state.id,e.id);
   assert.equal(state.phase,'playing');
   assert.ok(Number.isFinite(state.score));
   assert.ok(readFileSync('public/estrategia/independentes/'+e.file,'utf8').length>500);
 }
});
test('três títulos têm links navegáveis, menus e scripts offline explícitos',()=>{
 const app=readFileSync('public/estrategia/independentes/app.js','utf8');
 const html=readFileSync('public/estrategia/independentes/index.html','utf8');
 const portal=readFileSync('public/estrategia/index.html','utf8');
 const sw=readFileSync('public/estrategia/independentes/sw.js','utf8');
 for(const e of engines){
  assert.ok(app.includes('"'+e.id+'": { name:'),e.id+' registrado na arena');
  assert.ok(html.includes('data-select="'+e.id+'"'),e.id+' selecionável');
  assert.ok(portal.includes('./independentes/#'+e.id),e.id+' acessível pelo portal');
  assert.ok(sw.includes('"./'+e.file+'"'),e.file+' disponível offline');
 }
});
