import test from 'node:test';
import assert from 'node:assert/strict';
import {createCouncil, commandCouncil, availableCouncilActions, councilVotes} from '../public/estrategia/independentes/conselho-de-aliancas/game.mjs';

test('Conselho: dois modos, três dificuldades e estado válido, sem dependências externas',()=>{
 for(const mode of ['reformas','estabilidade'])for(const difficulty of ['recruta','tatico','veterano']){
  const s=createCouncil({mode,difficulty,seed:42});
  assert.equal(s.mode,mode);assert.equal(s.difficulty,difficulty);
  assert.equal(s.phase,'playing');assert.equal(s.round,0);assert.equal(s.support.length,3);
  assert.ok(availableCouncilActions(s).length>=3);
 }
 assert.throws(()=>createCouncil({mode:'sem-regra'}));
 assert.throws(()=>createCouncil({difficulty:'impossivel'}));
});

test('Conselho: ações inválidas e partidas pausadas não alteram o estado',()=>{
 const s=createCouncil({seed:123});
 assert.strictEqual(commandCouncil(s,{type:'nao-existe'}),s);
 assert.strictEqual(commandCouncil(s,{type:'negotiate',faction:-1}),s);
 const paused=commandCouncil(s,{type:'pause'});
 assert.equal(paused.paused,true);
 assert.strictEqual(commandCouncil(paused,{type:'campaign'}),paused);
 assert.equal(commandCouncil(paused,{type:'resume'}).paused,false);
 assert.equal(s.round,0);assert.equal(s.paused,false);
});

test('Conselho: negociação, influência, apoio e reação rival são determinísticos',()=>{
 const a=createCouncil({difficulty:'tatico',seed:77});
 const b=createCouncil({difficulty:'tatico',seed:77});
 const next=commandCouncil(a,{type:'negotiate',faction:1});
 assert.deepEqual(next,commandCouncil(b,{type:'negotiate',faction:1}));
 assert.equal(next.round,1);
 assert.ok(next.treasury<a.treasury);
 assert.ok(next.influence>a.influence);
 assert.notDeepEqual(next.support,a.support);
 assert.equal(a.support[1],4);
 assert.ok(councilVotes(next)>=0 && councilVotes(next)<=7);
});

test('Conselho: aprovar reforma exige maioria, influência e recursos',()=>{
 let s=createCouncil({seed:5});
 assert.strictEqual(commandCouncil(s,{type:'propose'}),s);
 s=commandCouncil(s,{type:'negotiate',faction:1});
 const votes=councilVotes(s);
 assert.ok(votes>=5,'negociações devem permitir maioria');
 const next=commandCouncil(s,{type:'propose'});
 assert.equal(next.laws,1);assert.equal(next.round,s.round+1);
 assert.ok(next.influence<s.influence);
});

test('Conselho: é possível vencer modo reformas com estratégia legal',()=>{
 let s=createCouncil({mode:'reformas',difficulty:'recruta',seed:1});
 let moves=0;
 while(s.phase==='playing'&&moves++<s.limit){
  const actions=availableCouncilActions(s);
  const command=actions.includes('propose')?{type:'propose'}:s.treasury<2?{type:'fund'}:{type:'negotiate',faction:(s.round+1)%3};
  s=commandCouncil(s,command);
 }
 assert.equal(s.phase,'won',JSON.stringify(s));
 assert.equal(s.laws,3);
});

test('Conselho: estabilidade exige condições no encerramento, vitória e derrota não aceitam jogadas',()=>{
 let s=createCouncil({mode:'estabilidade',difficulty:'recruta',seed:4});
 for(let i=0;i<s.limit;i++)s=commandCouncil(s,{type:'fund'});
 assert.equal(s.phase,'lost');
 assert.strictEqual(commandCouncil(s,{type:'fund'}),s);
 let second=createCouncil({mode:'reformas',difficulty:'recruta',seed:1});
 for(let guard=0;guard<second.limit&&second.phase==='playing';guard++){
  const actions=availableCouncilActions(second);
  second=commandCouncil(second,actions.includes('propose')?{type:'propose'}:second.treasury<2?{type:'fund'}:{type:'negotiate',faction:(second.round+1)%3});
 }
 assert.equal(second.phase,'won');assert.strictEqual(commandCouncil(second,{type:'fund'}),second);
});
