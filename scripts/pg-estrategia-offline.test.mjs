import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
test('SW de Estratégia inclui retomada offline e ignora Arcade',async()=>{
 const handlers=new Map(),files=[];
 const self={location:{origin:'https://example.test'},registration:{scope:'https://example.test/PG-Arcade/estrategia/'},addEventListener(type,cb){handlers.set(type,cb)},skipWaiting:async()=>{},clients:{claim:async()=>{}}};
 const caches={open:async()=>({addAll:async a=>files.push(...a)}),keys:async()=>[],match:async req=>req.url.endsWith('resume.mjs')?{status:200}:undefined};
 runInNewContext(readFileSync('public/estrategia/sw.js','utf8'),{self,caches,Promise,URL,Set,Response,fetch:async()=>{throw Error('offline')},Error});
 let installed;handlers.get('install')({waitUntil(p){installed=p}});await installed;assert.ok(files.includes('./resume.mjs'));
 let intercepted=false;
 const onFetch=handlers.get('fetch');
 onFetch({request:{method:'GET',url:'https://example.test/PG-Arcade/',mode:'navigate'},respondWith(){intercepted=true}});
 assert.equal(intercepted,false);
 let result;onFetch({request:{method:'GET',url:'https://example.test/PG-Arcade/estrategia/resume.mjs',mode:'cors'},respondWith(p){result=p}});
 assert.equal((await result).status,200);
});
