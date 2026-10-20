import {describe,expect,it} from 'vitest';
import {createAuction,submitBid,nextLot,collectionScore,collectionProgress,botBid,auctionView,priority,type Relic} from './rules';
const relic=(family:Relic['family'],value=4):Relic=>({id:family+value,name:'Relíquia',family,value});
describe('original sealed relic auction',()=>{
 it('deals nine different lots with three of each family across 100 reproducible seeds',()=>{
  for(let seed=0;seed<100;seed++){
   const a=createAuction(seed,4);
   expect(a).toEqual(createAuction(seed,4));expect(a.lots).toHaveLength(9);
   expect(new Set(a.lots.map(r=>r.id)).size).toBe(9);
   for(const family of ['solar','lunar','marinha'])expect(a.lots.filter(r=>r.family===family)).toHaveLength(3);
   expect(a.coins).toEqual([30,30,30,30]);
  }
 });
 it('scores non-overlapping pairs and trios rather than adding overlapping bonuses',()=>{
  expect(collectionScore([relic('solar')])).toBe(4);
  expect(collectionScore([relic('solar'),relic('solar')])).toBe(11);
  expect(collectionScore([relic('solar'),relic('solar'),relic('solar')])).toBe(20);
  expect(collectionScore([relic('solar'),relic('solar'),relic('lunar')])).toBe(15);
 });
 it('reports family collection progress without changing score or piles',()=>{
  const pile=[relic('solar'),relic('solar'),relic('lunar')];
  const original=[...pile];
  expect(collectionProgress(pile)).toEqual({solar:2,lunar:1,marinha:0});
  expect(collectionProgress([])).toEqual({solar:0,lunar:0,marinha:0});
  expect(collectionProgress([relic('marinha'),relic('marinha'),relic('marinha')]).marinha).toBe(3);
  expect(pile).toEqual(original);
  expect(collectionScore(pile)).toBe(15);
 });
 it('accepts the first valid bid only, hides it from others and charges only the winner',()=>{
  const state=createAuction(42);const first=submitBid(state,0,0,5);
  expect(submitBid(first,0,0,9)).toBe(first);
  expect(auctionView(first,1).ownBid).toBeNull();expect(auctionView(first,1).revealedBids).toBeNull();
  const reveal=submitBid(first,1,0,3);
  expect(reveal.phase).toBe('reveal');expect(reveal.coins).toEqual([25,30]);
  expect(reveal.piles[0]).toHaveLength(1);expect(reveal.piles[1]).toHaveLength(0);
  expect(reveal.history).toHaveLength(1);expect(reveal.history[0].price).toBe(5);
  expect(auctionView(reveal,1).revealedBids).toEqual([5,3]);
  expect(submitBid(reveal,1,0,8)).toBe(reveal);
 });
 it('rotates announced tie priority and discards a lot when everybody passes',()=>{
  let state=createAuction(42,3);
  for(let round=0;round<3;round++){
   expect(priority(state)).toBe(round);
   for(let p=0;p<3;p++)state=submitBid(state,p,round,2);
   expect(state.history.at(-1)?.winner).toBe(round);state=nextLot(state);
  }
  let pass=createAuction(42,4);for(let p=0;p<4;p++)pass=submitBid(pass,p,0,0);
  expect(pass.history[0].winner).toBeNull();expect(pass.coins).toEqual([30,30,30,30]);
 });
 it('rejects stale, malformed, over-budget and post-completion commands',()=>{
  const s=createAuction(42);
  for(const value of [-1,1.5,NaN,Infinity,11])expect(submitBid(s,0,0,value)).toBe(s);
  expect(submitBid(s,4,0,1)).toBe(s);expect(submitBid(s,0,1,1)).toBe(s);expect(nextLot(s)).toBe(s);
  expect(submitBid({...s,coins:[1,30]},0,0,2)).toEqual({...s,coins:[1,30]});
  let done=s;
  for(let round=0;round<9;round++)done=nextLot(submitBid(submitBid(done,0,round,0),1,round,0));
  expect(done.phase).toBe('finished');expect(done.history).toHaveLength(9);
  expect(nextLot(done)).toBe(done);expect(submitBid(done,0,8,1)).toBe(done);
 });
 it('the bot uses public collections and budget, never a current secret human bid',()=>{
  const state=createAuction(42);
  for(const level of ['easy','normal','hard'] as const){
   expect(botBid(state,level)).toBe(botBid({...state,bids:[10,null]},level));
   expect(botBid({...state,coins:[30,0]},level)).toBe(0);
  }
  expect(botBid(state,'easy')).toBeLessThan(botBid(state,'hard'));
 });
 it('keeps all budgets nonnegative through complete bot simulations',()=>{
  for(let seed=0;seed<50;seed++){
   let state=createAuction(seed);
   for(let round=0;round<9;round++){
    const human=Math.min(state.coins[0],(seed+round)%11),bot=botBid(state,'hard');
    state=nextLot(submitBid(submitBid(state,0,round,human),1,round,bot));
    expect(state.coins.every(n=>n>=0&&n<=30)).toBe(true);
   }
   expect(state.phase).toBe('finished');expect(state.piles.flat().length).toBeLessThanOrEqual(9);
   expect(new Set(state.piles.flat().map(r=>r.id)).size).toBe(state.piles.flat().length);
  }
 });
});
