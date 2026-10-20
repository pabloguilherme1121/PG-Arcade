import { describe, expect, it } from "vitest";
import { createVault, revealClue, hideClue, enterCode, submitCode, nextVault, type VaultGame } from "./rules";

describe("Cofre em Equipe: regras locais determinísticas", () => {
  it("gera segredo de quatro dígitos distintos e divide todas as pistas sem vazamento na passagem", () => {
    for (const players of [2,3,4] as const) {
      const first=createVault(players,37);
      expect(first).toEqual(createVault(players,37));
      expect(new Set(first.secret).size).toBe(4);
      expect(first.secret.every(n=>n>=1&&n<=9)).toBe(true);
      expect(first.viewed).toHaveLength(players);
      const covered=new Set(first.clues.flatMap(c=>c.positions));
      expect([...covered].sort()).toEqual([0,1,2,3]);
      expect(first.phase).toBe("handoff");
    }
  });
  it("mostra pistas a um jogador por vez, não aceita palpite até todos receberem sua vez", () => {
    const game=createVault(3,4);
    expect(enterCode(game,"1234")).toBe(game);
    expect(submitCode(game)).toBe(game);
    const clue=revealClue(game);
    expect(clue.phase).toBe("clue");
    expect(clue.viewed[0]).toBe(true);
    expect(revealClue(clue)).toBe(clue);
    const next=hideClue(clue);
    expect(next.phase).toBe("handoff");
    expect(next.player).toBe(1);
    const final=hideClue(revealClue(hideClue(revealClue(next))));
    expect(final.phase).toBe("guess");
    expect(final.viewed.every(Boolean)).toBe(true);
  });
  it("bloqueia dígitos inválidos, repetidos, submissões incompletas e dá feedback exato", () => {
    const state=createVault(2,5);
    const ready=hideClue(revealClue(hideClue(revealClue(state))));
    expect(enterCode(ready,"1123")).toBe(ready);
    expect(enterCode(ready,"abcd")).toBe(ready);
    expect(enterCode(ready,"123")).toBe(ready);
    const attempted=enterCode(ready,"1234");
    expect(attempted.guess).toBe("1234");
    expect(submitCode(ready)).toBe(ready);
    const result=submitCode(attempted);
    expect(result.history).toHaveLength(1);
    expect(result.history[0].exact).toBeGreaterThanOrEqual(0);
    expect(result.history[0].shared).toBeGreaterThanOrEqual(0);
    expect(result.history[0].exact+result.history[0].shared).toBeLessThanOrEqual(4);
    expect(ready.history).toHaveLength(0);
  });
  it("registra vitória, pontuação e derrota em no máximo quatro tentativas", () => {
    const start=createVault(4,8);
    let ready:VaultGame=start;
    for(let i=0;i<4;i++)ready=hideClue(revealClue(ready));
    expect(ready.phase).toBe("guess");
    const success=submitCode(enterCode(ready,ready.secret.join("")));
    expect(success.phase).toBe("won");
    expect(success.score).toBeGreaterThan(0);
    expect(submitCode(success)).toBe(success);
    const wrongCodes=["1234","5678","1357","2468"].filter(code=>code!==ready.secret.join(""));
    let lost=ready;
    for(let i=0;i<4;i++) {
      const guess=wrongCodes[i%wrongCodes.length];
      lost=submitCode(enterCode(lost,guess));
    }
    expect(lost.phase).toBe("lost");
    expect(lost.history).toHaveLength(4);
    const restarted=nextVault(lost);
    expect(restarted.phase).toBe("handoff");
    expect(restarted.seed).not.toBe(start.seed);
    expect(restarted.history).toHaveLength(0);
  });
});
