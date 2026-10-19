import {afterEach,expect,it,vi} from 'vitest';
import {observeSelectedFilters} from './revealSelectedFilters';
afterEach(()=>vi.unstubAllGlobals());
function fixture(){
 let callback:()=>void=()=>{},next=1;
 const frames=new Map<number,FrameRequestCallback>(),writes:number[]=[],targets=new Set<Element>();
 const row={scrollWidth:300,clientWidth:100,get scrollLeft(){return writes.at(-1)??0;},set scrollLeft(value:number){writes.push(value);},getBoundingClientRect:()=>({left:0,right:100})};
 const chip={parentElement:row,isConnected:true,getBoundingClientRect:()=>({left:200-row.scrollLeft,right:260-row.scrollLeft})};
 vi.stubGlobal('requestAnimationFrame',(fn:FrameRequestCallback)=>{const id=next++;frames.set(id,fn);return id;});
 vi.stubGlobal('cancelAnimationFrame',(id:number)=>frames.delete(id));
 vi.stubGlobal('window',{addEventListener:vi.fn(),removeEventListener:vi.fn()});
 const disconnect=vi.fn();
 vi.stubGlobal('ResizeObserver',class{constructor(fn:()=>void){callback=fn;}observe(el:Element){targets.add(el);}disconnect=disconnect;});
 return {row,chip,frames,writes,targets,disconnect,notify:()=>callback(),flush:()=>{const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(0));}};
}
it('never writes inside resize delivery, coalesces notifications and stops once visible',()=>{
 const f=fixture();const stop=observeSelectedFilters([f.chip,f.chip] as unknown as NodeListOf<Element>);
 f.notify();f.notify();expect(f.writes).toEqual([]);expect(f.frames.size).toBe(1);expect(f.targets.size).toBe(2);
 f.flush();expect(f.writes).toEqual([192]);
 const bounds=f.chip.getBoundingClientRect();expect(bounds.left).toBeGreaterThanOrEqual(8);expect(bounds.right).toBeLessThanOrEqual(92);
 f.notify();f.flush();expect(f.writes).toEqual([192]);stop();expect(f.disconnect).toHaveBeenCalledOnce();
});
it('cancels pending work and ignores notifications after unmount',()=>{
 const f=fixture(),stop=observeSelectedFilters([f.chip] as unknown as NodeListOf<Element>);
 stop();f.notify();f.flush();expect(f.writes).toEqual([]);expect(f.frames.size).toBe(0);
});
it('does not move disconnected controls',()=>{
 const f=fixture();f.chip.isConnected=false;
 const stop=observeSelectedFilters([f.chip] as unknown as NodeListOf<Element>);f.flush();expect(f.writes).toEqual([]);stop();
});
