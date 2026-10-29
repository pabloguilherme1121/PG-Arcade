import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { answerPGbot } from '../public/estrategia/pg-bot-help.mjs';

test('PG Bot dá dicas específicas das seis mecânicas sem executar jogadas', () => {
  const words = {
    territorio: /território|vizinhas/i,
    rotas: /bloqueios|rota/i,
    economia: /recursos|créditos/i,
    defesa: /pista|torres/i,
    logistica: /combustível|carga/i,
    cidade: /energia|água/i,
  };
  for (const [family, expected] of Object.entries(words)) {
    assert.match(answerPGbot('dica', { active: true, family, missionName: 'Teste' }), expected);
  }
});

test('PG Bot explica persistência local e não promete conta nem sincronização', () => {
  assert.match(answerPGbot('Como salvo meu progresso?'), /navegador/i);
  assert.match(answerPGbot('Como salvo meu progresso?'), /sem sincronização/i);
  assert.match(answerPGbot('controles'), /teclado|toque/i);
});

test('PG Bot aceita perguntas sem acentos, contextos nulos e texto inesperado', () => {
  assert.match(answerPGbot('DICA', { active: true, family: 'defesa' }), /torres|pista/i);
  assert.match(answerPGbot(null), /pergunte|ajuda/i);
  assert.match(answerPGbot('qual é a senha secreta?'), /ajuda local/i);
  assert.match(answerPGbot('dica', { family: '__proto__', active: true }), /escolha|missão/i);
});

test('PG Bot está ligado ao portal e tem fechamento, sem serviço externo', () => {
  const html = readFileSync('public/estrategia/index.html', 'utf8');
  const script = readFileSync('public/estrategia/pg-bot.mjs', 'utf8');
  const sw = readFileSync('public/estrategia/sw.js', 'utf8');
  assert.match(html, /id="pgbot-open"/);
  assert.match(html, /id="pgbot-game"/);
  assert.match(html, /id="pgbot-dialog"/);
  assert.match(html, /\.\/pg-bot\.mjs/);
  assert.match(script, /\.textContent\s*=/);
  assert.match(script, /\.showModal\(\)/);
  assert.doesNotMatch(script, /fetch\s*\(|XMLHttpRequest|localStorage\./);
  assert.match(sw, /pg-bot\.mjs/);
  assert.match(sw, /pg-bot-help\.mjs/);
  assert.match(sw, /pg-bot\.css/);
});