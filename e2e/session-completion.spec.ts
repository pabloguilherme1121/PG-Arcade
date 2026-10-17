import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
for (const paused of [false, true]) test(`ends ${paused ? 'paused' : 'running'} session without inventing elapsed time or results`, async ({ page }) => {
  await page.setViewportSize({ width: paused ? 390 : 320, height: 844 });
  await page.goto('./#/jogar/memoria');
  await page.locator('.memory-board').waitFor();
  const now = new Date('2026-10-17T12:00:00Z');
  await page.clock.install({ time: new Date(now.getTime()-60000) });
  await page.clock.pauseAt(now);
  await page.locator('.session-mode-cards').getByRole('button',{name:/Sprint:/}).click();
  await page.getByRole('button',{name:'Iniciar desafio de tempo',exact:true}).click();
  await page.clock.runFor(10000);
  if (paused) await page.getByRole('button',{name:'Pausar sessão',exact:true}).click();
  await page.getByRole('button',{name:'Encerrar sessão',exact:true}).click();
  await expect(page.locator('.session-challenge')).toHaveAttribute('data-session-phase','done');
  await expect(page.locator('[data-session-content]')).toHaveAttribute('inert','');
  await expect(page.getByRole('region',{name:'Resumo da sessão'})).toContainText('Conclusões registradas pelo jogo: 0.');
  await expect(page.getByRole('button',{name:'Repetir desafio de tempo',exact:true})).toBeFocused();
  await page.clock.runFor(15000);
  await expect(page.getByRole('timer')).toHaveText('1:50');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  if (paused) { await page.clock.resume(); expect((await new AxeBuilder({page}).include('.session-challenge').analyze()).violations).toEqual([]); }
  await page.getByRole('button',{name:'Repetir desafio de tempo',exact:true}).click();
  await expect(page.getByRole('timer')).toHaveText('2:00');
  await expect(page.getByRole('region',{name:'Resumo da sessão'})).toHaveCount(0);
});
test('reports two real memory victories once each and retains the scoped record', async ({ page }) => {
  await page.addInitScript(()=>{Math.random=()=>0;});
  await page.goto('./#/jogar/memoria');
  await page.locator('.session-mode-cards').getByRole('button',{name:/Sprint:/}).click();
  await page.getByRole('button',{name:'Iniciar desafio de tempo',exact:true}).click();
  await page.getByLabel('Dificuldade da memória',{exact:true}).selectOption('4');
  for(let round=0;round<2;round++) {
    for(const [a,b] of [[0,4],[1,5],[2,6],[3,7]]) { await page.locator(`[data-memory-index="${a}"]`).click();await page.locator(`[data-memory-index="${b}"]`).click(); }
    await expect(page.locator('[data-memory-pairs]')).toHaveText('4/4');
    if(round===0) await page.getByRole('button',{name:'Nova partida',exact:true}).click();
  }
  await page.getByRole('button',{name:'Encerrar sessão',exact:true}).click();
  await expect(page.getByRole('region',{name:'Resumo da sessão'})).toContainText('Conclusões registradas pelo jogo: 2.');
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('pg-arcade-progress-v1')!).recordsV2['memoria|sprint-normal|4-900'])).toBe(4);
});
test('includes a genuine Hanoi victory in the shared logic-family summary', async ({ page }) => {
  await page.goto('./#/jogar/hanoi');
  await page.locator('.session-mode-cards').getByRole('button',{name:/Sprint:/}).click();
  await page.getByRole('button',{name:'Iniciar desafio de tempo',exact:true}).click();
  await page.locator('.lc-settings').getByLabel('Dificuldade',{exact:true}).selectOption('0');
  const towers=page.locator('.lc-towers button');
  for(const [a,b] of [[0,2],[0,1],[2,1],[0,2],[1,0],[1,2],[0,2]]){await towers.nth(a).click();await towers.nth(b).click();}
  await expect(page.locator('.lc-success')).toContainText('Desafio vencido!');
  await page.getByRole('button',{name:'Encerrar sessão',exact:true}).click();
  await expect(page.getByRole('region',{name:'Resumo da sessão'})).toContainText('Conclusões registradas pelo jogo: 1.');
});
