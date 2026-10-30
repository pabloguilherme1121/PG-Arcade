import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=path=>readFileSync(path,'utf8');
const index=read('public/estrategia/independentes/index.html');
const portal=read('public/estrategia/index.html');
const shared=read('public/estrategia/independentes/app.js');
const ids=[
 'frota-oculta','cartas-de-cerco','hex-conexao','damas-taticas','patrulha-tatica',
 'refugio-do-inverno','fronteira-orbital','muralha-das-torres','mercado-de-sombras',
 'conselho-de-reinos','mercado-de-rotas','reversi-tatico','cifras-reais','comando-de-drones','oficina-automatos','controle-trafego','malha-energia'
];
const embedded=ids.slice(0,9),subsites=ids.slice(9);
test('catálogo anuncia exatamente 17 motores, não 150 missões como jogos',()=>{
 const buttons=[...index.matchAll(/data-select="([^"]+)"/g)].map(m=>m[1]);
 const children=[...index.matchAll(/class="choice[^"]*" href="\.\/([^/]+)\/"/g)].map(m=>m[1]);
 assert.equal(new Set(ids).size,ids.length);
 assert.deepEqual(new Set([...buttons,...children]),new Set(ids));
 assert.equal(buttons.length,9);
 assert.equal(children.length,8);
 assert.match(index,/17 motores independentes/);
 assert.match(index,/Dezessete jogos/);
 assert.match(portal,/Dezessete jogos candidatos/);
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
  assert.ok(existsSync('public/estrategia/independentes/'+id+'/'+(id==='conselho-de-reinos'||id==='reversi-tatico'||id==='cifras-reais'||id==='comando-de-drones'||id==='oficina-automatos'||id==='controle-trafego'||id==='malha-energia'?'engine.mjs':'game.mjs')),id);
  assert.match(index,new RegExp('href="\\./'+id+'/"'));
  assert.ok(portal.includes('./independentes/'+id+'/'),id);
 }
});
