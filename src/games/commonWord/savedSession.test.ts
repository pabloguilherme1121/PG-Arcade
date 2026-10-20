import {describe,expect,it,vi,afterEach} from 'vitest';
import {restoreSession,saveSession,SAVE_KEY} from './savedSession';
const now=1800000000000;
const data={schema:1,savedAt:now,seed:42,mode:'local',players:2,count:5,answers:[[0,0],[1]]};
const restore=(overrides:object={})=>restoreSession(JSON.stringify({...data,...overrides}),now);
afterEach(()=>vi.unstubAllGlobals());
describe('local match recovery',()=>{
 it('replays scores once and covers the next player, ignoring injected scores',()=>{
  const saved=restore({scores:{'Jogador 1':999999}})!;
  expect(saved.session.match.round).toBe(1);
  expect(saved.session.match.scores).toEqual({'Jogador 1':100,'Jogador 2':100});
  expect(saved.session.current).toBe(1);expect(saved.session.covered).toBe(true);
  expect(saved.session.match.choices).toEqual({'Jogador 1':1});
 });
 it('rejects malformed, expired, oversized and illegal command histories',()=>{
  expect(restoreSession('{broken',now)).toBeNull();expect(restoreSession(' '.repeat(16001),now)).toBeNull();
  for(const overrides of [{schema:2},{savedAt:now-8*86400000},{savedAt:now+120000},{seed:-1},{mode:'online'},{players:8},{count:999},{answers:[]},{answers:[[0],[1]]},{answers:[[99]]},{answers:[[0,0,0]]},{answers:[[null]]},{answers:[[1.5]]}])expect(restore(overrides)).toBeNull();
 });
 it('rejects a partial or forged bot submission',()=>{
  expect(restore({mode:'solo',answers:[[0]]})).toBeNull();
  expect(restore({mode:'solo',answers:[[0,99]]})).toBeNull();
 });
 it('does not write general records and tolerates blocked storage',()=>{
  const writes:string[]=[];
  vi.stubGlobal('localStorage',{setItem:(key:string)=>{writes.push(key);},removeItem:()=>{}});
  const session=restore()!.session;
  expect(saveSession(session,'local',2,5)).toBe(true);expect(writes).toEqual([SAVE_KEY]);
  vi.stubGlobal('localStorage',{setItem:()=>{throw Error('blocked');}});
  expect(saveSession(session,'local',2,5)).toBe(false);
 });
});
