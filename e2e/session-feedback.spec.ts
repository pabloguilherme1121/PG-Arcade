import {expect,test} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('session progress tracks active time, freezes on pause and explains completion',async({page})=>{
  await page.clock.install();
  await page.goto('./#/jogar/memoria');
  await page.locator(".session-mode-cards").getByRole("button", { name: /Sprint/ }).click();
  await page.getByLabel('Dificuldade do desafio de tempo').selectOption('hard');
  await expect(page.getByRole('progressbar',{name:'Tempo utilizado na sessão'})).toHaveAttribute('value','0');
  await page.getByRole('button',{name:'Liberar arena',exact:true}).click();
  await page.clock.runFor(46000);
  await expect(page.locator('.session-final-warning')).toBeVisible();
  await expect(page.locator('.session-challenge')).toHaveAttribute('data-session-urgent','true');
  await page.getByRole('button',{name:'Pausar sessão',exact:true}).click();
  const paused=await page.getByRole('timer').innerText();
  await page.clock.runFor(12000);
  await expect(page.getByRole('timer')).toHaveText(paused);
  await expect(page.locator('.session-checkpoint')).toContainText('O relógio está parado.');
  const audit=await new AxeBuilder({page}).include('.session-challenge').analyze();
  expect(audit.violations).toEqual([]);
  await page.getByRole('button',{name:'Retomar desafio',exact:true}).click();
  await page.clock.runFor(15000);
  await expect(page.locator('.session-challenge')).toHaveAttribute('data-session-phase','done');
  await expect(page.locator('[data-session-content]')).toHaveAttribute('inert','');
  await expect(page.locator('.session-checkpoint')).toContainText('Tempo de jogo nesta sessão: 1:00.');
  await expect(page.getByRole('progressbar',{name:'Tempo utilizado na sessão'})).toHaveAttribute('value','60');
  await expect(page.getByRole('button',{name:'Repetir desafio de tempo',exact:true})).toBeFocused();
  // Stop virtual time while asserting the exact reset value. Without this,
  // WebKit can tick again before the first assertion, turning 0 into 0.2s.
  await page.clock.pauseAt(new Date(await page.evaluate(() => Date.now() + 1)));
  await page.getByRole('button',{name:'Jogar outro desafio',exact:true}).click();
  await expect(page.locator('[data-session-content]')).not.toHaveAttribute('inert','');
  const elapsed = page.getByRole('progressbar',{name:'Tempo utilizado na sessão'});
  await expect(elapsed).toHaveAttribute('value','0');
  // Reset must not permanently freeze the challenge timer.
  await page.clock.runFor(1000);
  expect(Number(await elapsed.getAttribute('value'))).toBeGreaterThan(0);
});
