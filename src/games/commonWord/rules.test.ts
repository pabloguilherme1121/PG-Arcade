import { describe,it,expect } from 'vitest';
import { createMatch,choose,nextRound,playerView } from './rules';
const rounds=[{prompt:'Praia',options:['Mar','Sol','Areia','Férias']},{prompt:'Noite',options:['Lua','Estrelas','Sono','Silêncio']}];
describe('Palavra em Comum — regras independentes de transporte',()=>{
 it('keeps opposing choices private until every player submits',()=>{
  const start=createMatch(['Ana','Bia'],rounds), first=choose(start,'Ana',0,2);
  expect(playerView(first,'Bia')).toMatchObject({ownChoice:null,revealed:null,submitted:['Ana'],scores:{Ana:0,Bia:0}});
  expect(playerView(first,'Ana').ownChoice).toBe(2);
  expect(start.choices).toEqual({});
  expect(choose(first,'Bia',0,2)).toMatchObject({phase:'reveal',scores:{Ana:100,Bia:100}});
 });
 it('scores each matching opponent once, including four-player groups',()=>{
  let s=createMatch(['a','b','c','d'],rounds);
  for(const id of s.players) s=choose(s,id,0,id==='d'?1:0);
  expect(s.scores).toEqual({a:200,b:200,c:200,d:0});
  expect(choose(s,'d',0,0)).toBe(s);
 });
 it('rejects outsider, changed, stale, fractional, and invalid choices without mutation',()=>{
  const s=choose(createMatch(['a','b'],rounds),'a',0,0);
  for(const [id,round,choice] of [['x',0,0],['a',0,1],['b',1,0],['b',0,-1],['b',0,4],['b',0,NaN],['b',0,0.5]] as const) expect(choose(s,id,round,choice)).toBe(s);
  expect(nextRound(s)).toBe(s);
  expect(()=>playerView(s,'x')).toThrow();
 });
 it('finishes a complete match and never scores the same result twice',()=>{
  let s=createMatch(['a','b'],rounds);
  s=nextRound(choose(choose(s,'a',0,0),'b',0,1));
  expect(s).toMatchObject({round:1,phase:'choosing',choices:{},scores:{a:0,b:0}});
  expect(choose(s,'b',0,0)).toBe(s);
  s=nextRound(choose(choose(s,'a',1,3),'b',1,3));
  expect(s).toMatchObject({phase:'finished',scores:{a:100,b:100}});
  expect(nextRound(s)).toBe(s);expect(choose(s,'a',1,0)).toBe(s);
  expect(createMatch(['a','b'],rounds).scores).toEqual({a:0,b:0});
 });
 it('validates inputs and snapshots mutable setup data',()=>{
  for(const players of [[],['a'],['a','a'],['a','b','c','d','e'],['','b']]) expect(()=>createMatch(players,rounds)).toThrow();
  expect(()=>createMatch(['a','b'],[])).toThrow();
  expect(()=>createMatch(['a','b'],[{prompt:'x',options:['a','a','b']}])).toThrow();
  const copy=[{prompt:'x',options:['a','b','c']}];const s=createMatch(['a','b'],copy);copy[0].options[0]='changed';
  expect(s.rounds[0].options[0]).toBe('a');
 });
});
