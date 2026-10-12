import {expect,test} from '@playwright/test';
test('a held touch turn stops on release while a fast swipe still reaches physics',async({page,browserName})=>{
  test.skip(browserName!=='chromium','Uses genuine CDP touch input');
  await page.addInitScript(()=>{
    const clone=window.structuredClone.bind(window);
    window.structuredClone=((value:unknown)=>{
      const result=clone(value) as {id?:string;angle:number};
      if(result.id==='turret') (window as unknown as {motionAngle:number}).motionAngle=result.angle;
      return result;
    }) as typeof structuredClone;
  });
  await page.goto('./#/jogar/turret');
  const now=new Date('2026-10-12T12:00:00Z');
  await page.clock.install({time:now});
  await page.clock.pauseAt(new Date(now.getTime()+1000));
  await page.getByRole('button',{name:'Começar',exact:true}).click();
  const canvas=page.locator('canvas');await canvas.scrollIntoViewIfNeeded();
  const box=(await canvas.boundingBox())!;
  const x=box.x+box.width*.4,y=box.y+box.height*.5;
  const client=await page.context().newCDPSession(page);
  const sample=()=>page.evaluate(()=>(window as unknown as {motionAngle:number}).motionAngle);
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+60,y}]});
  await page.clock.runFor(200);
  await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await page.clock.runFor(35);
  const stopped=await sample();
  await page.clock.runFor(200);
  expect(await sample()).toBeCloseTo(stopped,6);
  // The first post-release simulation sample must also have stopped turning.
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+60,y}]});
  await page.clock.runFor(200);
  const beforeRelease=await sample();
  await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await page.clock.runFor(100);
  // sample is captured immediately before stepping: at most the last held step differs.
  expect((await sample())-beforeRelease).toBeLessThan(.06);
  const beforeFast=await sample();
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+60,y}]});
  await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await page.clock.runFor(100);
  expect(await sample()).toBeGreaterThan(beforeFast);
});
