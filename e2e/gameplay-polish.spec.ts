import {expect,test} from '@playwright/test';

async function freeze(page: import('@playwright/test').Page) {
  const time=new Date('2026-10-10T12:00:00Z');
  await page.clock.install({time});await page.clock.pauseAt(time);
}

test('short target pauses preserve fractional round time',async({page})=>{
  await page.goto('./#/jogar/tiro');
  await expect(page.locator('.targets-board')).toBeVisible();await freeze(page);
  await page.getByRole('button',{name:'Começar rodada',exact:true}).click();
  for(let i=0;i<3;i++) {
    await page.clock.runFor(400);
    await page.getByRole('button',{name:'Pausar',exact:true}).click();
    await page.clock.runFor(5000);
    await page.getByRole('button',{name:'Continuar',exact:true}).click();
  }
  await expect(page.locator('.scores')).toContainText('29s');
  await page.clock.runFor(28_800);
  await expect(page.locator('.game-status')).toContainText('Fim da rodada');
});

test('snake steers during a continuous swipe and ignores cancelled gestures',async({page})=>{
  await page.goto('./#/jogar/snake');
  const board=page.locator('.snake-board');await expect(board).toBeVisible();await freeze(page);
  await page.getByRole('button',{name:'Jogar',exact:true}).click();
  // Firefox desktop has no Touch constructor; supply the event data consumed by React.
  const gesture=async(type:string,clientX:number,clientY:number)=>board.evaluate((el,data)=>{
    const event=new Event(data.type,{bubbles:true,cancelable:true});
    Object.defineProperty(event,'touches',{value:data.type==='touchcancel'?[]:[{identifier:1,clientX:data.clientX,clientY:data.clientY}]});
    el.dispatchEvent(event);
  },{type,clientX,clientY});
  await gesture('touchstart',170,260);
  await gesture('touchmove',170,220);
  await page.clock.runFor(160);await expect(board.locator('> span').nth(119)).toHaveClass('snake-head');
  await gesture('touchmove',130,220);
  await page.clock.runFor(160);await expect(board.locator('> span').nth(118)).toHaveClass('snake-head');
  await gesture('touchcancel',0,0);
  await gesture('touchmove',130,180);
  await page.clock.runFor(160);await expect(board.locator('> span').nth(117)).toHaveClass('snake-head');
});

test('sequence number keys remain usable from a focused pad',async({page})=>{
  await page.addInitScript(()=>{Math.random=()=>0;});
  await page.goto('./#/jogar/sequencia');await expect(page.locator('.sequence-board')).toBeVisible();await freeze(page);
  await page.getByRole('button',{name:'Começar',exact:true}).click();await page.clock.runFor(1350);
  await page.getByRole('button',{name:'1: Verde',exact:true}).focus();await page.keyboard.press('1');
  await expect(page.locator('.scores')).toContainText('100');
  await expect(page.locator('.game-status')).toContainText('Observe a sequência');
});

test('cancelled runner controls do not leave a queued jump',async({page})=>{
  await page.addInitScript(()=>{
    const translate=CanvasRenderingContext2D.prototype.translate;
    CanvasRenderingContext2D.prototype.translate=function(x,y) {
      if(this.canvas.closest('.action-collection')) Object.assign(window,{runnerY:y});
      translate.call(this,x,y);
    };
  });
  await page.goto('./#/jogar/runner');await expect(page.locator('canvas')).toBeVisible();await freeze(page);
  await page.getByRole('button',{name:'Começar',exact:true}).click();await page.clock.runFor(100);
  const sample=()=>page.evaluate(()=>(window as unknown as {runnerY:number}).runnerY);
  const ground=await sample();const jump=page.getByRole('button',{name:'Saltar',exact:true});
  await jump.hover();await page.mouse.down();
  await jump.dispatchEvent('pointercancel',{pointerId:1,pointerType:'mouse'});await page.mouse.up();
  await page.clock.runFor(100);expect(await sample()).toBeCloseTo(ground,6);
  await expect(jump).not.toHaveAttribute('data-held','true');
  await jump.click();await page.clock.runFor(100);expect(await sample()).toBeLessThan(ground);
});
