import test from 'node:test';
import assert from 'node:assert/strict';
import { getHelpResponse, normalizeBotQuery } from '../public/estrategia/pg-bot.mjs';

test('normalização lida com acentos e não executa entradas', () => {
  assert.equal(normalizeBotQuery('  COMO SALVAR o Progresso? '), 'como salvar o progresso?');
  assert.equal(normalizeBotQuery('<img onerror=alert(1)>').includes('<img'), true);
  assert.equal(normalizeBotQuery('x'.repeat(500)).length, 160);
});

test('suporte explica persistência local e limitações offline', () => {
  assert.match(getHelpResponse('Meu progresso fica salvo?').text, /navegador/i);
  assert.match(getHelpResponse('Consigo jogar offline?').text, /primeira visita/i);
});

test('não confunde as 150 missões com jogos distintos', () => {
  assert.match(getHelpResponse('São 150 jogos diferentes?').text, /seis mecânicas/i);
  assert.match(getHelpResponse('São 150 jogos diferentes?').text, /150 missões/i);
});

test('dicas usam apenas as seis famílias existentes', () => {
  assert.match(getHelpResponse('Me dê uma dica', {family:'territorio'}).text, /áreas/i);
  assert.match(getHelpResponse('Uma dica', {family:'defesa'}).text, /pista/i);
  assert.match(getHelpResponse('Uma dica', {family:'__proto__'}).text, /selecione uma missão/i);
});

test('suporte orienta controles, reset e informa quando não sabe', () => {
  assert.match(getHelpResponse('Como faço para jogar pelo teclado?').text, /Tab/i);
  assert.match(getHelpResponse('Reiniciar ou desfazer uma jogada').text, /Reiniciar/i);
  assert.match(getHelpResponse('Qual a população de Marte?').text, /não tenho uma resposta/i);
});

test('a pergunta vazia não quebra e não coleta dados', () => {
  assert.equal(getHelpResponse(' ').topic, 'inicio');
  assert.equal(getHelpResponse(null).topic, 'inicio');
});
