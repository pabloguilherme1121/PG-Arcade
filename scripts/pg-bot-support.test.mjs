import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getSupportAnswer, topics } from '../public/brand/pg-bot/support.mjs';

test('PG Bot possui ajuda local para seis assuntos nos dois sites', () => {
  assert.deepEqual(topics.map(x => x.id), ['como-jogar', 'controles', 'dica', 'progresso', 'problemas', 'catalogo']);
  for (const site of ['arcade', 'estrategia']) {
    for (const topic of topics) {
      const answer = getSupportAnswer(topic.id, site);
      assert.ok(answer.length >= 25, site + ': ' + topic.id);
      assert.ok(!/atendente humano|inteligência artificial em tempo real/i.test(answer));
    }
  }
});
test('dicas da estratégia respeitam a família de cada missão', () => {
  for (const [id, expected] of Object.entries({
    'est-001': 'território', 'est-026': 'rota', 'est-051': 'créditos',
    'est-076': 'pista', 'est-101': 'combustível', 'est-126': 'energia',
  })) assert.match(getSupportAnswer('dica', 'estrategia', id), new RegExp(expected, 'i'));
  assert.match(getSupportAnswer('dica', 'estrategia', 'est-999'), /selecione uma missão/i);
  assert.match(getSupportAnswer('dica', 'arcade', 'est-001'), /opções da partida/i);
});
test('bot não inventa jogos nem aceita assuntos desconhecidos', () => {
  assert.match(getSupportAnswer('__proto__', 'estrategia'), /assunto/i);
  assert.match(getSupportAnswer('catalogo', 'estrategia'), /150 missões.*seis.*não são 150 jogos/si);
  assert.match(getSupportAnswer('catalogo', 'arcade'), /150 jogos/);
});
test('bot é local, não cobre o tabuleiro e integra as duas páginas', () => {
  const js = readFileSync('public/brand/pg-bot/support.mjs', 'utf8');
  const css = readFileSync('public/brand/pg-bot/support.css', 'utf8');
  for (const pattern of [/fetch\(/, /XMLHttpRequest/, /localStorage/, /https?:\/\//]) assert.doesNotMatch(js, pattern);
  assert.doesNotMatch(css, /position:\s*fixed/);
  for (const path of ['index.html', 'public/estrategia/index.html']) {
    const html = readFileSync(path, 'utf8');
    assert.match(html, /pg-bot-support/);
    assert.match(html, /support\.mjs/);
  }
  const sw = readFileSync('public/estrategia/sw.js', 'utf8');
  assert.match(sw, /brand\/pg-bot\/support\.mjs/);
  assert.match(sw, /brand\/pg-bot\/mascot\.webp/);
});