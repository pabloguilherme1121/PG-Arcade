import { describe, expect, it } from "vitest";
import { createFruitGame, startFruitGame, dropFruit, pauseFruitGame, resumeFruitGame, fruitSize, type FruitState } from "./engine";

describe("Frutas em Fusão: regras originais e reprodutíveis", () => {
  it("cria a mesma partida para a mesma semente, com dificuldade real", () => {
    expect(createFruitGame("normal", 23)).toEqual(createFruitGame("normal", 23));
    expect(createFruitGame("easy", 23).turnLimit).toBeGreaterThan(createFruitGame("hard", 23).turnLimit);
    expect(startFruitGame(createFruitGame("normal", 23)).phase).toBe("playing");
    expect(createFruitGame("normal", 23).cells).toHaveLength(fruitSize.width * fruitSize.height);
  });
  it("solta uma fruta na linha inferior e ignora comandos ilegais, pausados e duplicados", () => {
    const first=startFruitGame(createFruitGame("normal", 3));
    const after=dropFruit(first,2);
    expect(after.cells[(fruitSize.height-1)*fruitSize.width+2]).toBe(1);
    expect(after.turn).toBe(1);
    expect(first.cells.every(x=>x===0)).toBe(true);
    expect(dropFruit(after,-1)).toBe(after);
    expect(dropFruit(after,2.3)).toBe(after);
    const paused=pauseFruitGame(after);
    expect(dropFruit(paused,1)).toBe(paused);
    expect(resumeFruitGame(paused).phase).toBe("playing");
    expect(resumeFruitGame(after)).toBe(after);
  });
  it("junta frutos iguais lado a lado, aplica gravidade e acumula pontos", () => {
    const state=startFruitGame(createFruitGame("normal", 9));
    const placed={...state,cells:state.cells.map((v,i)=>i===6*6+1?1:v)} satisfies FruitState;
    const after=dropFruit(placed,0);
    expect(after.cells[6*6]).toBe(2);
    expect(after.cells[6*6+1]).toBe(0);
    expect(after.score).toBe(20);
    expect(after.turn).toBe(1);
    expect(placed.cells[6*6+1]).toBe(1);
  });
  it("permite reações em cadeia, mantendo cada fruto em somente uma casa", () => {
    const state=startFruitGame(createFruitGame("normal", 9));
    const cells=[...state.cells];
    cells[6*6+0]=2;
    cells[6*6+1]=1;
    const chained=dropFruit({...state,cells},1);
    expect(chained.cells[6*6]).toBe(3);
    expect(chained.score).toBe(60);
    expect(chained.cells.filter(x=>x>0)).toHaveLength(1);
  });
  it("termina por limite sem dar jogadas grátis e aceita vitória quando gera tier 6", () => {
    const base=startFruitGame(createFruitGame("hard", 9));
    const nearEnd={...base,turn:base.turnLimit-1};
    const completed=dropFruit(nearEnd,0);
    expect(completed.phase).toBe("lost");
    expect(dropFruit(completed,1)).toBe(completed);
    const cells=[...base.cells];
    cells[6*6+0]=5;
    cells[6*6+1]=5;
    const won=dropFruit({...base,cells,next:1},2);
    expect(won.phase).toBe("won");
    expect(won.cells).toContain(6);
    expect(dropFruit(won,0)).toBe(won);
  });
});
