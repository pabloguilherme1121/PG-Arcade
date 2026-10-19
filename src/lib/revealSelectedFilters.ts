/** Resize delivery only schedules work. All layout writes happen in a later frame. */
export function observeSelectedFilters(chips:NodeListOf<Element>) {
 let frame=0,disposed=false;
 const reveal=()=>{
  frame=0;if(disposed)return;
  const updates=new Map<HTMLElement,number>();
  for(const chip of chips){
   const row=chip.parentElement;if(!row || !chip.isConnected)continue;
   const bounds=chip.getBoundingClientRect(),viewport=row.getBoundingClientRect();
   if(bounds.left>=viewport.left+8 && bounds.right<=viewport.right-8)continue;
   const target=Math.max(0,Math.min(row.scrollWidth-row.clientWidth,row.scrollLeft+bounds.left-viewport.left-8));
   if(Math.abs(target-row.scrollLeft)>1)updates.set(row,target);
  }
  for(const [row,target] of updates)row.scrollLeft=target;
 };
 const schedule=()=>{if(!disposed&&!frame)frame=requestAnimationFrame(reveal);};
 const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(schedule);
 const targets=new Set<Element>();
 for(const chip of chips){targets.add(chip);if(chip.parentElement)targets.add(chip.parentElement);}
 targets.forEach(target=>observer?.observe(target));
 window.addEventListener('resize',schedule);
 schedule();
 return()=>{disposed=true;observer?.disconnect();window.removeEventListener('resize',schedule);if(frame)cancelAnimationFrame(frame);};
}
