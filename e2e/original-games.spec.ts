import {test,expect} from '@playwright/test';

test('football lift clears the wall but can also miss over the crossbar',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(()=>{Math.random=()=>0;});
 await page.goto('./#/jogar/futebol');
 await page.getByRole('button',{name:'Cobranças de falta',exact:true}).click();
 await page.getByRole('button',{name:'Centro',exact:true}).click();
 await page.getByLabel('Força').fill('65');
 await page.getByLabel('Curva').fill('0');

 await page.getByLabel('Elevação').fill('20');
 await page.getByRole('button',{name:'Chutar',exact:true}).click();
 await expect(page.locator('[data-football-result]')).toHaveAttribute('data-football-result','barreira');

 await page.getByLabel('Elevação').fill('55');
 await page.getByRole('button',{name:'Chutar',exact:true}).click();
 await expect(page.locator('[data-football-result]')).toHaveAttribute('data-football-result','gol');

 await page.getByLabel('Elevação').fill('100');
 await page.getByLabel('Força').fill('80');
 await page.getByRole('button',{name:'Chutar',exact:true}).click();
 await expect(page.locator('[data-football-result]')).toHaveAttribute('data-football-result','fora');
});

test('five original games keep their playable interactions',async({page})=>{
 await page.goto('./#/jogar/velha');const velha=page.locator('[data-tic-tac-toe="true"]');await velha.locator('[data-arcade-presets="true"]').getByRole('button',{name:/dupla/i}).click();const cells=velha.locator('[data-game-cell="true"]');await cells.nth(0).click();await cells.nth(1).click();await expect(cells.nth(0)).toHaveText('X');await expect(cells.nth(1)).toHaveText('O');
 await page.goto('./#/jogar/domino');const domino=page.locator('[data-domino-game="true"]');await domino.getByRole('button',{name:/1 × 1 local/i}).click();await domino.locator('[data-domino-tile="true"]').first().click();await expect(domino.locator('[data-domino-handoff="true"]')).toBeVisible();await domino.getByRole('button',{name:/jogador 2.*revelar mão/i}).click();await expect(domino.locator('[data-domino-handoff="true"]')).toHaveCount(0);
 await page.goto('./#/jogar/damas');const damas=page.locator('[data-checkers-game="true"]');await damas.getByRole('button',{name:/1 × 1 local/i}).click();await damas.getByRole('gridcell',{name:/Peça azul/i}).first().click();await damas.locator('[data-legal-destination="true"]').first().click();await expect(damas.locator('[data-checkers-status="true"]')).toContainText(/jogador 2|vermelho/i);
 await page.goto('./#/jogar/xadrez');const chess=page.locator('[data-chess-game="true"]');await chess.getByRole('button',{name:/1 × 1 local/i}).click();await chess.getByRole('gridcell',{name:/e2 · peão branco/i}).click();await chess.getByRole('gridcell',{name:/e4 · vazia/i}).click();await expect(chess.getByRole('gridcell',{name:/e4 · peão branco/i})).toBeVisible();
 await page.goto('./#/jogar/futebol');await page.getByRole('button',{name:'Chutar',exact:true}).click();await expect(page.locator('[data-football-result]')).not.toHaveAttribute('data-football-result','ready');
});
