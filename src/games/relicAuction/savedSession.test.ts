import {afterEach,describe,expect,it,vi} from 'vitest';
import {restoreAuction,saveAuction,readAuction,SAVE_KEY} from './savedSession';
const now=1800000000000;
const data={schema:1,savedAt:now,seed:42,mode:'local',players:3,level:'normal',commands:[[5,2,1],[null,1,null]]};
const restore=(overrides:object={})=>restoreAuction(JSON.stringify({...data,...overrides}),now);
afterEach(()=>vi.unstubAllGlobals());
describe('auction recovery from commands',()=>{
 it('recalculates money, collections and private bids instead of trusting injected scores',()=>{
  const restored=restore({coins:[999,999,999],scores:[999,999,999]})!;
  expect(restored.match.round).toBe(1);expect(restored.match.coins).toEqual([25,30,30]);
  expect(restored.match.piles[0]).toHaveLength(1);expect(restored.match.bids).toEqual([null,1,null]);
 });
 it('rejects malformed, future/expired, oversized, stale and unaffordable commands',()=>{
  expect(restoreAuction('{bad',now)).toBeNull();expect(restoreAuction(' '.repeat(16001),now)).toBeNull();
  for(const d of [{schema:2},{seed:-1},{savedAt:now+120000},{savedAt:now-8*86400000},{mode:'online'},{players:8},{level:'god'},{commands:[]},{commands:[[1,null,2],[1,null,2]]},{commands:[[11,2,1]]},{commands:[[1.5,2,1]]},{commands:[['NaN',2,1]]},{commands:[[10,0,0],[10,0,0],[10,0,0],[1,0,0]]},{commands:[[1,2]]}])expect(restore(d)).toBeNull();
 });
 it('rejects partial/forged solo submissions and cannot load another schema',()=>{
  expect(restore({mode:'solo',players:2,commands:[[1,null]]})).toBeNull();
  expect(restore({mode:'solo',players:2,commands:[[1,10]]})).toBeNull();
  expect(restoreAuction(JSON.stringify({schema:'pg-arcade-common-word-session-v1'}),now)).toBeNull();
 });
 it('writes only its own key, drops completed sessions and tolerates blocked storage',()=>{
  let raw='',removed='';
  vi.stubGlobal('localStorage',{setItem:(key:string,value:string)=>{expect(key).toBe(SAVE_KEY);raw=value;},getItem:()=>raw,removeItem:(key:string)=>{removed=key;raw='';}});
  const {match,settings}=restore()!;
  expect(saveAuction(match,settings)).toBe(true);expect(readAuction()?.match).toEqual(match);
  expect(saveAuction({...match,phase:'finished'},settings)).toBe(true);expect(removed).toBe(SAVE_KEY);
  vi.stubGlobal('localStorage',{getItem:()=>{throw Error('blocked');},setItem:()=>{throw Error('blocked');}});
  expect(readAuction()).toBeNull();expect(saveAuction(match,settings)).toBe(false);
 });
});
