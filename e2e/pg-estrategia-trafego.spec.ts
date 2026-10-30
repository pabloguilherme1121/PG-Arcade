import {test,expect} from '@playwright/test';
test.use({hasTouch:true});
for(const width of [320,390]){
 test('Controle de Tráfego: touch, pausa, desfazer e PG Bot em '+width+'px',async({page})=>{
  await page.setViewportSize({width,height:780});
  await page.goto('./estrategia/independentes/controle-trafego/?seed=0');
  await expect(page.getByRole('heading',{name:'Controle de Tráfego'})).toBeVisible();
  await expect(page.locator('#turns')).toHaveText('0/12');
  const ew=page.getByRole('button',{name:'Abrir Leste–Oeste'});
  await ew.focus();await page.keyboard.press('Enter');
  await expect(page.locator('#turns')).toHaveText('1/12');
  await expect(ew).toBeFocused();
  await page.locator('#pause').tap();
  await expect(ew).toBeDisabled();
  await page.locator('#pause').tap();
  await page.locator('#undo').tap();
  await expect(page.locator('#turns')).toHaveText('0/12');
  await page.locator('#pg-bot summary').click();
  await page.getByRole('button',{name:'Situação'}).click();
  await expect(page.locator('#bot-answer')).toContainText('Turno 0 de 12');
  await page.locator('#mode').selectOption('resgate');
  await expect(page.locator('#emergency')).toHaveText('0/2');
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
test('Controle de Tráfego: Resgate vence e registra recorde local',async({page})=>{
 await page.goto('./estrategia/independentes/controle-trafego/?seed=0');
 await page.locator('#mode').selectOption('resgate');
 for(let t=1;t<=12;t++){
  await page.locator(t%2?'#signal-ew':'#signal-ns').click();
 }
 await expect(page.locator('#phase')).toHaveText('Vitória');
 await expect(page.locator('#emergency')).toHaveText('2/2');
 await expect(page.locator('#served')).toHaveText('24/16');
 await expect(page.locator('#record')).toContainText('24 veículos');
 await page.reload();
 // A página reinicia em Cidade; selecione Resgate para consultar o recorde salvo dessa operação.
 await page.locator('#mode').selectOption('resgate');
 await expect(page.locator('#record')).toContainText('24 veículos');
 await page.locator('#difficulty').selectOption('veterano');
 await expect(page.locator('#limit')).toHaveText('3');
 await expect(page.locator('#record')).toContainText('Sem recordes');
});
test('Controle de Tráfego: navegação real entre os dois portais',async({page})=>{
 await page.goto('./estrategia/');
 await page.locator('#jogos-originais a[href="./independentes/controle-trafego/"]').click();
 await expect(page).toHaveURL(/\/estrategia\/independentes\/controle-trafego\/$/);
 const arcadeUrl=new URL('../../../',page.url()).href;
 await page.getByRole('navigation',{name:'Sites PG'}).getByRole('link',{name:'PG Arcade'}).click();
 await expect(page).toHaveURL(arcadeUrl);
});
