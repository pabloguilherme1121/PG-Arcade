import {test,expect} from '@playwright/test';
test.use({hasTouch:true});
for(const width of [320,390]){
 test('Comando de Drones: toque, programação, pausa, bot e layout '+width+'px',async({page})=>{
  await page.setViewportSize({width,height:780});
  await page.goto('./estrategia/independentes/comando-de-drones/?seed=1');
  await expect(page.getByRole('heading',{name:'Comando de Drones'})).toBeVisible();
  await expect(page.getByRole('gridcell')).toHaveCount(25);
  await page.locator('#commands [data-command="right"]').tap();
  await page.locator('#commands [data-command="right"]').tap();
  await expect(page.locator('#queue')).toContainText('2. → Direita');
  await page.locator('#undo-order').tap();
  await expect(page.locator('#queue')).not.toContainText('2.');
  await page.locator('#pause').tap();
  await expect(page.locator('#execute')).toBeDisabled();
  await page.locator('#pause').press('Enter');
  await expect(page.locator('#pause')).toHaveAttribute('aria-pressed','false');
  await page.locator('#execute').tap();
  await expect(page.locator('#cycles')).toHaveText('1/10');
  await page.locator('#undo-cycle').tap();
  await expect(page.locator('#cycles')).toHaveText('0/10');
  await page.locator('#pg-bot summary').click();
  await page.locator('[data-help="situacao"]').click();
  await expect(page.locator('#bot-answer')).toContainText('Ciclo 0 de 10');
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
test('Comando de Drones: vitória com sinais e recorde local',async({page})=>{
 await page.setViewportSize({width:390,height:780});
 await page.goto('./estrategia/independentes/comando-de-drones/?seed=1');
 const program=[...Array(4).fill('right'),...Array(4).fill('down'),...Array(4).fill('left'),...Array(4).fill('right')];
 for(let i=0;i<program.length;i+=3){
  for(const command of program.slice(i,i+3))await page.locator('#commands [data-command="'+command+'"]').click();
  await page.locator('#execute').click();
 }
 await expect(page.locator('#phase')).toHaveText('Vitória');
 await expect(page.locator('#beacons')).toHaveText('2/2');
 await expect(page.locator('#record')).toContainText('16 comandos');
 await page.reload();
 await expect(page.locator('#record')).toContainText('16 comandos');
 await page.locator('#difficulty').selectOption('veterano');
 await expect(page.locator('#energy')).toHaveText('20');
 await expect(page.locator('#cycles')).toHaveText('0/8');
 await expect(page.locator('#record')).toContainText('Ainda sem recorde');
});
test('Comando de Drones: links, operação alternativa e retorno ao Arcade',async({page})=>{
 await page.goto('./estrategia/');
 // Works for the local root (/) and for the GitHub Pages subpath (/PG-Arcade/).
 const arcadeUrl = new URL('../', page.url()).href;
 await expect(page.locator('#jogos-originais a[href="./independentes/comando-de-drones/"]')).toBeVisible();
 await page.locator('#jogos-originais a[href="./independentes/comando-de-drones/"]').click();
 await expect(page).toHaveURL(/\/estrategia\/independentes\/comando-de-drones\/$/);
 await page.locator('#mode').selectOption('varredura');
 await expect(page.getByRole('gridcell',{name:/Linha 3, coluna 1: sinal/})).toBeVisible();
 await page.getByRole('navigation',{name:'Navegação entre projetos'}).getByRole('link',{name:'PG Arcade'}).click();
 await expect(page).toHaveURL(arcadeUrl);
});
