import { expect,it } from 'vitest';
import { createDeck } from './deck';
import { createMatch } from './rules';
it('produces reproducible, valid rounds without repeated prompts',()=>{
 for(let seed=0;seed<100;seed++) {
  const deck=createDeck(seed);expect(deck).toEqual(createDeck(seed));expect(deck).toHaveLength(10);
  expect(new Set(deck.map(r=>r.prompt)).size).toBe(10);
  expect(()=>createMatch(['a','b'],deck)).not.toThrow();
 }
 expect(createDeck(1)).not.toEqual(createDeck(2));
});
it('returns independent decks and rejects unsupported seeds and sizes',()=>{
 const deck=createDeck(1);deck[0].options[0]='changed';expect(createDeck(1)[0].options[0]).not.toBe('changed');
 for(const seed of [-1,NaN,Infinity,1.5,0x100000000]) expect(()=>createDeck(seed)).toThrow();
 for(const count of [0,21,1.5]) expect(()=>createDeck(1,count)).toThrow();
 expect(createDeck(0xffffffff,20)).toHaveLength(20);
});
