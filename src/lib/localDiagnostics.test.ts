import {afterEach,describe,expect,it,vi} from 'vitest';
import {localDiagnostics,startDiagnostics,stopDiagnostics} from './localDiagnostics';
const listeners=new Set<()=>void>();
let visible=true,clock=0;
class Observer {
 static supportedEntryTypes=['longtask'];
 observe(){} disconnect(){} takeRecords(){return [];}
}
afterEach(()=>{stopDiagnostics();vi.unstubAllGlobals();listeners.clear();visible=true;clock=0;});
function setup(){
 vi.stubGlobal('PerformanceObserver',Observer);
 vi.stubGlobal('performance',{now:()=>clock,getEntriesByType:()=>[]});
 vi.stubGlobal('document',{get visibilityState(){return visible?'visible':'hidden';},addEventListener:(_:string,fn:()=>void)=>listeners.add(fn),removeEventListener:(_:string,fn:()=>void)=>listeners.delete(fn)});
 vi.stubGlobal('innerWidth',390);vi.stubGlobal('innerHeight',844);vi.stubGlobal('devicePixelRatio',1);
 vi.stubGlobal('matchMedia',()=>({matches:false}));vi.stubGlobal('navigator',{onLine:true});
}
describe('opt-in diagnostic collection interval',()=>{
 it('tracks elapsed and visible time, then freezes both after stop',()=>{
  setup();expect(startDiagnostics()).toBe(true);
  clock=100;visible=false;listeners.forEach(fn=>fn());
  clock=300;visible=true;listeners.forEach(fn=>fn());
  clock=450;stopDiagnostics();clock=900;
  expect(localDiagnostics().collection).toMatchObject({durationMs:450,visibleMs:250});
  expect(localDiagnostics().collection?.endedAt).toEqual(expect.any(String));
  expect(listeners.size).toBe(0);
 });
 it('resets the interval only on a fresh collection, not duplicate start',()=>{
  setup();startDiagnostics();clock=50;startDiagnostics();stopDiagnostics();
  expect(localDiagnostics().collection?.durationMs).toBe(50);
  clock=100;startDiagnostics();clock=110;stopDiagnostics();
  expect(localDiagnostics().collection?.durationMs).toBe(10);
 });
});
