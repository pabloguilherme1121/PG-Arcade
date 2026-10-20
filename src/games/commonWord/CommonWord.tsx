import { useCallback, useEffect, useRef, useState } from 'react';
import { useAutoPause } from '../useAutoPause';
import { createDeck } from './deck';
import { soloChallenge } from './solo';
import { choose, createMatch, nextRound } from './rules';
import './commonWord.css';
import { playFeedback } from '../feedbackAudio';

import {readSavedSession,saveSession,discardSavedSession,type Session} from './savedSession';
export default function CommonWord() {
 const [mode,setMode]=useState('solo'),[count,setCount]=useState(10),[players,setPlayers]=useState(2);
 const [session,setSession]=useState<Session|null>(null),[paused,setPaused]=useState(false);
 const [saved,setSaved]=useState(readSavedSession),[storageAvailable,setStorageAvailable]=useState(true);
 const [sound,setSound]=useState(false);
 const heading=useRef<HTMLHeadingElement>(null);
 const active=!!session && session.match.phase!=='finished';
 const pause=useCallback(()=>{if(active)setPaused(true);},[active]);
 useAutoPause(pause,active&&!paused,session?.match.phase==='finished',0);
 useEffect(()=>{heading.current?.focus();},[session?.match.phase,session?.match.round,session?.current,session?.covered,paused]);
 useEffect(()=>{
  if(session)setStorageAvailable(saveSession(session,mode,players,count));
 },[session,mode,players,count]);
 function resumeSaved() {
  if(!saved)return;
  setMode(saved.mode);setPlayers(saved.players);setCount(saved.count);
  setSession(saved.session);setPaused(true);setSaved(null);
 }
 function start(repeatSeed?:number) {
  const seed=repeatSeed??crypto.getRandomValues(new Uint32Array(1))[0];
  const ids=mode==='solo'?['Você','Bot de pistas']:Array.from({length:players},(_,i)=>`Jogador ${i+1}`);
  setSession({match:createMatch(ids,createDeck(seed,count)),seed,current:0,covered:mode==='local',answers:[[]]});setPaused(false);setSaved(null);
 }
 function submit(value:number) {
  if(sound && !paused && session && !session.covered && session.match.phase==='choosing' && mode==='solo') {
   void playFeedback(value===soloChallenge(session.seed,session.match.round,session.match.rounds[session.match.round].options).target);
  }
  setSession(s=>{
   if(!s || paused || s.covered || s.match.phase!=='choosing') return s;
   const player=s.match.players[s.current];
   let match=choose(s.match,player,s.match.round,value);
   if(mode==='solo') {
    const bot=soloChallenge(s.seed,match.round,match.rounds[match.round].options).target;
    match=choose(match,'Bot de pistas',match.round,bot);
   }
   const answers=s.answers.map(row=>[...row]);
   answers[s.match.round]=match.players.filter(id=>Object.hasOwn(match.choices,id)).map(id=>match.choices[id]);
   return { ...s,match,answers,current:match.phase==='reveal'?s.current:s.current+1,covered:match.phase==='choosing' };
  });
 }
 const match=session?.match,round=match?.rounds[match.round];
 return <section className="common-word" aria-label="Palavra em Comum">
  <header><span className="cw-eyebrow">Conexões em palavras</span><h2 ref={heading} tabIndex={-1}>{paused?'Partida pausada':!match?'Palavra em Comum':match.phase==='finished'?'Partida concluída':session!.covered?`Vez de ${match.players[session!.current]}`:match.phase==='reveal'?'Revelação':round!.prompt}</h2></header>
  {!storageAvailable&&<p role="status">Não foi possível salvar neste navegador. A partida continua, mas recarregar pode perder o andamento.</p>}
  {!session ? <>
   {saved&&<aside aria-label="Partida salva"><p>Há uma partida local salva na rodada {saved.session.match.round+1} de {saved.count}.</p><button onClick={resumeSaved}>Retomar partida salva</button><button onClick={()=>{discardSavedSession();setSaved(null);}}>Descartar partida salva</button></aside>}
   <p>Escolham a mesma associação sem combinar. Cada coincidência com outra pessoa vale 100 pontos para cada uma.</p>
   <label>Modo de jogo<select aria-label="Modo de jogo" value={mode} onChange={e=>setMode(e.target.value)}><option value="solo">Solo — desafio de pistas</option><option value="local">Dupla ou grupo local</option></select></label>
   {mode==='local'&&<label>Participantes<select aria-label="Participantes" value={players} onChange={e=>setPlayers(Number(e.target.value))}>{[2,3,4].map(n=><option key={n} value={n}>{n} jogadores</option>)}</select></label>}
   <label>Duração<select aria-label="Duração" value={count} onChange={e=>setCount(Number(e.target.value))}><option value={5}>Rápida — 5 rodadas</option><option value={10}>Clássica — 10 rodadas</option><option value={20}>Completa — 20 rodadas</option></select></label>
   <p className="cw-note">{mode==='solo'?'Leia a pista e encontre a associação correspondente. A resposta é definida antes da sua escolha: interpretar a pista vale mais que adivinhar.':'No mesmo aparelho: passe a tela entre escolhas. A cortina esconde a resposta anterior, mas não substitui confiança entre participantes.'}</p>
   <label className="cw-sound"><input type="checkbox" checked={sound} onChange={e=>setSound(e.target.checked)}/>Ativar sons de feedback (opcional)</label>
   <button onClick={()=>start()}>Começar partida</button>
  </> : paused ? <><p>A rodada e as respostas foram preservadas.</p><button onClick={()=>setPaused(false)}>Continuar partida</button></> : <>
   <p className="cw-progress">Rodada {match!.round+1} de {match!.rounds.length} · {mode==='solo'?'Treino solo':'Mesmo aparelho'}</p>
   {match!.phase==='finished'? <>
    <p>{match!.scores[match!.players[0]]===0&&mode==='solo'?'Nenhuma pista resolvida desta vez. Reveja as associações e tente novamente.':'Veja quantas conexões vocês fizeram.'}</p>
    <ul className="cw-results">{match!.players.map(id=><li key={id}>{id}<strong>{match!.scores[id]} pontos</strong></li>)}</ul>
    <p>Resultados desta partida não competem com recordes de outros modos.</p>
    <button onClick={()=>start()}>Jogar novamente</button><button onClick={()=>start(session.seed)}>Repetir os mesmos temas</button><button onClick={()=>setSession(null)}>Alterar configuração</button>
   </> : session.covered ? <>
    <div className="cw-curtain"><p>Entregue o aparelho a {match!.players[session.current]}. Quem respondeu deve olhar para outro lado.</p><button onClick={()=>setSession(s=>s?{...s,covered:false}:s)}>Estou pronto</button></div>
   </> : match!.phase==='reveal' ? <>
    <p>Tema: <strong>{round!.prompt}</strong></p>
    <ul className="cw-results">{match!.players.map(id=><li key={id}><span>{id}: {round!.options[match!.choices[id]]}</span><strong>{match!.scores[id]} pontos</strong></li>)}</ul>
    <p role="status">{new Set(Object.values(match!.choices)).size===1?'Sintonia perfeita!':mode==='solo'?'Confira a associação indicada pela pista.':'Associações diferentes também fazem parte do jogo.'}</p>
    <button onClick={()=>setSession(s=>s?{...s,match:nextRound(s.match),answers:s.match.round<s.match.rounds.length-1?[...s.answers,[]]:s.answers,current:0,covered:mode==='local'&&s.match.round<s.match.rounds.length-1}:s)}>{match!.round===match!.rounds.length-1?'Ver resultado':'Próxima rodada'}</button>
   </> : <>
    <p>{match!.players[session.current]}, o que você associa a <strong>{round!.prompt}</strong>?</p>
    {mode==='solo'&&<p className="cw-clue"><strong>Pista do bot: </strong>{soloChallenge(session.seed,match!.round,round!.options).hint}</p>}
    <div className="cw-options">{round!.options.map((option,i)=><button key={option} onClick={()=>submit(i)}>{option}</button>)}</div>
    <p className="cw-note">A primeira escolha é definitiva. As respostas aparecem quando todos terminarem.</p>
   </>}
   {match!.phase!=='finished'&&<button onClick={()=>setPaused(true)}>Pausar partida</button>}
  </>}
 </section>;
}
