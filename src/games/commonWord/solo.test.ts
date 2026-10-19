import {expect,it} from 'vitest';
import {createDeck} from './deck';
import {soloChallenge} from './solo';
it('provides a stable, distinct clue for every option in the curated deck',()=>{
 for(const round of createDeck(42,20)) {
  const seen=new Set<string>();
  for(let seed=0;seed<100;seed++) {
   const challenge=soloChallenge(seed,0,round.options);
   expect(challenge).toEqual(soloChallenge(seed,0,round.options));
   expect(challenge.target).toBeGreaterThanOrEqual(0);expect(challenge.target).toBeLessThan(4);
   expect(challenge.hint.length).toBeGreaterThan(15);
   seen.add(challenge.hint);
  }
  expect(seen.size).toBe(4);
 }
});
it('avoids the four sequences and four-round cycle of the previous bot',()=>{
 const options=['Mar','Sol','Areia','Férias'];const patterns=new Set<string>();
 for(let seed=0;seed<100;seed++)patterns.add(Array.from({length:10},(_,r)=>soloChallenge(seed,r,options).target).join(''));
 expect(patterns.size).toBeGreaterThan(90);
});
it('rejects invalid challenge inputs',()=>{
 for(const seed of [-1,NaN,Infinity,1.5])expect(()=>soloChallenge(seed,0,['Mar'])).toThrow();
 expect(()=>soloChallenge(1,-1,['Mar'])).toThrow();expect(()=>soloChallenge(1,0,['unknown'])).toThrow();
 for(const key of ['__proto__','constructor'])expect(()=>soloChallenge(1,0,[key])).toThrow();
});
