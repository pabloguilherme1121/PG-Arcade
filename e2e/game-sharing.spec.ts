import { expect, test } from '@playwright/test';

for (const outcome of ['native', 'cancel', 'fallback'] as const) {
  test(`public game sharing handles ${outcome} at mobile width`, async ({page}) => {
    await page.setViewportSize({width:320,height:740});
    await page.addInitScript((outcome) => {
      const calls: {shared?:ShareData; copied?:string} = {};
      Object.assign(window, {shareCalls:calls});
      Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async(text:string)=>{calls.copied=text;}}});
      Object.defineProperty(navigator,'share',{configurable:true,value:outcome === 'fallback' ? undefined : async(data:ShareData)=>{
        if(outcome === 'cancel') throw new DOMException('dismissed','AbortError');
        calls.shared=data;
      }});
    },outcome);
    await page.goto('./?private=must-not-share#/jogar/xadrez');
    await page.getByText('Opções da partida',{exact:true}).click();
    await page.getByRole('button',{name:'Compartilhar jogo',exact:true}).click();
    const calls = await page.evaluate(()=> (window as unknown as {shareCalls:{shared?:ShareData;copied?:string}}).shareCalls);
    if(outcome==='cancel') expect(calls).toEqual({});
    else {
      const url=outcome==='native'?calls.shared!.url:calls.copied;
      expect(url).toBeDefined();
      expect(new URL(url!).search).toBe('');
      expect(new URL(url!).hash).toBe('#/jogar/xadrez');
      if(outcome==='native') expect(calls.copied).toBeUndefined();
      await expect(page.getByText(outcome==='native'?'Compartilhamento concluído.':'Link do jogo copiado.',{exact:true})).toBeVisible();
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
    await expect(page.getByRole('button',{name:'Compartilhar jogo',exact:true})).toBeEnabled();
  });
}

test('a failed sharing chunk preserves the player controls',async({page})=>{
  await page.route('**/ShareGameButton-*.js',route=>route.abort());
  await page.goto('./#/jogar/xadrez');
  await page.getByText('Opções da partida',{exact:true}).click();
  await expect(page.getByText('Copie o endereço da barra do navegador para compartilhar este jogo.',{exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Reiniciar com confirmação',exact:true})).toBeEnabled();
  await expect(page.getByRole('button',{name:'Favoritar',exact:true})).toBeEnabled();
  await expect(page.getByText('O jogo não carregou.',{exact:true})).toHaveCount(0);
});
