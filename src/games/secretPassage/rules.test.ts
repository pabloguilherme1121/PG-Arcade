import {describe,expect,it} from "vitest";
import {createPassage,startPlan,chooseMove,undoMove,lockPlan,replayPassage,type PassageGame} from "./rules";
describe("Passagem Secreta: programação simultânea sem vazamento",()=>{
  it("gera trilhas únicas e obstáculos reprodutíveis sem colocar muro no destino",()=>{
    const first=createPassage(3,9);
    expect(first).toEqual(createPassage(3,9));
    expect(first.phase).toBe("handoff");
    expect(first.routes).toHaveLength(3);
    expect(first.positions).toEqual([0,4,20]);
    expect(first.walls).not.toContain(12);
    expect(first.walls.every(n=>n>=0&&n<25)).toBe(true);
  });
  it("não revela trajetos do jogador anterior e só aceita quatro movimentos",()=>{
    const start=createPassage(2,5);
    expect(chooseMove(start,"right")).toBe(start);
    const preparing=startPlan(start);
    expect(preparing.phase).toBe("planning");
    expect(lockPlan(preparing)).toBe(preparing);
    let planned=preparing;
    for(let i=0;i<4;i++)planned=chooseMove(planned,"right");
    expect(planned.draft).toHaveLength(4);
    expect(chooseMove(planned,"right")).toBe(planned);
    const hidden=lockPlan(planned);
    expect(hidden.phase).toBe("handoff");
    expect(hidden.draft).toEqual([]);
    expect(hidden.routes[0]).toEqual(["right","right","right","right"]);
    expect(hidden.player).toBe(1);
    expect(undoMove(hidden)).toBe(hidden);
  });
  it("resolver simultaneamente bloqueia colisões em vez de priorizar um jogador",()=>{
    let s=createPassage(2,3);
    s=startPlan(s);
    for(let i=0;i<4;i++)s=chooseMove(s,"right");
    s=lockPlan(s);
    s=startPlan(s);
    for(let i=0;i<4;i++)s=chooseMove(s,"left");
    s=lockPlan(s);
    expect(s.phase).toBe("result");
    expect(s.positions).toEqual([1,3]);
    expect(s.collisions).toBeGreaterThanOrEqual(2);
    expect(s.history).toHaveLength(4);
    expect(s.scores).toHaveLength(2);
  });
  it("bloqueia conflitos encadeados sem deixar dois jogadores na mesma casa",()=>{
    const original=createPassage(3,19);
    const route=("right" as const);
    const waiting=("wait" as const);
    const constructed={...original,phase:"planning" as const,player:2,
      positions:[0,1,2],routes:[[route,waiting,waiting,waiting],[route,waiting,waiting,waiting],[]],
      draft:[waiting,waiting,waiting,waiting]};
    const resolved=lockPlan(constructed);
    expect(resolved.phase).toBe("result");
    for(const frame of resolved.history)
      expect(new Set(frame.positions).size).toBe(3);
    expect(resolved.history[0].positions).toEqual([0,1,2]);
    expect(resolved.history[0].collisions).toBe(3);
  });
  it("premia caminhos explorados, impede atravessar borda e reinicia sem dados anteriores",()=>{
    let game=createPassage(2,27);
    game=startPlan(game);
    game=chooseMove(game,"up");
    game=chooseMove(game,"right");
    game=chooseMove(game,"wait");
    game=undoMove(game);
    expect(game.draft).toEqual(["up","right"]);
    game=chooseMove(game,"right");
    game=chooseMove(game,"right");
    expect(game.draft).toHaveLength(4);
    game=lockPlan(game);
    game=startPlan(game);
    for(let i=0;i<4;i++)game=chooseMove(game,"wait");
    game=lockPlan(game);
    expect(game.history[0].positions[0]).toBe(0);
    expect(game.scores.every(n=>n>=0)).toBe(true);
    const reset=replayPassage(game);
    expect(reset.phase).toBe("handoff");
    expect(reset.seed).not.toBe(game.seed);
    expect(reset.history).toHaveLength(0);
  });
});
