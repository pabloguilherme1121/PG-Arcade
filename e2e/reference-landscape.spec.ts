import {test,expect} from '@playwright/test';
const surfaces={snake:'.snake-board','2048':'.board2048',memoria:'.memory-board',xadrez:'[data-chess-board]',corrida:'.race-board',futebol:'.football-pitch'};
test.use({hasTouch:true});
test('focused reference arenas fit short landscape without losing the active control',async({page})=>{
  await page.setViewportSize({width:844,height:390});
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const [id,selector] of Object.entries(surfaces)){
    await page.goto(`./#/jogar/${id}`);
    const field=page.locator(selector);await expect(field).toBeVisible();
    await page.getByRole('button',{name:'Ir para o tabuleiro',exact:true}).tap();
    await expect.poll(()=>field.evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=-1&&r.bottom<=innerHeight+1&&r.left>=-1&&r.right<=innerWidth+1;}),{message:`whole ${id} arena in landscape`}).toBe(true);
    expect(await field.evaluate(el=>el.contains(document.activeElement)||el===document.activeElement)).toBe(true);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  }
});
