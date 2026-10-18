import {expect,test} from '@playwright/test';
import {solveLinks} from './links-solver';
test('revised links records preserve previous rules across reload and progress view',async({page})=>{
  await page.addInitScript(()=>{
    if(!localStorage.getItem('pg-arcade-progress-v1')) localStorage.setItem('pg-arcade-progress-v1',JSON.stringify({records:{links:8888},recordsV2:{'links|free|2':9999}}));
  });
  await page.goto('./#/jogar/links');
  const game=page.locator('.board-expansion'),cells=game.locator('.new-grid button');
  await game.getByLabel('Dificuldade',{exact:true}).selectOption('2');
  await expect(game.locator('.new-hud strong').nth(1)).toHaveText('0');
  await expect(cells).toHaveCount(36);
  const values=await cells.evaluateAll(nodes=>nodes.map(node=>Number(node.getAttribute('data-value'))));
  const fixed=await cells.evaluateAll(nodes=>nodes.map(node=>node.classList.contains('fixed')?Number(node.getAttribute('data-value')):0));
  const wrap=game.locator('.new-board-wrap');
  expect((await wrap.boundingBox())!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await wrap.scrollIntoViewIfNeeded();
  // Exercise native keyboard activation here; links-difficulty covers full touch games.
  // WebKit CI spends ~2s sampling stability before each click, exhausting the
  // record round's budget before reaching its persistence assertions.
  for(const route of solveLinks(values,fixed,6)) {
    for(const index of [route[0], ...route.slice(1,-1)]) {
      const cell=cells.nth(index);
      await expect(cell).toBeVisible();
      await expect(cell).toBeEnabled();
      await cell.focus();
      await cell.press('Enter');
    }
  }
  await expect(game.locator('.new-status')).toHaveText('Desafio concluído!');
  await expect(game.locator('.new-hud strong').nth(1)).not.toHaveText('0');
  const best=await game.locator('.new-hud strong').nth(1).textContent();
  await page.reload();
  await game.getByLabel('Dificuldade',{exact:true}).selectOption('2');
  await expect(game.locator('.new-hud strong').nth(1)).toHaveText(best!);
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('pg-arcade-progress-v1')!));
  expect(saved.records.links).toBe(8888);
  expect(saved.recordsV2['links|free|2']).toBe(9999);
  expect(saved.recordsV2['links|free|paths2-2']).toBe(Number(best));
  await page.goto('./#/progresso');
  const records=page.getByRole('region',{name:'Recordes por modo e dificuldade'});
  await expect(records).toContainText('Avançado · Trilhas ampliadas');
  await expect(records).toContainText('Avançado · Regras anteriores');
});
