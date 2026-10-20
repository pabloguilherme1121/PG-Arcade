import {test,expect,type Page,type Locator} from '@playwright/test';
import {swapJewels} from '../src/lib/casualCollection';
import {visibleWordPaths} from './wordsearch-helpers';
test.use({hasTouch:true,viewport:{width:390,height:844}});

async function drag(page:Page,from:Locator,to:Locator,browserName:string,cancel=false) {
  await from.scrollIntoViewIfNeeded();
  const a=await from.boundingBox(),b=await to.boundingBox();
  expect(a).not.toBeNull();expect(b).not.toBeNull();
  const start={x:a!.x+a!.width/2,y:a!.y+a!.height/2};
  const end={x:b!.x+b!.width/2,y:b!.y+b!.height/2};
  if(browserName==='chromium') {
    const client=await page.context().newCDPSession(page);
    await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[start]});
    await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[end]});
    await client.send('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',touchPoints:[]});
    await client.detach();
  } else {
    // Firefox/WebKit use a real mouse pointer here. Capture its actual ID:
    // Firefox does not guarantee that a mouse pointer is numbered 1.
    if (cancel) {
      await page.evaluate(() => document.addEventListener('pointerdown', event => {
        document.documentElement.dataset.gesturePointerId = String(event.pointerId);
      }, { once: true, capture: true }));
    }
    await page.mouse.move(start.x,start.y);
    await page.mouse.down();
    await page.mouse.move(end.x,end.y,{steps:4});
    if (cancel) {
      const id = await page.locator('html').getAttribute('data-gesture-pointer-id');
      expect(id).not.toBeNull();
      // Send cancel to the captured button, not to an unrelated container.
      await from.dispatchEvent('pointercancel', {
        bubbles: true, pointerId: Number(id), pointerType: 'mouse', isPrimary: true,
      });
    }
    await page.mouse.up();
  }
}

test('wordsearch accepts a finger drag once, cancels safely and keeps two-tap input',async({page,browserName})=>{
  await page.goto('./#/jogar/wordsearch');
  const cells=page.locator('.wordsearch-grid button');
  const [first, second] = await visibleWordPaths(page);
  await expect(cells).toHaveCount(36);
  await expect(page.locator('.wordsearch-grid')).toHaveCSS('touch-action','none');
  await page.locator('.wordsearch-grid').scrollIntoViewIfNeeded();
  await drag(page,cells.nth(first.from),cells.nth(first.to),browserName,true);
  await expect(page.locator('.wordsearch-grid .found')).toHaveCount(0);
  await drag(page,cells.nth(first.from),cells.nth(first.to),browserName);
  await expect(page.locator('.wordsearch-grid .found')).toHaveCount(first.path.length);
  await expect(page.locator('.new-hud')).toContainText('500');
  await cells.nth(second.from).tap();await cells.nth(second.to).tap();
  await expect(page.locator('.wordsearch-grid .found')).toHaveCount(new Set([...first.path, ...second.path]).size);
  await expect(page.locator('.new-hud')).toContainText('1000');
});

test('slideblock moves a vehicle with direct drag and undo restores the board',async({page,browserName})=>{
  await page.goto('./#/jogar/slideblock');
  const cells=page.locator('.grid-slideblock button');
  await expect(cells).toHaveCount(36);
  await expect(cells.nth(22)).toHaveAttribute('data-value','3');
  await drag(page,cells.nth(21),cells.nth(20),browserName);
  await expect(cells.nth(22)).toHaveAttribute('data-value','0');
  await expect(page.locator('.new-hud strong').first()).toHaveText('1');
  await page.getByRole('button',{name:'Desfazer',exact:true}).click();
  await expect(cells.nth(22)).toHaveAttribute('data-value','3');
});

test('sokoban swipes advance one step and never stick after a cancelled gesture',async({page,browserName})=>{
  await page.goto('./#/jogar/sokoban');
  const cells=page.locator('.lc-grid .lc-square');
  await expect(cells).toHaveCount(49);
  await drag(page,cells.nth(12),cells.nth(19),browserName,true);
  await expect(cells.nth(12)).toHaveText('●');
  await drag(page,cells.nth(12),cells.nth(19),browserName);
  await expect(cells.nth(19)).toHaveText('●');
  await page.getByRole('button',{name:'Desfazer',exact:true}).click();
  await expect(cells.nth(12)).toHaveText('●');
});

test('jewel swipe performs one legal swap and consumes one move',async({page,browserName})=>{
  await page.goto('./#/jogar/match3');
  await page.getByRole('button',{name:'Iniciar sessão',exact:true}).click();
  const cells=page.locator('.jewel-board button');
  await expect(cells).toHaveCount(36);
  const values=await cells.evaluateAll(nodes=>nodes.map(node=>Number(node.getAttribute('aria-label')!.match(/tipo (\d+)/)![1])-1));
  let move:[number,number]|null=null;
  for(let i=0;i<36&&!move;i++) for(const j of [i+1,i+6]) if(j<36&&(j===i+6||Math.floor(i/6)===Math.floor(j/6))&&swapJewels(values,i,j)) {move=[i,j];break;}
  expect(move).not.toBeNull();
  await drag(page,cells.nth(move![0]),cells.nth(move![1]),browserName);
  await expect(page.getByRole('status').filter({hasText:'cascata'})).toContainText('9 jogadas');
});

test('mode cards configure the clock and preserve the active-session lock',async({page})=>{
  await page.goto('./#/jogar/memoria');
  const modes=page.getByRole('group',{name:'Escolha seu ritmo de partida'});
  await modes.getByRole('button',{name:/Sprint/}).tap();
  await expect(page.locator('[data-session-content]')).toHaveAttribute('inert','');
  await page.getByRole('button',{name:'Iniciar desafio de tempo',exact:true}).click();
  await expect(modes.getByRole('button',{name:/Livre/})).toBeDisabled();
  await expect(page.locator('[data-session-content]')).not.toHaveAttribute('inert','');
});

test('maze swipes follow a legal corridor by one step',async({page,browserName})=>{
  await page.goto('./#/jogar/labirinto');
  const cells=page.locator('.lc-grid .lc-square');
  await expect(cells).toHaveCount(121);
  await page.getByRole('button',{name:'Mostrar próximo passo',exact:true}).click();
  const target=await cells.evaluateAll(nodes=>nodes.findIndex(node=>node.classList.contains('lc-hint')));
  expect(target).toBeGreaterThanOrEqual(0);
  await drag(page,cells.nth(12),cells.nth(target),browserName);
  await expect(cells.nth(target)).toHaveText('●');
  await expect(page.getByRole('status').filter({hasText:'Passos:'})).toContainText('Passos: 1');
});

test('swipe discovery combines query and category and survives a reload',async({page})=>{
  await page.goto('./');
  await page.getByRole('button',{name:'Deslizar na tela',exact:true}).click();
  await expect(page.locator('.game-card').filter({hasText:'Caça-Palavras'})).toHaveCount(1);
  await expect(page.getByRole('link',{name:/^Jogar Xadrez/})).toHaveCount(0);
  await page.getByRole('textbox',{name:'Buscar jogo'}).fill('sokoban');
  await expect(page.locator('.game-card')).toHaveCount(1);
  await page.reload();
  await expect(page.getByRole('button',{name:'Deslizar na tela',exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.game-card')).toHaveCount(1);
});
