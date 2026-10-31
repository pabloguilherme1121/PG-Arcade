import {test,expect} from "@playwright/test";
test("Snake mantém rolagem normal parado e reserva gestos ao tabuleiro em jogo",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto("./#/jogar/snake");
 const board=page.locator(".snake-board");
 await expect(board).toBeVisible();
 await expect.poll(()=>board.evaluate(el=>getComputedStyle(el).touchAction)).toBe("pan-y");
 await page.getByRole("button",{name:"Jogar",exact:true}).click();
 await expect(board).toHaveAttribute("data-play-status","running");
 await expect.poll(()=>board.evaluate(el=>getComputedStyle(el).touchAction)).toBe("none");
 await page.getByRole("button",{name:"Pausar",exact:true}).click();
 await expect(board).toHaveAttribute("data-play-status","paused");
 await expect.poll(()=>board.evaluate(el=>getComputedStyle(el).touchAction)).toBe("pan-y");
 await page.getByRole("button",{name:"Continuar",exact:true}).click();
 await expect.poll(()=>board.evaluate(el=>getComputedStyle(el).touchAction)).toBe("none");
 await page.getByRole("button",{name:"Nova partida"}).click();
 await expect(board).toHaveAttribute("data-play-status","ready");
 await expect.poll(()=>board.evaluate(el=>getComputedStyle(el).touchAction)).toBe("pan-y");
});
