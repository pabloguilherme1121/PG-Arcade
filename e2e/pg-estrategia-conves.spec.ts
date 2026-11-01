import {test,expect} from "@playwright/test";
const route="./estrategia/independentes/conves-modular/?seed=11";
async function followHint(page:any){
 await page.getByRole("button",{name:"Pedir dica"}).click();
 const msg=await page.locator("#hint-text").textContent();
 const found=msg?.match(/Dica: coloque o módulo ([A-Z]) na coluna (\d+), linha (\d+)(, girado)?/);
 expect(found).toBeTruthy();
 await page.getByRole("button",{name:new RegExp("Módulo "+found![1]+",")}).click();
 if(found![4])await page.getByRole("button",{name:/Girar módulo/}).click();
 await page.locator('#board .tile[data-x="'+(Number(found![2])-1)+'"][data-y="'+(Number(found![3])-1)+'"]').click();
}
for(const width of [320,390,1200]){
 test("Convés: seleção, pausa, desfazer, PG Bot e ausência de overflow em "+width+"px",async({page})=>{
  await page.setViewportSize({width,height:800});await page.goto(route);
  await expect(page.getByRole("heading",{name:"Convés Modular"})).toBeVisible();
  await expect(page.locator("#board .tile")).toHaveCount(16);
  await followHint(page);
  await expect(page.locator("#moves")).toHaveText("1/17");
  await page.getByRole("button",{name:"Desfazer"}).click();
  await expect(page.locator("#moves")).toHaveText("2/17");
  await page.getByRole("button",{name:"Pausar"}).click();
  await expect(page.getByRole("button",{name:"Pedir dica"})).toBeDisabled();
  await page.getByRole("button",{name:"Retomar"}).click();
  await page.locator("#pg-bot summary").click();
  await page.getByRole("button",{name:"Situação"}).click();
  await expect(page.locator("#bot-answer")).toContainText("manobras restantes");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
test("Convés: dicas calculadas levam à vitória no modo equilíbrio e recorde persiste",async({page})=>{
 await page.goto(route);await page.locator("#mode").selectOption("equilibrio");
 await page.locator("#difficulty").selectOption("veterano");
 await expect(page.locator("#board .tile")).toHaveCount(36);
 for(let i=0;i<6;i++)await followHint(page);
 await expect(page.locator("#phase")).toHaveText("Vitória");
 await expect(page.locator("#balance")).not.toContainText("/ livre");
 await expect(page.locator("#record")).toContainText("pontos");
 const record=await page.locator("#record").textContent();
 await page.reload();await expect(page.locator("#record")).toHaveText(record!);
});
test("Convés: dados corrompidos não bloqueiam a partida e teclado funciona",async({page})=>{
 await page.addInitScript(()=>{localStorage.setItem("pg-conves-recordes-v1","malformado");localStorage.setItem("pg-conves-config-v1","false");});
 const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto(route);
 const free=page.locator('#board .tile[data-kind="free"]').first();
 await free.focus();await expect(free).toBeFocused();
 await page.keyboard.press("Enter");
 await expect(page.locator("#moves")).toContainText("/17");
 expect(errors).toEqual([]);
});
test("Convés: shell e controles permanecem disponíveis offline",async({page,context})=>{
 await page.goto(route);await page.waitForFunction(()=>Boolean(navigator.serviceWorker?.controller));
 await page.reload();await context.setOffline(true);await page.reload();
 await expect(page.getByRole("heading",{name:"Convés Modular"})).toBeVisible();
 await followHint(page);await expect(page.locator("#moves")).toHaveText("1/17");
 await context.setOffline(false);
});