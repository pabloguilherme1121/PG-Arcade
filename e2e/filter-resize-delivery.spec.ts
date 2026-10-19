import {expect,test} from '@playwright/test';
test('filter restoration and rotation never mutate scroll during resize delivery',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.addInitScript(()=>{
  sessionStorage.setItem('pg-arcade-catalog-v1',JSON.stringify({category:'Esportes'}));
  const state={delivering:false,deliveries:0,inlineWrites:0};Object.assign(window,{resizeDeliveryState:state});
  const Native=ResizeObserver;
  window.ResizeObserver=class extends Native{constructor(callback:ResizeObserverCallback){super((entries,observer)=>{state.delivering=true;state.deliveries++;try{callback(entries,observer);}finally{state.delivering=false;}});}};
  const descriptor=Object.getOwnPropertyDescriptor(Element.prototype,'scrollLeft')!;
  Object.defineProperty(Element.prototype,'scrollLeft',{...descriptor,set(value:number){if(state.delivering)state.inlineWrites++;descriptor.set!.call(this,value);}});
 });
 await page.goto('./');
 const selected=page.getByRole('group',{name:'Categorias',exact:true}).locator('[aria-pressed="true"]');
 await expect(selected).toHaveText(/Esportes/);
 for(const width of [320,360,390,430,844,320]){
  await page.setViewportSize({width,height:width===844?390:844});
  await expect.poll(()=>selected.evaluate(el=>{const chip=el.getBoundingClientRect(),row=el.parentElement!.getBoundingClientRect();return chip.left>=row.left-1&&chip.right<=row.right+1;})).toBe(true);
 }
 await expect.poll(()=>page.evaluate(()=>(window as unknown as {resizeDeliveryState:{deliveries:number}}).resizeDeliveryState.deliveries)).toBeGreaterThan(0);
 expect(await page.evaluate(()=>(window as unknown as {resizeDeliveryState:{inlineWrites:number}}).resizeDeliveryState.inlineWrites)).toBe(0);
 expect(errors).toEqual([]);
});
