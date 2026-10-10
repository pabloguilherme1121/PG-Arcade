import {expect,test} from "@playwright/test";

test("Palavra Secreta aceita teclado touch e mostra pistas sem revelar a resposta",async({page})=>{
  await page.addInitScript(()=>{Math.random=()=>0;});
  await page.setViewportSize({width:320,height:740});
  await page.goto("./#/jogar/palavra");
  const input=page.getByLabel("Sua palavra",{exact:true});
  await expect(page.locator("[data-word-remaining]")).toHaveText("6");
  await expect(page.locator("[data-word-row]")).toHaveCount(6);
  for(const letter of ["P","O","R","T","A"])
    await page.getByRole("button",{name:"Letra "+letter,exact:true}).click();
  await expect(input).toHaveValue("PORTA");
  await page.getByRole("button",{name:"Testar palavra",exact:true}).click();
  await expect(page.locator("[data-word-key='P']")).toHaveAttribute("data-state","absent");
  await expect(page.locator("[data-word-key='O']")).toHaveAttribute("data-state","present");
  await expect(page.locator("[data-word-key='R']")).toHaveAttribute("data-state","correct");
  await expect(page.locator("[data-word-remaining]")).toHaveText("5");
  await page.getByRole("button",{name:"Letra C",exact:true}).click();
  await page.getByRole("button",{name:"Apagar letra",exact:true}).click();
  await expect(input).toHaveValue("");
  await input.fill("CARRO");
  await input.press("Enter");
  await expect(page.locator("#word-feedback")).toContainText("Acertou");
  await expect(page.locator("[data-word-key='C']")).toHaveAttribute("data-state","correct");
  await expect(page.getByRole("button",{name:"Letra C",exact:true})).toBeDisabled();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test("Palavra Secreta reinicia teclado e mantém o limite de quatro tentativas no móvel",async({page})=>{
  await page.addInitScript(()=>{Math.random=()=>0;});
  await page.setViewportSize({width:390,height:844});
  await page.goto("./#/jogar/palavra");
  await page.getByLabel("Desafio da palavra").selectOption("4");
  await expect(page.locator("[data-word-row]")).toHaveCount(4);
  await expect(page.locator("[data-word-remaining]")).toHaveText("4");
  const input=page.getByLabel("Sua palavra",{exact:true});
  await input.fill("PORTA");
  await input.press("Enter");
  await expect(page.locator("[data-word-key='P']")).toHaveAttribute("data-state","absent");
  await page.getByRole("button",{name:"Nova palavra",exact:true}).click();
  await expect(page.locator("[data-word-remaining]")).toHaveText("4");
  await expect(page.locator("[data-word-key='P']")).not.toHaveAttribute("data-state","absent");
  await expect(input).toHaveValue("");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
