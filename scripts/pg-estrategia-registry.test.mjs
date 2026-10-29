import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=path=>readFileSync(path,'utf8');
const index=read('public/estrategia/independentes/index.html');
const portal=read('public/estrategia/index.html');
const shared=read('public/estrategia/independentes/app.js');
const ids=[
 'frota-oculta','cartas-de-cerco','hex-conexao','damas-taticas','patrulha-tatica',
 'refugio-do-inverno','fronteira-orbital','muralha-das-torres',
 'conselho-de-reinos','mercado-de-rotas','reversi-tatico','cifras-reais'
];
const embedded=ids.slice(0,8),subsites=ids.slice(8);
test('catálogo anuncia exatamente 12 motores, não 150 missões como jogos',()=>{
 const buttons=[...index.matchAll(/data-select="([^"]+)"/g)].map(m=>m[1]);
 const children=[...index.matchAll(/class="choice[^"]*" href="\.\/([^/]+)\/"/g)].map(m=>m[1]);
 assert.equal(new Set(ids).size,ids.length);
 assert.deepEqual(new Set([...buttons,...children]),new Set(ids));
 assert.equal(buttons.length,8);
 assert.equal(children.length,4);
 assert.match(index,/12 motores independentes/);
 assert.match(index,/Doze jogos/);
 assert.match(portal,/Doze jogos candidatos/);
});
test('cada jogo possui um motor e um caminho único e acessível desde o portal',()=>{
 for(const id of embedded){
  assert.match(index,new RegExp('data-select="'+id+'"'));
  assert.ok(shared.includes('"'+id+'"'),id);
  assert.ok(portal.includes('./independentes/#'+id),id);
 }
 for(const id of subsites){
  for(const path of ['index.html','app.js','style.css','sw.js'])
   assert.ok(existsSync('public/estrategia/independentes/'+id+'/'+path),id+'/'+path);
  assert.ok(existsSync('public/estrategia/independentes/'+id+'/'+(id==='conselho-de-reinos'||id==='reversi-tatico'||id==='cifras-reais'?'engine.mjs':'game.mjs')),id);
  assert.match(index,new RegExp('href="\\./'+id+'/"'));
  assert.ok(portal.includes('./independentes/'+id+'/'),id);
 }
});
