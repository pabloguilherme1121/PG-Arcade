import {describe,expect,it} from "vitest";
import {newTimeGears,rotateGear,undoGear,resetGears,nextGears,scoreGears} from "./rules";
describe("Engrenagens do Tempo: motor determinístico",()=>{
  it("cria 4, 5 ou 6 engrenagens e puzzles repetíveis, não resolvidos",()=>{
    for(const difficulty of [0,1,2] as const)
      for(let seed=1;seed<=50;seed++){
        const g=newTimeGears(difficulty,seed);
        expect(g.turns).toHaveLength(difficulty+4);
        expect(g.phase).toBe("playing");
        expect(g.turns.filter(x=>x!==0).length).toBeGreaterThanOrEqual(2);
        expect(newTimeGears(difficulty,seed)).toEqual(g);
      }
  });
  it("cada giro e seu inverso conservam o estado e não o mutam",()=>{
    const g=newTimeGears(1,72),old=[...g.turns];
    const spun=rotateGear(g,2,1);
    expect(g.turns).toEqual(old);
    expect(rotateGear(spun,2,-1).turns).toEqual(old);
    expect(undoGear(spun).turns).toEqual(old);
    expect(undoGear(spun).moves).toBe(0);
    expect(undoGear(g)).toBe(g);
  });
  it("recusa índices, direções e configuração inválidos",()=>{
    const g=newTimeGears();
    expect(rotateGear(g,-1,1)).toBe(g);
    expect(rotateGear(g,4,1)).toBe(g);
    expect(rotateGear(g,0,0 as 1)).toBe(g);
    expect(()=>newTimeGears(9 as 0,1)).toThrow();
    expect(()=>newTimeGears(0,-3)).toThrow();
  });
  it("todo tabuleiro é solucionável com giros inversos à embaralhada",()=>{
    for(const difficulty of [0,1,2] as const)
      for(let seed=1;seed<=30;seed++){
        let g=newTimeGears(difficulty,seed);
        const solution=[...g.scramble].reverse();
        for(const move of solution)g=rotateGear(g,move.index,move.direction===1?-1:1);
        expect(g.turns).toEqual(Array(difficulty+4).fill(0));
        expect(g.phase).toBe("won");
        expect(rotateGear(g,0,1)).toBe(g);
        expect(scoreGears(g)).toBeGreaterThan(0);
      }
  });
  it("reinicia e avança desafios sem carregar jogadas antigas",()=>{
    const initial=newTimeGears(2,89);
    const played=rotateGear(initial,0,1);
    expect(resetGears(played)).toEqual(initial);
    const next=nextGears(played);
    expect(next.seed).not.toBe(initial.seed);
    expect(next.moves).toBe(0);
    expect(next.phase).toBe("playing");
  });
});