import { describe, expect, it } from "vitest";
import { reactionPoints, reactionSummary } from "./reactionFeedback";

describe("Reflexo Rápido — pontuação e estatísticas", () => {
  it("preserva a pontuação original por velocidade e dificuldade", () => {
    expect(reactionPoints(0, 1000)).toBe(1000);
    expect(reactionPoints(200, 1000)).toBe(800);
    expect(reactionPoints(600, 600)).toBe(0);
    expect(reactionPoints(2000, 1000)).toBe(0);
    expect(reactionPoints(140, 1400)).toBe(900);
  });
  it("resume somente reações válidas, sem contar largadas antecipadas", () => {
    expect(reactionSummary([])).toEqual({ best: null, average: null });
    expect(reactionSummary([280])).toEqual({ best: 280, average: 280 });
    expect(reactionSummary([280, 350, 301])).toEqual({ best: 280, average: 310 });
  });
});
