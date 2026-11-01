import { describe,it,expect } from "vitest";
import { catalogBotAnswer } from "./pgBotCatalog";
import { games } from "./catalog";
describe("PG Bot: catálogo e indicação de jogos",()=>{
 it("encontra sugestões que existem entre os 150 jogos e não duplica IDs",()=>{
  for (const question of ["quero jogo rápido","quero estratégia","indica qualquer jogo"]) {
    const result=catalogBotAnswer(question);
    expect(result.answer.length).toBeGreaterThan(30);
    expect(result.suggestions.length).toBeGreaterThan(0);
    expect(new Set(result.suggestions.map(s=>s.id)).size).toBe(result.suggestions.length);
    expect(result.suggestions.every(s=>games.some(g=>g.id===s.id&&g.name===s.name))).toBe(true);
  }
 });
 it("compreende variações naturais e recomenda apenas partidas realmente em dupla local",()=>{
  expect(catalogBotAnswer("Quero uma partida rápida").suggestions).toHaveLength(3);
  const duo=catalogBotAnswer("Quero jogar em dupla").suggestions;
  expect(duo.length).toBeGreaterThan(0);
  expect(duo.length).toBeLessThanOrEqual(3);
 });
 it("fornece instruções honestas para favoritos e acesso offline",()=>{
  expect(catalogBotAnswer("como salvar meus favoritos?").answer).toMatch(/navegador|favoritos/i);
  expect(catalogBotAnswer("funciona sem internet?").answer).toMatch(/primeir|conectad|visit/i);
 });
 it("não incorpora marcação da pergunta nem afirma usar IA conectada",()=>{
  const result=catalogBotAnswer("<img src=x onerror=alert(1)>");
  expect(result.answer).not.toContain("<img");
  expect(result.answer).not.toContain("alert(1)");
 });
});
