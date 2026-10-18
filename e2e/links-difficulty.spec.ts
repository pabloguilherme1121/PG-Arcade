import { expect, test } from '@playwright/test';
import { solveLinks } from './links-solver';
test.use({ hasTouch:true });
for(const width of [320,390,844]) for(const difficulty of [0,1,2]) {
  if(width===844 && difficulty!==2) continue;
  test(`links completes level ${difficulty} by touch at ${width}px`,async({page},info)=>{
    await page.setViewportSize({width,height:width===844?390:width===320?740:844});
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto('./#/jogar/links');
    const game=page.locator('.board-expansion'), cells=game.locator('.new-grid button');
    await game.getByLabel('Dificuldade',{exact:true}).selectOption(String(difficulty));
    const size=difficulty===2?6:4;
    await expect(cells).toHaveCount(size*size);
    await expect(game.locator('.links-value-picker button')).toHaveCount(size+1);
    const values=await cells.evaluateAll(nodes=>nodes.map(node=>Number(node.getAttribute('data-value'))));
    const fixed=await cells.evaluateAll(nodes=>nodes.map(node=>node.classList.contains('fixed')?Number(node.getAttribute('data-value')):0));
    const routes=solveLinks(values,fixed,size);
    for(const route of routes) {
      await cells.nth(route[0]).tap();
      const inner=route.slice(1,-1);
      for(let i=0;i<inner.length;i++) if(!values[inner[i]] || inner.slice(i+1).some(cell=>!values[cell])) await cells.nth(inner[i]).tap();
    }
    await expect(game.locator('.new-status')).toHaveText('Desafio concluído!');
    await expect(game.locator('.new-grid button:enabled')).toHaveCount(0);
    await expect(game.locator('.new-hud strong').nth(1)).not.toHaveText('0');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
    await game.getByRole('button',{name:'Reiniciar',exact:true}).tap();
    await expect(cells.first()).toBeEnabled();
    expect(await cells.evaluateAll(nodes=>nodes.map(node=>Number(node.getAttribute('data-value'))))).toEqual(values);
    if(difficulty===2) {
      await game.locator('.new-board-wrap').scrollIntoViewIfNeeded();
      await page.screenshot({path:info.outputPath(`links-${width}.png`)});
    }
  });
}
test('links resumes, undoes actual moves, protects terminals and keeps native number keys',async({page})=>{
  await page.setViewportSize({width:320,height:740});
  await page.goto('./#/jogar/links');
  const game=page.locator('.board-expansion'), cell=(index:number)=>game.locator(`[data-index="${index}"]`);
  await cell(3).tap(); await cell(7).tap(); await cell(0).tap(); await cell(7).tap();
  await expect(cell(7)).toHaveClass(/selected/);
  await cell(6).tap(); await expect(cell(6)).toHaveAttribute('data-value','2');
  await cell(0).tap();
  await game.getByRole('button',{name:'Desfazer',exact:true}).tap();
  await expect(cell(6)).toHaveAttribute('data-value','0');
  await expect(cell(7)).toHaveAttribute('data-value','2');
  const picker=game.locator('.links-value-picker');
  const two=picker.getByRole('button',{name:'2',exact:true});
  await two.focus(); await two.press('Enter');
  await expect(two).toHaveAttribute('aria-pressed','true');
  await expect(cell(6)).toHaveAttribute('data-value','0');
  await picker.getByRole('button',{name:'Apagar',exact:true}).tap(); await cell(7).tap();
  await expect(cell(7)).toHaveAttribute('data-value','0');
  await cell(3).tap(); await expect(cell(3)).toHaveAttribute('data-value','2');
  await game.getByRole('button',{name:'Pausar',exact:true}).tap();
  await expect(picker.locator('button:disabled')).toHaveCount(5);
  await game.locator('.new-pause').getByRole('button',{name:'Continuar',exact:true}).tap();
  await game.getByLabel('Dificuldade',{exact:true}).selectOption('2');
  await game.getByRole('button',{name:'Ampliar tabuleiro',exact:true}).tap();
  expect((await cell(0).boundingBox())!.width).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
