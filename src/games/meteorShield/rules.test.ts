import { describe, expect, it } from "vitest";
import { newMeteorGame, moveShield, advanceMeteor, undoMeteor, resetMeteor, nextMeteor, type Difficulty } from "./rules";

describe("Defensor de Meteoros — queda, reflexão e precisão", () => {
  it("cria 360 campanhas sem posições impossíveis nem cronômetro real", () => {
    for (const difficulty of [0, 1, 2] as const) for (let seed = 0; seed < 120; seed++) {
      const game = newMeteorGame(difficulty, seed);
      expect(game).toEqual(newMeteorGame(difficulty, seed));
      expect(game.schedule.length).toBe(4 + difficulty);
      expect(game.schedule.every(column => column >= 1 && column <= 5)).toBe(true);
      expect(game.shield).toBe(3);
      expect(game.initialHealth).toBe(3 - difficulty);
    }
  });
  it("reflete todos os 360 roteiros ao movimentar o escudo até cada alvo", () => {
    for (const difficulty of [0, 1, 2] as const) for (let seed = 0; seed < 120; seed++) {
      let game = newMeteorGame(difficulty, seed);
      for (let safe = 0; safe < 80 && game.phase === "playing"; safe++) {
        const target = game.schedule[Math.min(Math.floor(game.tick / 7), game.schedule.length - 1)];
        if (game.shield !== target) game = moveShield(game, game.shield < target ? 1 : -1);
        game = advanceMeteor(game);
      }
      expect(game.phase, `d=${difficulty} seed=${seed} ${game.message}`).toBe("won");
      expect(game.reflected).toBe(game.schedule.length);
      expect(game.health).toBe(game.initialHealth);
      expect(game.score).toBeGreaterThan(0);
      expect(advanceMeteor(game)).toBe(game);
      expect(undoMeteor(game).phase).toBe("playing");
    }
  });
  it("colisão sem reflexo causa dano e pode terminar em derrota", () => {
    let game = newMeteorGame(2, 0);
    for (let safe = 0; safe < 20 && game.phase === "playing"; safe++) game = advanceMeteor(game);
    expect(game.phase).toBe("lost");
    expect(game.health).toBe(0);
    expect(undoMeteor(game).phase).toBe("playing");
  });
  it("permite no máximo um movimento por turno, bloqueia bordas e reinicia", () => {
    const game = newMeteorGame(0, 7);
    const moved = moveShield(game, -1);
    expect(moved.shield).toBe(2);
    expect(moveShield(moved, -1)).toBe(moved);
    expect(moveShield(game, 0)).toBe(game);
    expect(undoMeteor(moved)).toEqual(game);
    expect(resetMeteor(moved)).toEqual(game);
    expect(nextMeteor(moved).seed).not.toBe(game.seed);
    expect(() => newMeteorGame(6 as Difficulty)).toThrow();
    expect(() => newMeteorGame(0, -1)).toThrow();
  });
});
