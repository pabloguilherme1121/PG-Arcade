import { describe, expect, it } from "vitest";
import {
  newRelayGame, relaySolution, toggleRelay, relayCoverage, undoRelay,
  resetRelay, nextRelay, isRelayPad,
} from "./rules";

describe("Rede de Relés — conectividade, cobertura e orçamento", () => {
  it("gera 360 desafios determinísticos e solucionáveis, em três tamanhos", () => {
    for (const difficulty of [0, 1, 2] as const) {
      for (let seed = 0; seed < 120; seed++) {
        const initial = newRelayGame(difficulty, seed);
        expect(initial).toEqual(newRelayGame(difficulty, seed));
        expect(initial.size).toBe(5 + difficulty);
        expect(initial.budget).toBe(3 + difficulty);
        expect(initial.devices).toHaveLength(3 + difficulty);
        expect(new Set(initial.pads).size).toBe(initial.pads.length);
        expect(initial.devices.every(i => i >= 0 && i < initial.size ** 2)).toBe(true);
        let game = initial;
        for (const pad of relaySolution(initial)) game = toggleRelay(game, pad);
        expect(game.phase).toBe("won");
        expect(relayCoverage(game).served).toBe(initial.devices.length);
        expect(relayCoverage(game).isolated).toBe(0);
        expect(game.relays).toHaveLength(initial.budget);
        expect(toggleRelay(game, game.relays[0])).toBe(game);
        expect(undoRelay(game).phase).toBe("playing");
      }
    }
  });

  it("um relé desconectado não alimenta o dispositivo vizinho", () => {
    const initial = newRelayGame(0, 0);
    const last = relaySolution(initial).at(-1)!;
    const disconnected = toggleRelay(initial, last);
    expect(disconnected.phase).toBe("playing");
    expect(relayCoverage(disconnected).connected).toBe(0);
    expect(relayCoverage(disconnected).served).toBe(0);
    expect(relayCoverage(disconnected).isolated).toBe(1);
  });

  it("rejeita relés fora dos pontos válidos, respeita orçamento e permite desfazer", () => {
    const initial = newRelayGame(0, 0);
    expect(isRelayPad(initial, -1)).toBe(false);
    expect(toggleRelay(initial, -1)).toBe(initial);
    expect(toggleRelay(initial, initial.base)).toBe(initial);
    const a = toggleRelay(initial, relaySolution(initial)[0]);
    expect(a.relays).toHaveLength(1);
    expect(toggleRelay(a, relaySolution(initial)[0]).relays).toHaveLength(0);
    expect(undoRelay(a).relays).toEqual([]);
    expect(resetRelay(a)).toEqual(initial);
    expect(nextRelay(a).seed).not.toBe(initial.seed);
    expect(() => newRelayGame(0, -1)).toThrow();
    expect(() => newRelayGame(7 as never, 2)).toThrow();
  });

  it("um orçamento preenchido com relés inúteis não concede vitória", () => {
    let game = newRelayGame(0, 0);
    const solution = relaySolution(game);
    const decoy = game.pads.find(p => !solution.includes(p))!;
    game = toggleRelay(game, solution[0]);
    game = toggleRelay(game, decoy);
    game = toggleRelay(game, solution[1]);
    expect(game.phase).toBe("playing");
    expect(relayCoverage(game).served).toBeLessThan(game.devices.length);
    expect(toggleRelay(game, solution[2])).toBe(game);
    expect(undoRelay(game).relays).toHaveLength(2);
  });
});
