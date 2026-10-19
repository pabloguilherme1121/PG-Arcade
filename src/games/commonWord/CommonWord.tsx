import { useCallback, useEffect, useRef, useState } from 'react';
import { useAutoPause } from '../useAutoPause';
import { createDeck } from './deck';
import { choose, createMatch, nextRound, type Match } from './rules';
import './commonWord.css';

type Session = {match:Match;seed:number;current:number;covered:boolean};
export default function CommonWord() {
 const [mode,setMode]=useState('solo'),[count,setCount]=useState(10),[players,setPlayers]=useState(2);
 const [session,setSession]=useState<Session|null>(null),[paused,setPaused]=useState(false);
 const heading=useRef<HTMLHeadingElement>(null);
 const active=!!session && session.match.phase!=='finished';
 const pause=useCallback(()=>{if(active)setPaused(true);},[active]);
 useAutoPause(pause,active&&!paused,session?.match.phase==='finished',0);
 useEffect(()=>{heading.current?.focus();},[session?.match.phase,session?.match.round,session?.current,session?.covered,paused]);
 function start() {
  const seed=crypto.getRandomValues(new Uint32Array(1))[0];
  const ids=mode==='solo'?['Você','Bot aleatório']:Array.from({length:players},(_,i)=>`Jogador ${i+1}`);
  setSession({match:createMatch(ids,createDeck(seed,count)),seed,current:0,covered:mode==='local'});setPaused(false);
 }
 function submit(value:number) {
  setSession(s=>{
   if(!s || paused || s.covered || s.match.phase!=='choosing') return s;
   const player=s.match.players[s.current];
   let match=choose(s.match,player,s.match.round,value);
   if(mode==='solo') {
    // Determined by the seed and round, never by the human's choice.
    const bot=((Math.imul(s.seed^(match.round+1),1664525)+1013904223)>>>0)%match.rounds[match.round].options.length;
    match=choose(match,'Bot aleatório',match.round,bot);
   }
   return { ...s,match,current:match.phase==='reveal'?s.current:s.current+1,covered:match.phase==='choosing' };
  });
 }
 const match=session?.match,round=match?.rounds[match.round];
 return <section className="common-word" aria-label="Palavra em Comum">
  <header><span className="cw-eyebrow">Conexões em palavras</span><h2 ref={heading} tabIndex={-1}>{paused?'Partida pausada':!match?'Palavra em Comum':match.phase==='finished'?'Partida concluída':session!.covered?`Vez de ${match.players[session!.current]}`:match.phase==='reveal'?'Revelação':round!.prompt}</h2></header>
  {!session ? <>
   <p>Escolham a mesma associação sem combinar. Cada coincidência com outra pessoa vale 100 pontos para cada uma.</p>
   <label>Modo de jogo<select aria-label="Modo de jogo" value={mode} onChange={e=>setMode(e.target.value)}><option value="solo">Solo — treino com bot aleatório</option><option value="local">Dupla ou grupo local</option></select></label>
   {mode==='local'&&<label>Participantes<select aria-label="Participantes" value={players} onChange={e=>setPlayers(Number(e.target.value))}>{[2,3,4].map(n=><option key={n} value={n}>{n} jogadores</option>)}</select></label>}
   <label>Duração<select aria-label="Duração" value={count} onChange={e=>setCount(Number(e.target.value))}><option value={5}>Rápida — 5 rodadas</option><option value={10}>Clássica — 10 rodadas</option><option value={20}>Completa — 20 rodadas</option></select></label>
   <p className="cw-note">{mode==='solo'?'O bot escolhe ao acaso, independentemente da sua resposta. É um treino de associação, sem resposta certa ou dificuldade artificial.':'No mesmo aparelho: passe a tela entre escolhas. A cortina esconde a resposta anterior, mas não substitui confiança entre participantes.'}</p>
   <button onClick={start}>Começar partida</button>
  </> : paused ? <><p>A rodada e as respostas foram preservadas.</p><button onClick={()=>setPaused(false)}>Continuar partida</button></> : <>
   <p className="cw-progress">Rodada {match!.round+1} de {match!.rounds.length} · {mode==='solo'?'Treino solo':'Mesmo aparelho'}</p>
   {match!.phase==='finished'? <>
    <p>{match!.scores[match!.players[0]]===0&&mode==='solo'?'Nenhuma associação em comum desta vez. Não há resposta errada.':'Veja quantas conexões vocês fizeram.'}</p>
    <ul className="cw-results">{match!.players.map(id=><li key={id}>{id}<strong>{match!.scores[id]} pontos</strong></li>)}</ul>
    <p>Resultados desta partida não competem com recordes de outros modos.</p>
    <button onClick={start}>Jogar novamente</button><button onClick={()=>setSession(null)}>Alterar configuração</button>
   </> : session.covered ? <>
    <div className="cw-curtain"><p>Entregue o aparelho a {match!.players[session.current]}. Quem respondeu deve olhar para outro lado.</p><button onClick={()=>setSession(s=>s?{...s,covered:false}:s)}>Estou pronto</button></div>
   </> : match!.phase==='reveal' ? <>
    <p>Tema: <strong>{round!.prompt}</strong></p>
    <ul className="cw-results">{match!.players.map(id=><li key={id}><span>{id}: {round!.options[match!.choices[id]]}</span><strong>{match!.scores[id]} pontos</strong></li>)}</ul>
    <p role="status">{new Set(Object.values(match!.choices)).size===1?'Sintonia perfeita!':'Associações diferentes também fazem parte do jogo.'}</p>
    <button onClick={()=>setSession(s=>s?{...s,match:nextRound(s.match),current:0,covered:mode==='local'&&s.match.round<s.match.rounds.length-1}:s)}>{match!.round===match!.rounds.length-1?'Ver resultado':'Próxima rodada'}</button>
   </> : <>
    <p>{match!.players[session.current]}, o que você associa a <strong>{round!.prompt}</strong>?</p>
    <div className="cw-options">{round!.options.map((option,i)=><button key={option} onClick={()=>submit(i)}>{option}</button>)}</div>
    <p className="cw-note">A primeira escolha é definitiva. As respostas aparecem quando todos terminarem.</p>
   </>}
   {match!.phase!=='finished'&&<button onClick={()=>setPaused(true)}>Pausar partida</button>}
  </>}
 </section>;
}
