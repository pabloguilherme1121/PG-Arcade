import { describe,it,expect } from 'vitest';
import { answerArcadeQuestion } from './pgBotAnswers';
describe('PG Bot do Arcade',()=>{
 it('usa regras específicas do jogo sem confundir seu objetivo com outro jogo',()=>{
  const snake=answerArcadeQuestion('snake','Como vencer?');
  const puzzle=answerArcadeQuestion('2048','Como vencer?');
  expect(snake.topic).toBe('objetivo');expect(puzzle.topic).toBe('objetivo');
  expect(snake.answer).not.toBe(puzzle.answer);
  expect(snake.answer.length).toBeGreaterThan(45);
 });
 it('orienta controles, pausa e recordes de maneira honesta',()=>{
  expect(answerArcadeQuestion('snake','qual tecla aperto?').topic).toBe('controles');
  expect(answerArcadeQuestion('2048','como pausar?').topic).toBe('pausa');
  expect(answerArcadeQuestion('2048','como ver meus recordes?').topic).toBe('recordes');
  expect(answerArcadeQuestion('2048','jogo offline?').topic).toBe('offline');
 });
 it('rejeita pedidos perigosos de markup, sem texto com dados pessoais ou promessa de IA',()=>{
  const answer=answerArcadeQuestion('snake','<img src=x onerror=alert(1)>');
  expect(answer.topic).toBe('fallback');
  expect(answer.answer).not.toContain('<img');
  expect(answer.answer).toContain('perguntas');
 });
});
