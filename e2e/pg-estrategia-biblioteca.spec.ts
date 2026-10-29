import {test,expect} from '@playwright/test';
test.use({hasTouch:true});

for(const width of [320,390]){
 test('PG Estratégia: biblioteca filtra sem reconstruir 47 links e abre jogo sob demanda em '+width+'px',async({page})=>{
   await page.setViewportSize({width,height:740});
   await page.goto('./estrategia/#classicos');
   await expect(page.locator('#classics-list a')).toHaveCount(47);
   await expect(page.locator('#classic-game-frame')).not.toHaveAttribute('src',/jogar/);
   const game=page.locator('#classics-list a[data-arcade-game="xadrez"]');
   await game.evaluate(node=>node.setAttribute('data-stable-test','yes'));
   await page.getByRole('searchbox',{name:'Buscar jogos de estratégia'}).fill('XADREZ');
   await expect(page.locator('#classic-count')).toHaveText('1 jogo encontrado');
   await expect(game).toBeVisible();
   await expect(game).toHaveAttribute('data-stable-test','yes');
   await game.tap();
   await expect(page.locator('#classic-player')).toBeVisible();
   await expect(page.locator('#classic-game-frame')).toHaveAttribute('src','../#/jogar/xadrez');
   await expect(page.locator('#classic-open-new')).toHaveAttribute('href','../#/jogar/xadrez');
   await page.locator('#classic-player-bot summary').click();
   await expect(page.locator('#classic-bot-tip')).toContainText('PG Bot · Xadrez');
   await page.locator('#classic-player-close').click();
   await expect(page.locator('#classic-player')).not.toBeVisible();
   await expect(page.locator('#classic-game-frame')).not.toHaveAttribute('src',/jogar/);
   await expect(game).toBeFocused();
   await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
test('PG Estratégia: link profundo abre o jogo e ignora IDs inválidos',async({page})=>{
 await page.goto('./estrategia/?arcade=domino#classicos');
 await expect(page.locator('#classic-player')).toBeVisible();
 await expect(page.locator('#classic-game-frame')).toHaveAttribute('src','../#/jogar/domino');
 await page.locator('#classic-player-close').click();
 await page.goto('./estrategia/?arcade=__proto__#classicos');
 await expect(page.locator('#classic-player')).not.toBeVisible();
 await expect(page.locator('#classic-game-frame')).not.toHaveAttribute('src',/jogar/);
});
test('PG Arcade: aba Estratégia oferece central com 47 jogos, sem remover os favoritos',async({page})=>{
 await page.goto('./');
 const filter=page.locator('.filters button').filter({hasText:/^Estratégia\s/}).first();
 await filter.click();
 const hub=page.getByRole('link',{name:/Abrir PG Estratégia.*47 jogos/i});
 await expect(hub).toHaveAttribute('href',/estrategia\/#classicos$/);
 await hub.click();
 await expect(page).toHaveURL(/\/estrategia\/#classicos$/);
 await expect(page.locator('#classics-list a')).toHaveCount(47);
});


test('Biblioteca de estratégia realmente abre o motor Arcade e preserva favoritos no mesmo domínio',async({page})=>{
 await page.setViewportSize({width:390,height:800});
 await page.goto('./estrategia/');
 await page.locator('#classics-list a[data-arcade-game="xadrez"]').click();
 const arcade=page.frameLocator('#classic-game-frame');
 await expect(arcade.locator('[data-current-game="xadrez"]')).toBeVisible();
 await expect(arcade.getByRole('link',{name:'Jogar no PG Estratégia'})).toHaveCount(0);
 await arcade.locator('.player-utilities summary').click();
 await arcade.getByRole('button',{name:'Favoritar',exact:true}).click();
 await expect(arcade.getByRole('button',{name:'Favoritado',exact:true})).toBeVisible();
 await page.locator('#classic-player-close').click();
 await page.goto(new URL('../#/jogar/xadrez',page.url()).href);
 await page.locator('.player-utilities summary').click();
 await expect(page.getByRole('button',{name:'Favoritado',exact:true})).toBeVisible();
});


test('Arcade: jogo estratégico tem atalho direto para o mesmo jogo no PG Estratégia',async({page})=>{
 await page.goto('./#/jogar/xadrez');
 const link=page.getByRole('link',{name:'Jogar no PG Estratégia'});
 await expect(link).toHaveAttribute('href',/estrategia\/\?arcade=xadrez#classicos$/);
 await link.click();
 await expect(page).toHaveURL(/\/estrategia\/\?arcade=xadrez#classicos$/);
 await expect(page.locator('#classic-player')).toBeVisible();
 await expect(page.locator('#classic-game-frame')).toHaveAttribute('src','../#/jogar/xadrez');
});
test('PG Estratégia: continuar último jogo abre o título salvo sem cadastro',async({page})=>{
 await page.goto('./estrategia/');
 const resume=page.locator('#classic-continue');
 await expect(resume).toBeHidden();
 await page.locator('#classics-list a[data-arcade-game="domino"]').click();
 await page.locator('#classic-player-close').click();
 await expect(resume).toBeVisible();
 await page.reload();
 await expect(resume).toContainText('Dominó');
 await resume.click();
 await expect(page.locator('#classic-game-frame')).toHaveAttribute('src','../#/jogar/domino');
});
