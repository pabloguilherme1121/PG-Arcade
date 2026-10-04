import { describe, expect, it } from "vitest";
import {
  chooseTicTacToeBotMove,
  chooseTicTacToeBotMoveByDifficulty,
  getTicTacToeWinner,
  getTicTacToeWinningLine,
  getTicTacToeHintMove,
  getTicTacToePresetConfig,
  getTicTacToeAchievements,
  getTicTacToeStreakGoal,
  getTicTacToeStreakProgress,
  getTicTacToeWinRate,
  normalizeTicTacToeLifetimeStats,
  updateTicTacToeLifetimeStats,
  type TicTacToeBoard,
} from "./ticTacToe";

describe("ticTacToe", () => {
  it("detecta vitória em linha", () => {
    const board: TicTacToeBoard = [
      "X",
      "X",
      "X",
      null,
      "O",
      null,
      "O",
      null,
      null,
    ];
    expect(getTicTacToeWinner(board)).toBe("X");
  });

  it("prioriza vitória do bot antes de bloquear", () => {
    const board: TicTacToeBoard = [
      "O",
      "O",
      null,
      "X",
      "X",
      null,
      "X",
      null,
      null,
    ];
    expect(chooseTicTacToeBotMove(board)).toBe(2);
  });

  it("bloqueia uma vitória imediata do jogador", () => {
    const board: TicTacToeBoard = [
      "X",
      "X",
      null,
      null,
      "O",
      null,
      null,
      null,
      null,
    ];
    expect(chooseTicTacToeBotMove(board)).toBe(2);
  });

  it("prefere o centro quando não existe ameaça imediata", () => {
    const board: TicTacToeBoard = [
      "X",
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ];
    expect(chooseTicTacToeBotMove(board)).toBe(4);
  });
  it("expõe a linha vencedora para destacar o fechamento da rodada", () => {
    const board: TicTacToeBoard = [
      "O",
      null,
      "X",
      "O",
      "X",
      null,
      "O",
      null,
      null,
    ];
    expect(getTicTacToeWinningLine(board)).toEqual([0, 3, 6]);
  });

  it("no modo fácil escolhe entre as casas disponíveis usando a fonte aleatória recebida", () => {
    const board: TicTacToeBoard = [
      "X",
      null,
      "O",
      null,
      null,
      null,
      null,
      null,
      null,
    ];
    expect(chooseTicTacToeBotMoveByDifficulty(board, "easy", () => 0)).toBe(1);
    expect(chooseTicTacToeBotMoveByDifficulty(board, "easy", () => 0.99)).toBe(
      8,
    );
  });

  it("no modo impossível impede uma bifurcação clássica do jogador", () => {
    const board: TicTacToeBoard = [
      "X",
      null,
      null,
      null,
      "O",
      null,
      null,
      null,
      "X",
    ];
    expect([1, 3, 5, 7]).toContain(
      chooseTicTacToeBotMoveByDifficulty(board, "impossible"),
    );
  });
  it("expõe presets rápidos sem exigir várias decisões", () => {
    expect(getTicTacToePresetConfig("quick")).toEqual({
      mode: "bot",
      difficulty: "normal",
      seriesLength: 1,
    });
    expect(getTicTacToePresetConfig("competitive")).toEqual({
      mode: "bot",
      difficulty: "impossible",
      seriesLength: 3,
    });
    expect(getTicTacToePresetConfig("local")).toEqual({
      mode: "local",
      difficulty: "normal",
      seriesLength: 3,
    });
    expect(getTicTacToePresetConfig("survival")).toEqual({
      mode: "bot",
      difficulty: "impossible",
      seriesLength: 5,
    });
  });

  it("oferece uma dica estratégica para o jogador atual", () => {
    const board: TicTacToeBoard = [
      "X",
      "X",
      null,
      "O",
      null,
      null,
      null,
      "O",
      null,
    ];
    expect(getTicTacToeHintMove(board, "X")).toBe(2);
  });

  it("atualiza estatísticas persistentes e mantém a melhor sequência", () => {
    const first = updateTicTacToeLifetimeStats(undefined, "player");
    const second = updateTicTacToeLifetimeStats(first, "player");
    const third = updateTicTacToeLifetimeStats(second, "bot");

    expect(first).toMatchObject({
      games: 1,
      wins: 1,
      currentWinStreak: 1,
      bestWinStreak: 1,
    });
    expect(second).toMatchObject({
      games: 2,
      wins: 2,
      currentWinStreak: 2,
      bestWinStreak: 2,
    });
    expect(third).toMatchObject({
      games: 3,
      wins: 2,
      losses: 1,
      currentWinStreak: 0,
      bestWinStreak: 2,
    });
  });

  it("libera conquistas a partir do histórico real", () => {
    expect(
      getTicTacToeAchievements({
        games: 5,
        wins: 3,
        losses: 0,
        draws: 2,
        currentWinStreak: 3,
        bestWinStreak: 3,
        hintsUsed: 3,
        perfectWins: 1,
      }),
    ).toEqual(
      expect.arrayContaining([
        "primeira-vitoria",
        "trinca",
        "invicto",
        "sem-ajuda",
        "estrategista",
      ]),
    );
  });

  it("calcula taxa de vitória e métricas de progressão", () => {
    const stats = updateTicTacToeLifetimeStats(undefined, "player", {
      usedHint: true,
      perfectWin: false,
    });
    expect(stats).toMatchObject({
      games: 1,
      wins: 1,
      hintsUsed: 1,
      perfectWins: 0,
    });
    expect(getTicTacToeWinRate(stats)).toBe(100);
  });

  it("define metas de sequência e limita o progresso visual a 100%", () => {
    expect(getTicTacToeStreakGoal(0)).toBe(3);
    expect(getTicTacToeStreakGoal(3)).toBe(5);
    expect(getTicTacToeStreakGoal(5)).toBe(10);
    expect(getTicTacToeStreakProgress(3, 5)).toBe(60);
    expect(getTicTacToeStreakProgress(12, 10)).toBe(100);
  });

  it("migra estatísticas antigas sem transformar campos novos em NaN", () => {
    const migrated = normalizeTicTacToeLifetimeStats({
      games: 4,
      wins: 2,
      losses: 1,
      draws: 1,
      currentWinStreak: 1,
      bestWinStreak: 2,
    });
    expect(migrated).toMatchObject({
      games: 4,
      wins: 2,
      hintsUsed: 0,
      perfectWins: 0,
    });
    expect(
      updateTicTacToeLifetimeStats(migrated, "player", { perfectWin: true }),
    ).toMatchObject({
      games: 5,
      wins: 3,
      perfectWins: 1,
    });
  });
  it("permite ao bot calcular corretamente quando joga com X", () => {
    const board: TicTacToeBoard = [
      "X",
      "X",
      null,
      "O",
      "O",
      null,
      null,
      null,
      null,
    ];
    expect(
      chooseTicTacToeBotMoveByDifficulty(board, "normal", () => 0.5, "X"),
    ).toBe(2);
  });
});
