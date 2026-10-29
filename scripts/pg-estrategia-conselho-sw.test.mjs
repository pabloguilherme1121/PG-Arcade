import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";

function makeFetchHandler(file,scope){
 const handlers=new Map();
 const self={registration:{scope},location:{origin:new URL(scope).origin},addEventListener(name,callback){handlers.set(name,callback);}};
 runInNewContext(readFileSync(file,"utf8"),{self,URL,Promise,Response,Set,caches:{match:async()=>undefined,open:async()=>({})},fetch:async()=>new Response("ok")});
 return handlers.get("fetch");
}
test("Conselho possui shell isolado do catálogo e do Mercado de Rotas",()=>{
 const root="https://example.test/PG-Arcade/estrategia/independentes/";
 const parent=makeFetchHandler("public/estrategia/independentes/sw.js",root);
 let intercepted=false;
 parent({request:{method:"GET",url:root+"conselho-de-reinos/",mode:"navigate"},respondWith(){intercepted=true;}});
 assert.equal(intercepted,false);
 const child=makeFetchHandler("public/estrategia/independentes/conselho-de-reinos/sw.js",root+"conselho-de-reinos/");
 let handled=false;
 child({request:{method:"GET",url:root+"conselho-de-reinos/engine.mjs",mode:"cors"},respondWith(){handled=true;}});
 assert.equal(handled,true);
 let outside=false;
 child({request:{method:"GET",url:root+"mercado-de-rotas/",mode:"navigate"},respondWith(){outside=true;}});
 assert.equal(outside,false);
});
