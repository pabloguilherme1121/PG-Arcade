import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
function fetchHandler(file,scope){
 const handlers=new Map();
 const self={registration:{scope},location:{origin:new URL(scope).origin},addEventListener(type,fn){handlers.set(type,fn);}};
 runInNewContext(readFileSync(file,'utf8'),{
   self,URL,Promise,Response,Set,
   caches:{open:async()=>({}),match:async()=>undefined},fetch:async()=>new Response('online')
 });
 return handlers.get('fetch');
}
test('Conselho possui SW independente, sem capturar o catálogo ou subsite econômico',()=>{
 const root='https://example.test/PG-Arcade/estrategia/independentes/';
 const parent=fetchHandler('public/estrategia/independentes/sw.js',root);
 for(const suffix of ['conselho-de-aliancas/','conselho-de-aliancas/game.mjs','mercado-de-rotas/']){
  let touched=false;
  parent({request:{method:'GET',url:root+suffix,mode:suffix.endsWith('/')?'navigate':'cors'},respondWith(){touched=true;}});
  assert.equal(touched,false,suffix);
 }
 const child=fetchHandler('public/estrategia/independentes/conselho-de-aliancas/sw.js',root+'conselho-de-aliancas/');
 for(const suffix of ['','game.mjs','app.js','style.css']){
  let touched=false;
  child({request:{method:'GET',url:root+'conselho-de-aliancas/'+suffix,mode:suffix?'cors':'navigate'},respondWith(){touched=true;}});
  assert.equal(touched,true,suffix);
 }
 let outside=false;
 child({request:{method:'GET',url:root+'naval.mjs',mode:'cors'},respondWith(){outside=true;}});
 assert.equal(outside,false);
});
