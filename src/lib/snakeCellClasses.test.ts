import { describe, expect, it } from "vitest";
import { snakeCellClasses } from "./snakeCellClasses";
import { snakeFood, type Point } from "./engines";

describe("Snake: renderização de células e distribuição de frutas", () => {
  it("mapeia o tabuleiro de 16×16 com prioridade para cabeça e comida", () => {
    const body: Point[] = [{ x: 7, y: 8 }, { x: 6, y: 8 }, { x: 5, y: 8 }];
    const classes = snakeCellClasses(body, { x: 11, y: 8 }, 16);
    expect(classes).toHaveLength(256);
    expect(classes[8 * 16 + 7]).toBe("snake-head");
    expect(classes[8 * 16 + 6]).toBe("snake-body");
    expect(classes[8 * 16 + 5]).toBe("snake-body");
    expect(classes[8 * 16 + 11]).toBe("snake-food");
    expect(classes[0]).toBe("");
  });
  it("não muta a cobra e resolve comida ausente e corpo cobrindo a comida", () => {
    const body: Point[] = [{ x: 0, y: 0 }, { x: 1, y: 0 }];
    const copy = JSON.stringify(body);
    expect(snakeCellClasses(body, null, 2)).toEqual(["snake-head", "snake-body", "", ""]);
    expect(snakeCellClasses(body, { x: 1, y: 0 }, 2)).toEqual(["snake-head", "snake-body", "", ""]);
    expect(JSON.stringify(body)).toBe(copy);
  });
  it("a fruta usa a mesma seleção determinística sem cair no corpo", () => {
    const body: Point[] = [{ x: 1, y: 0 }, { x: 0, y: 0 }];
    expect(snakeFood(body, 2, () => 0)).toEqual({ x: 2 % 2, y: 1 });
    expect(snakeFood(body, 2, () => 0.99)).toEqual({ x: 1, y: 1 });
  });
  it("tabuleiro cheio termina em vitória sem tentar sortear fruta", () => {
    const body: Point[] = Array.from({ length: 256 }, (_, i) => ({ x: i % 16, y: Math.floor(i / 16) }));
    expect(snakeFood(body, 16, () => { throw new Error("não deve sortear sem células livres"); })).toBeNull();
    const classes = snakeCellClasses(body, null, 16);
    expect(classes.filter(Boolean)).toHaveLength(256);
  });
});
