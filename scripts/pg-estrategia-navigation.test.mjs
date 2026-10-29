import test from 'node:test';
import assert from 'node:assert/strict';
import { nextPlayableCell, nearestPlayableCell } from '../public/estrategia/navigation.mjs';
test('setas pulam casas bloqueadas sem quebrar as bordas do tabuleiro', () => {
  assert.equal(nextPlayableCell(0,'ArrowRight',[3,4,5]),3);
  assert.equal(nextPlayableCell(4,'ArrowRight',[5]),null);
  assert.equal(nextPlayableCell(20,'ArrowUp',[5,0,15]),15);
  assert.equal(nextPlayableCell(3,'ArrowLeft',[0,5]),0);
  assert.equal(nextPlayableCell(5,'ArrowUp',[0]),0);
  assert.equal(nextPlayableCell(20,'ArrowDown',[21]),null);
});
test('foco após jogada escolhe casa válida mais próxima',()=>{
  assert.equal(nearestPlayableCell(6,[7,12,19]),7);
  assert.equal(nearestPlayableCell(6,[0,24]),0);
  assert.equal(nearestPlayableCell(6,[]),null);
  assert.equal(nearestPlayableCell(24,['equilibrio']),null);
});
test('entradas inesperadas não desviam o foco nem geram índices inválidos', () => {
 assert.equal(nextPlayableCell(-1,'ArrowRight',[0]),null);
 assert.equal(nextPlayableCell(0,'Escape',[1]),null);
 assert.equal(nearestPlayableCell(NaN,[0]),null);
});