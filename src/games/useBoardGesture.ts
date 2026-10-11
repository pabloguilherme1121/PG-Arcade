import {useRef, useEffect, type PointerEvent, type MouseEvent} from 'react';
import {identifyTouchGesture, type TouchGesture} from '../lib/touchCanvas';

/** Pointer capture keeps swipes intact; cancellation never commits a move. */
export function useBoardGesture(commit:(from:number,to:number,gesture:TouchGesture)=>void, enabled=true,preview?:(from:number,to:number)=>void,tap?:(index:number)=>void) {
  const active=useRef<{id:number;x:number;y:number;from:number;to:number}|null>(null);
  const suppressClick=useRef(false);
  useEffect(()=>{if(!enabled) {active.current=null;suppressClick.current=false;}},[enabled]);
  function indexAt(e:PointerEvent<HTMLElement>) {
    const cell=document.elementFromPoint(e.clientX,e.clientY)?.closest<HTMLElement>('[data-drag-index]');
    return cell && e.currentTarget.contains(cell) ? Number(cell.dataset.dragIndex) : -1;
  }
  return {
    'data-touch-swipe': enabled ? 'true' : undefined,
    onPointerDown(e:PointerEvent<HTMLElement>) {
      if (!enabled || !e.isPrimary || e.button!==0 || active.current) return;
      suppressClick.current=false;
      const from=indexAt(e);
      active.current={id:e.pointerId,x:e.clientX,y:e.clientY,from,to:from};
      preview?.(from,from);
      // Keep the original button as the capture target so a plain touch still
      // produces its native click. Capturing the grid would swallow mobile taps.
      const button=e.target instanceof Element ? e.target.closest('button') : null;
      (button && e.currentTarget.contains(button) ? button : e.currentTarget).setPointerCapture(e.pointerId);
    },
    onPointerMove(e:PointerEvent<HTMLElement>) {
      if(active.current?.id!==e.pointerId) return;
      const to=indexAt(e);
      if(to>=0 && to!==active.current.to) {active.current.to=to;preview?.(active.current.from,to);}
    },
    onPointerUp(e:PointerEvent<HTMLElement>) {
      const start=active.current;
      if(!start || start.id!==e.pointerId) return;
      active.current=null;
      preview?.(-1,-1);
      const to=indexAt(e);
      const gesture=identifyTouchGesture(start.x,start.y,e.clientX,e.clientY,18);
      const moved=gesture && gesture!=='tap';
      const tapped=enabled && gesture==='tap' && e.pointerType!=='mouse' && !!tap && start.from>=0;
      suppressClick.current=!!moved || tapped;
      if(tapped) tap?.(start.from);
      if(enabled && moved) commit(start.from,to>=0?to:start.to,gesture);
    },
    onPointerCancel(e:PointerEvent<HTMLElement>) {
      if(active.current?.id===e.pointerId) {active.current=null;suppressClick.current=true;preview?.(-1,-1);}
    },
    onLostPointerCapture(e:PointerEvent<HTMLElement>) {
      if(active.current?.id===e.pointerId) {active.current=null;suppressClick.current=true;preview?.(-1,-1);}
    },
    onClickCapture(e:MouseEvent<HTMLElement>) {
      if(suppressClick.current && e.detail!==0) {e.preventDefault();e.stopPropagation();suppressClick.current=false;}
    },
  };
}
