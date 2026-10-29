import test from 'node:test';
import assert from 'node:assert/strict';
import {createMarket,commandMarket,marketLot,marketScore} from '../public/estrategia/independentes/market.mjs';
for(const difficulty of ['recruta','tatico','veterano'])for(const mission of ['colecao','patrimonio']){
 test('Mercado: determinismo e objetivo '+difficulty+'/'+mission,()=>{
  const a=createMarket({difficulty,mission,seed:73});
  assert.deepEqual(a,createMarket({difficulty,mission,seed:73}));
  assert.equal(a.phase,'playing');assert.equal(a.round,0);assert.ok(a.credits>0);
  assert.equal(new Set(Array.from({length:8},(_,i)=>marketLot(a.seed,i).family)).size,4);
 });
}
test('Mercado: rejeita estados, lances e modos inválidos',()=>{
 assert.throws(()=>createMarket({difficulty:'impossivel'}),RangeError);
 assert.throws(()=>createMarket({mission:'impossivel'}),RangeError);
 const s=createMarket({seed:2}),lot=marketLot(s.seed,s.round);
 for(const value of [0,-1,NaN,1.5,lot.minBid-1,lot.minBid+7,999]){
  assert.equal(commandMarket(s,{type:'bid',amount:value}),s);
 }
 assert.equal(commandMarket(s,{type:'unknown'}),s);
 const paused=commandMarket(s,{type:'pause'});
 assert.equal(commandMarket(paused,{type:'pass'}),paused);
 assert.equal(commandMarket(paused,{type:'bid',amount:lot.minBid}),paused);
 assert.equal(commandMarket(paused,{type:'resume'}).paused,false);
});
test('Mercado: rival responde, sem crédito negativo e apenas um arrematante',()=>{
 const s=createMarket({seed:4,difficulty:'tatico'}),lot=marketLot(s.seed,0);
 const after=commandMarket(s,{type:'bid',amount:lot.minBid});
 assert.equal(after.round,1);
 assert.ok(after.player.length+after.rival.length<=1);
 assert.ok(after.credits>=0&&after.rivalCredits>=0);
 assert.ok(marketScore(after.player)>=0);
 assert.deepEqual(after,commandMarket(s,{type:'bid',amount:lot.minBid}));
 assert.equal(s.round,0);
});
test('Mercado: rota de vitória e derrota em oito turnos',()=>{
 let winning=null,losing=null;
 for(let seed=0;seed<120;seed++){
  let a=createMarket({difficulty:'recruta',mission:'patrimonio',seed}),b=createMarket({difficulty:'recruta',mission:'patrimonio',seed});
  for(let i=0;i<8;i++){
   const l=marketLot(a.seed,a.round),bid=l.minBid+3;
   a=commandMarket(a,a.credits>=bid?{type:'bid',amount:bid}:{type:'pass'});
   b=commandMarket(b,{type:'pass'});
  }
  if(a.phase==='won')winning=a;
  if(b.phase==='lost')losing=b;
 }
 assert.ok(winning);assert.ok(losing);
 assert.equal(winning.round,8);assert.equal(losing.round,8);
 assert.equal(commandMarket(winning,{type:'pass'}),winning);
 assert.equal(commandMarket(losing,{type:'pass'}),losing);
});