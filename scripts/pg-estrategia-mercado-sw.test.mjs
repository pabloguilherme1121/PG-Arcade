import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

function handler(source,scope) {
 const handlers=new Map();
 const self={registration:{scope},location:{origin:new URL(scope).origin},addEventListener(type,fn){handlers.set(type,fn);}};
 runInNewContext(readFileSync(source,"utf8"),{self,URL,Promise,Response,Set,
   caches:{open:async()=>({}),match:async()=>undefined},fetch:async()=>new Response("ok")});
 return handlers.get("fetch");
}
test("Mercado tem SW próprio sem ser servido pelo catálogo de outros jogos",()=>{
 const root="https://example.test/PG-Arcade/estrategia/independentes/";
 const parent=handler("public/estrategia/independentes/sw.js",root);
 let intercepted=false;
 parent({request:{method:"GET",url:root+"mercado-de-rotas/",mode:"navigate"},respondWith(){intercepted=true;}});
 assert.equal(intercepted,false);
 const child=handler("public/estrategia/independentes/mercado-de-rotas/sw.js",root+"mercado-de-rotas/");
 let childHandled=false;
 child({request:{method:"GET",url:root+"mercado-de-rotas/game.mjs",mode:"cors"},respondWith(){childHandled=true;}});
 assert.equal(childHandled,true);
});
