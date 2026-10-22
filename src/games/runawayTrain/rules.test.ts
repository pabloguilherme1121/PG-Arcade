import { describe, expect, it } from "vitest";
import {
  newTrainGame, toggleRailSwitch, advanceTrain, undoTrain, resetTrain,
  nextTrain, type Difficulty,
} from "./rules";

describe("Trem Sem Freio — tráfego, cruzamentos e estações", () => {
  it("gera 360 itinerários determinísticos com estações alternadas", () => {
    for (const difficulty of [0, 1, 2] as const) for (let seed = 0; seed < 120; seed++) {
      const game = newTrainGame(difficulty, seed);
      expect(game).toEqual(newTrainGame(difficulty, seed));
      expect(game.schedule).toHaveLength(3 + difficulty);
      expect(game.flipBudget).toBe(2 * game.schedule.length);
      expect(game.schedule.every(t => [0, 1].includes(t.startLane) && [0, 1].includes(t.destination))).toBe(true);
      expect(game.schedule.every((t, i) => i === 0 || t.destination !== game.schedule[i - 1].destination)).toBe(true);
    }
  });

  it("vence 360 desafios corrigindo o desvio no instante de cada trem", () => {
    for (const difficulty of [0, 1, 2] as const) for (let seed = 0; seed < 120; seed++) {
      let game = newTrainGame(difficulty, seed);
      for (let step = 0; step < 36 && game.phase === "playing"; step++) {
        const entering = game.trains.find(train => train.position === 1);
        if (entering) {
          const needsSwitch = entering.lane !== entering.destination;
          if (game.switches[0] !== needsSwitch) game = toggleRailSwitch(game, 0);
        }
        game = advanceTrain(game);
      }
      expect(game.phase, `d=${difficulty} seed=${seed} ${game.message}`).toBe("won");
      expect(game.delivered).toBe(game.schedule.length);
      expect(game.collisions).toBe(0);
      expect(game.flips).toBeLessThanOrEqual(game.flipBudget);
      expect(advanceTrain(game)).toBe(game);
      expect(undoTrain(game).phase).toBe("playing");
    }
  });

  it("detecta colisão real na estação quando dois trens vão para a mesma linha", () => {
    let game = newTrainGame(0, 0);
    for (let i = 0; i < 20 && game.phase === "playing"; i++) {
      game = advanceTrain(game);
    }
    expect(game.phase).toBe("lost");
    expect(game.collisions).toBeGreaterThan(0);
    expect(game.message).toMatch(/colis/i);
  });

  it("bloqueia mudanças fora dos desvios, contabiliza orçamento e reinicia", () => {
    const original = newTrainGame(0, 17);
    expect(toggleRailSwitch(original, -1)).toBe(original);
    expect(toggleRailSwitch(original, 2)).toBe(original);
    const flipped = toggleRailSwitch(original, 1);
    expect(flipped.switches).toEqual([false, true]);
    expect(flipped.flips).toBe(1);
    expect(undoTrain(flipped)).toEqual(original);
    expect(resetTrain(flipped)).toEqual(original);
    expect(nextTrain(flipped).seed).not.toBe(original.seed);
    expect(() => newTrainGame(9 as Difficulty)).toThrow();
    expect(() => newTrainGame(0, -1)).toThrow();
  });
});
