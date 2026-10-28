import { describe, expect, it } from "vitest";
import { STRATEGY_MISSIONS, newStrategySession, playCell, playWave, missionById } from "./strategyEngine";

describe("PG Estratégia — 150 operações jogáveis", () => {
  it("publica 150 IDs únicos e cinco famílias de mecânicas, sem dados fictícios no catálogo principal", () => {
    expect(STRATEGY_MISSIONS).toHaveLength(150);
    expect(new Set(STRATEGY_MISSIONS.map(m => m.id)).size).toBe(150);
    expect(new Set(STRATEGY_MISSIONS.map(m => m.family)).size).toBe(5);
    for (const mission of STRATEGY_MISSIONS) {
      expect(missionById(mission.id)).toEqual(mission);
      expect(mission.obstacles).not.toContain(0);
      expect(mission.obstacles).not.toContain(35);
      expect(mission.budget).toBeGreaterThan(0);
    }
    expect(missionById("inexistente")).toBeUndefined();
  });
  it("permite completar toda missão territorial e logística pela rota segura", () => {
    for (const mission of STRATEGY_MISSIONS.filter(m => ["territorio", "rotas"].includes(m.family))) {
      let state = newStrategySession(mission);
      for (const cell of [1, 2, 3, 4, 5, 11, 17, 23, 29, 35]) state = playCell(state, mission, cell);
      expect(state.phase, mission.id).toBe("won");
    }
  });
  it("exploração exige coleta de suprimentos e saída, preservando energia de deslocamento", () => {
    for (const mission of STRATEGY_MISSIONS.filter(m => m.family === "exploracao")) {
      let state = newStrategySession(mission);
      for (const cell of [1, 2, 3, 4, 5, 11, 17, 23, 29, 35]) state = playCell(state, mission, cell);
      expect(state.phase, mission.id).toBe("won");
      expect(state.collected).toEqual([3, 23]);
    }
  });
  it("produção vence ao atingir a meta, sem permitir construções duplicadas", () => {
    for (const mission of STRATEGY_MISSIONS.filter(m => m.family === "economia")) {
      let state = newStrategySession(mission);
      const free = Array.from({ length: 36 }, (_, i) => i).filter(i => !mission.obstacles.includes(i));
      const first = free[0];
      state = playCell(state, mission, first, "fazenda");
      expect(playCell(state, mission, first, "mercado")).toEqual(state);
      for (const cell of free.slice(1)) {
        if (state.phase !== "playing") break;
        state = playCell(state, mission, cell, "fazenda");
      }
      expect(state.phase, mission.id).toBe("won");
    }
  });
  it("defesa exige proteger a base e três ondas; não permite ações depois da vitória", () => {
    const mission = STRATEGY_MISSIONS.find(m => m.family === "defesa")!;
    let state = newStrategySession(mission);
    for (const cell of [4, 10, 16, 22, 28]) {
      if (!mission.obstacles.includes(cell)) state = playCell(state, mission, cell, "torre");
    }
    for (let wave = 0; wave < 3; wave++) state = playWave(state, mission);
    expect(["won", "lost"]).toContain(state.phase);
    expect(state.wave).toBeGreaterThan(0);
    if (state.phase !== "playing") {
      expect(playCell(state, mission, 0)).toEqual(state);
      expect(playWave(state, mission)).toEqual(state);
    }
  });
  it("rejeita ações inválidas, bloqueadas e distantes sem consumir recursos", () => {
    const mission = STRATEGY_MISSIONS.find(m => m.family === "territorio")!;
    const state = newStrategySession(mission);
    expect(playCell(state, mission, -1)).toEqual(state);
    expect(playCell(state, mission, 36)).toEqual(state);
    expect(playCell(state, mission, 35)).toEqual(state);
    expect(playCell(state, mission, 0)).toEqual(state);
  });
});
