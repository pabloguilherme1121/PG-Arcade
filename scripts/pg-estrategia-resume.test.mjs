import test from 'node:test';
import assert from 'node:assert/strict';
import {initMission,legalMoves,play,undo} from '../public/estrategia/core.mjs';
import {decodeSession,encodeSession,acceptedMove,SESSION_KEY} from '../public/estrategia/resume.mjs';
test('retoma rota por replay determinístico',()=>{
 const before=initMission('est-026'),action={cell:legalMoves(before)[0]},after=play(before,action);
 assert.equal(acceptedMove(before,after),true);
 const restored=decodeSession(encodeSession(before.id,[action]));
 assert.deepEqual(restored?.state,after);assert.deepEqual(restored?.actions,[action]);assert.equal(SESSION_KEY,'pg-estrategia-session-v1');
});
test('pode retomar e desfazer construção de torres',()=>{
 const before=initMission('est-076'),action={type:'build',lane:before.waves[0].lane};
 const restored=decodeSession(encodeSession(before.id,[action]));
 assert.equal(restored?.state.credits,before.credits-3);
 assert.deepEqual(undo(restored.state).towers,before.towers);
});
test('recusa sessões adulteradas e encerradas',()=>{
 const invalid=[null,'{','x'.repeat(6000),'{}',JSON.stringify({v:1,id:'est-999',actions:[]}),JSON.stringify({v:1,id:'est-001',actions:[{cell:24}]}),JSON.stringify({v:1,id:'est-051',actions:[{type:'investir',admin:true}]}),JSON.stringify({v:1,id:'est-001',actions:Array(41).fill({cell:1})})];
 for(const value of invalid)assert.equal(decodeSession(value),null);
 assert.equal(decodeSession(encodeSession('est-126',Array(7).fill({type:'equilibrio'}))),null);
});
test('ignora comandos não aceitos',()=>{
 const before=initMission('est-001');
 assert.equal(acceptedMove(before,play(before,{cell:24})),false);
 assert.equal(acceptedMove(before,play(before,null)),false);
});
