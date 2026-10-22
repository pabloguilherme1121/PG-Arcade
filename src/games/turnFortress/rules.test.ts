import { describe, expect, it } from "vitest";
import {
  newFortressGame, advanceFortress, undoFortress, resetFortress, nextFortress,
  type Difficulty,
} from "./rules";

describe("Fortalezas de Turnos — posicionamento, recursos e ondas", () => {
  it("gera 360 campanhas com orçamentos, ondas e linhas determinísticas", () => {
    for (const difficulty of [0, 1, 2] as const) for (let seed = 0; seed < 120; seed++) {
      const game = newFortressGame(difficulty, seed);
      expect(game).toEqual(newFortressGame(difficulty, seed));
      expect(game.waves.length).toBe(6 + difficulty * 2);
      expect(game.resources).toBe(6 + difficulty);
      expect(game.waves.every(w => w.lane >= 0 && w.lane <= 2 && w.hp >= 1 && w.hp <= 3)).toBe(true);
      expect(new Set(game.waves.slice(0, 3).map(w => w.lane)).size).toBe(3);
    }
  });

  it("uma defesa de arcos ordenada por linha segura as 360 campanhas sem danos", () => {
    for (const difficulty of [0, 1, 2] as const) for (let seed = 0; seed < 120; seed++) {
      let game = newFortressGame(difficulty, seed);
      for (const wave of game.waves.slice(0, 3)) {
        game = advanceFortress(game, { kind: "arco", lane: wave.lane });
      }
      for (let safety = 0; safety < 30 && game.phase === "playing"; safety++) {
        game = advanceFortress(game, { kind: "esperar" });
      }
      expect(game.phase, `difficulty=${difficulty} seed=${seed}`).toBe("won");
      expect(game.health).toBe(game.initialHealth);
      expect(game.units).toHaveLength(3);
      expect(advanceFortress(game, { kind: "esperar" })).toBe(game);
      expect(undoFortress(game).phase).toBe("playing");
    }
  });

  it("sem defensores a fortaleza pode perder e as decisões podem ser desfeitas", () => {
    let game = newFortressGame(0, 0);
    const untouched = game;
    expect(advanceFortress(game, { kind: "arco", lane: -1 })).toBe(game);
    expect(advanceFortress(game, { kind: "canhao", lane: 3 })).toBe(game);
    for (let safety = 0; safety < 30 && game.phase === "playing"; safety++) {
      game = advanceFortress(game, { kind: "esperar" });
    }
    expect(game.phase).toBe("lost");
    expect(game.health).toBe(0);
    expect(undoFortress(game).phase).toBe("playing");
    expect(resetFortress(game)).toEqual(untouched);
    expect(nextFortress(game).seed).not.toBe(untouched.seed);
  });

  it("não permite comprar unidades sem recurso e não concede vitória antes da última onda", () => {
    let game = newFortressGame(0, 0);
    game = advanceFortress(game, { kind: "canhao", lane: game.waves[0].lane });
    expect(game.resources).toBe(3);
    const otherLane = (game.waves[0].lane + 1) % 3;
    const second = advanceFortress(game, { kind: "canhao", lane: otherLane });
    expect(second.resources).toBe(0);
    expect(advanceFortress(second, { kind: "arco", lane: 2 })).toBe(second);
    expect(second.phase).toBe("playing");
    expect(undoFortress(second).resources).toBe(3);
    expect(() => newFortressGame(9 as Difficulty)).toThrow();
    expect(() => newFortressGame(0, -1)).toThrow();
  });
});
