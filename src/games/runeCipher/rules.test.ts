import {describe,expect,it} from "vitest";
import {assignRune,checkRunes,decodeCipher,newRuneGame,nextRunes,restartRunes,revealRune,runes} from "./rules";
describe("Código de Runas — substituição monoalfabética",()=>{
 it("entrega 26 símbolos visuais distintos",()=>{
  expect(runes).toHaveLength(26);expect(new Set(runes).size).toBe(26);
 });
 it("gera 240 mensagens determinísticas, únicas por runa e decodificáveis",()=>{
  for(const d of [0,1,2] as const)for(let seed=0;seed<80;seed++){
   const g=newRuneGame(d,seed);
   expect(g).toEqual(newRuneGame(d,seed));
   expect(g.symbols.length).toBeGreaterThanOrEqual(5);
   expect(new Set(Object.values(g.solution)).size).toBe(g.symbols.length);
   expect(decodeCipher(g.cipher,g.solution)).toBe(g.phrase);
   expect(g.cipher).not.toBe(g.phrase);
   expect(g.status).toBe("playing");
  }
 });
 it("permite testar sem revelar o código, limpar escolhas e manter mapeamento biunívoco",()=>{
  const g=newRuneGame(0,43),symbol=g.symbols[0],other=g.symbols[1];
  const a=assignRune(g,symbol,"Z"),b=assignRune(a,other,"Z");
  expect(b.assignments[symbol]).toBeUndefined();
  expect(b.assignments[other]).toBe("Z");
  expect(assignRune(g,"x","A")).toBe(g);
  expect(assignRune(g,symbol,"AA")).toBe(g);
  expect(assignRune(a,symbol,"").assignments[symbol]).toBeUndefined();
  expect(checkRunes(g).status).toBe("playing");
  expect(checkRunes(g).attempts).toBe(1);
  expect(g.attempts).toBe(0);
 });
 it("concede apenas duas pistas, bloqueia substituição de dicas e garante vitória",()=>{
  let g=newRuneGame(1,28);
  const start=g;
  g=revealRune(revealRune(g));
  expect(g.hintsUsed).toBe(2);
  expect(revealRune(g)).toBe(g);
  const protectedRune=g.revealed[0];
  expect(assignRune(g,protectedRune,"Z")).toBe(g);
  for(const sym of start.symbols)if(!g.revealed.includes(sym))g=assignRune(g,sym,start.solution[sym]);
  g=checkRunes(g);
  expect(g.status).toBe("won");expect(g.score).toBeGreaterThan(0);
  expect(assignRune(g,start.symbols[0],"X")).toBe(g);
  expect(restartRunes(g)).toEqual(start);
  expect(nextRunes(g).seed).not.toBe(g.seed);
 });
 it("rejeita configurações inválidas",()=>{
  expect(()=>newRuneGame(3 as never)).toThrow();
  expect(()=>newRuneGame(0,-1)).toThrow();
 });
});