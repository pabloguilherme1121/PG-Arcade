import test from 'node:test';
import assert from 'node:assert/strict';
import {EXISTING_STRATEGY} from '../public/estrategia/catalog.mjs';
import {STRATEGY_GROUPS, strategyGroupFor, filterStrategyLibrary, strategyLaunchUrl, arcadeGameUrl} from '../public/estrategia/strategy-hub.mjs';

test('biblioteca preserva os 47 jogos históricos com IDs estáveis e grupos sem duplicação',()=>{
 assert.equal(EXISTING_STRATEGY.length,47);
 const ids=EXISTING_STRATEGY.map(([id])=>id);
 assert.equal(new Set(ids).size,47);
 assert.equal(Object.keys(STRATEGY_GROUPS).length,4);
 for(const id of ids)assert.ok(strategyGroupFor(id) && Object.hasOwn(STRATEGY_GROUPS,strategyGroupFor(id)),id);
 assert.equal(filterStrategyLibrary('', 'all').length,47);
 for(const group of Object.keys(STRATEGY_GROUPS))assert.ok(filterStrategyLibrary('',group).length>0);
 assert.equal(Object.values(STRATEGY_GROUPS).flat().length,47);
});
test('busca de estratégia ignora maiúsculas e acentos e combina grupos',()=>{
 assert.deepEqual(filterStrategyLibrary('XADREZ','all').map(g=>g.id),['xadrez']);
 assert.deepEqual(filterStrategyLibrary('relEs','logica').map(g=>g.id),['reles']);
 assert.deepEqual(filterStrategyLibrary('domino','tabuleiro').map(g=>g.id),['domino']);
 assert.equal(filterStrategyLibrary('domino','gestao').length,0);
 assert.equal(filterStrategyLibrary('nao-existe','all').length,0);
 assert.equal(filterStrategyLibrary('','invalid').length,0);
});
test('deep links só aceitam IDs oficiais, preservando a mesma engine e os recordes',()=>{
 assert.equal(strategyLaunchUrl('xadrez'),'?arcade=xadrez#classicos');
 assert.equal(arcadeGameUrl('xadrez'),'../#/jogar/xadrez');
 assert.equal(strategyLaunchUrl('nao-existe'),null);
 assert.equal(arcadeGameUrl('__proto__'),null);
 assert.equal(arcadeGameUrl('../?arcade=x'),null);
});
