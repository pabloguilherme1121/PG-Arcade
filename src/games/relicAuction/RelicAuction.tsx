import {useCallback,useEffect,useLayoutEffect,useRef,useState} from 'react';
import {useAutoPause} from '../useAutoPause';
import {botBid,collectionScore,createAuction,currentBidder,familyNames,nextLot,priority,submitBid,type Auction,type Family} from './rules';
import {discardAuction,readAuction,saveAuction,type Settings} from './savedSession';
import './relicAuction.css';
type Session={match:Auction;covered:boolean;bot:number};
const levels={easy:'Fácil',normal:'Normal',hard:'Difícil'} as const;
const levelHelp={easy:'O bot faz lances pequenos e prioriza o valor da peça.',normal:'O bot procura coleções e distribui o orçamento entre os lotes.',hard:'O bot também disputa peças que completariam suas coleções. O orçamento é igual para todos.'};
function sessionFor(match:Auction,settings:Settings):Session {
 return {match,covered:settings.mode==='local'&&match.phase==='bidding',bot:settings.mode==='solo'&&match.phase==='bidding'?botBid(match,settings.level):0};
}
function RelicMark({family}:{family:Family}) {
 return <svg viewBox="0 0 100 80" aria-hidden="true" focusable="false"><path d="M50 5 85 25 75 65 50 76 25 65 15 25Z" fill="none" stroke="currentColor" strokeWidth="4"/>{family==='solar'?<><circle cx="50" cy="40" r="17" fill="none" stroke="currentColor" strokeWidth="5"/><path d="M50 15V22M50 58V65M25 40H32M68 40H75" stroke="currentColor" strokeWidth="4"/></>:family==='lunar'?<path d="M61 20A22 22 0 1 0 61 60A27 27 0 0 1 61 20Z" fill="currentColor"/>:<path d="M25 37Q37 25 50 37T75 37M25 50Q37 38 50 50T75 50" fill="none" stroke="currentColor" strokeWidth="5"/>}</svg>;
}
export default function RelicAuction() {
 const [settings,setSettings]=useState<Settings>({mode:'solo',players:2,level:'normal'});
 const [session,setSession]=useState<Session|null>(null),[saved,setSaved]=useState(readAuction);
 const [paused,setPaused]=useState(false),[bid,setBid]=useState(0),[storageOK,setStorageOK]=useState(true);
 const heading=useRef<HTMLHeadingElement>(null);
 const match=session?.match,current=match?(settings.mode==='solo'?0:currentBidder(match)):0;
 const playerName=(i:number)=>settings.mode==='solo'?(i===0?'Você':'Bot colecionador'):`Jogador ${i+1}`;
 const active=!!match&&match.phase!=='finished';
 const pause=useCallback(()=>{if(active)setPaused(true);},[active]);
 useAutoPause(pause,active&&!paused,match?.phase==='finished',0);
 useEffect(()=>{heading.current?.focus();},[match?.phase,match?.round,current,session?.covered,paused]);
 useLayoutEffect(()=>{if(session)setStorageOK(saveAuction(session.match,settings));},[session,settings]);
 function start(seed=crypto.getRandomValues(new Uint32Array(1))[0]) {
  setSession(sessionFor(createAuction(seed,settings.mode==='solo'?2:settings.players),settings));setPaused(false);setBid(0);setSaved(null);
 }
 function resume(){
  if(!saved)return;setSettings(saved.settings);setSession(sessionFor(saved.match,saved.settings));setPaused(true);setBid(0);setSaved(null);
 }
 function confirm(){
  if(paused)return;
  setSession(s=>{
   if(!s||s.covered||s.match.phase!=='bidding')return s;
   const player=settings.mode==='solo'?0:currentBidder(s.match);
   let updated=submitBid(s.match,player,s.match.round,bid);
   if(updated===s.match)return s;
   if(settings.mode==='solo')updated=submitBid(updated,1,updated.round,s.bot);
   return {...s,match:updated,covered:settings.mode==='local'&&updated.phase==='bidding'};
  });setBid(0);
 }
 const scores=match?.piles.map(collectionScore)||[];
 const leaders=scores.flatMap((score,i)=>score===Math.max(...scores)?[i]:[]);
 const result=match?.history.at(-1);
 return <section className="relic-auction" aria-label="Leilão de Relíquias">
  <header><p className="ra-eyebrow">Orçamento, disputa e coleção</p><h2 ref={heading} tabIndex={-1}>{paused?'Leilão pausado':!session?'Leilão de Relíquias':match!.phase==='finished'?'Leilão concluído':session.covered?`Vez de ${playerName(current)}`:match!.phase==='reveal'?'Lances revelados':`Lote ${match!.round+1} de 9`}</h2></header>
  {!storageOK&&<p role="status">Não foi possível salvar neste navegador. Você pode jogar, mas recarregar pode perder o andamento.</p>}
  {!session?<>
   {saved&&<aside aria-label="Leilão salvo"><p>Há um leilão salvo no lote {saved.match.round+1} de 9.</p><button onClick={resume}>Retomar leilão salvo</button><button onClick={()=>{discardAuction();setSaved(null);}}>Descartar leilão salvo</button></aside>}
   <p>Dispute nove relíquias com 30 moedas por pessoa. O maior lance leva a peça e paga o que ofereceu; quem perde guarda as moedas.</p>
   <label>Modo de jogo<select aria-label="Modo de jogo" value={settings.mode} onChange={e=>setSettings(s=>({...s,mode:e.target.value as Settings['mode'],players:e.target.value==='solo'?2:s.players}))}><option value="solo">Solo contra o bot</option><option value="local">Dupla ou grupo local</option></select></label>
   {settings.mode==='local'?<label>Participantes<select aria-label="Participantes" value={settings.players} onChange={e=>setSettings(s=>({...s,players:Number(e.target.value)}))}>{[2,3,4].map(n=><option key={n} value={n}>{n} pessoas</option>)}</select></label>:<><label>Dificuldade do bot<select aria-label="Dificuldade do bot" value={settings.level} onChange={e=>setSettings(s=>({...s,level:e.target.value as Settings['level']}))}>{Object.entries(levels).map(([value,name])=><option key={value} value={value}>{name}</option>)}</select></label><p>{levelHelp[settings.level]}</p></>}
   <details><summary>Como vencer e como desempatar</summary><p>Some o valor das peças. Duas da mesma família dão +3 pontos; três dão +8, substituindo o bônus do par. Os grupos não se sobrepõem. Quem tiver mais pontos vence; pontuações iguais empatam.</p><p>O limite é 10 moedas por lance. Zero significa passar. Se todos passarem, o lote é descartado. A prioridade de empate gira a cada lote e aparece antes do lance.</p><p>Os lances ficam ocultos até todos confirmarem. No grupo, passe o aparelho usando a cortina. Isso dá privacidade visual, sem proteger contra inspeção do aparelho.</p></details>
   <p className="ra-note">Andamento salvo neste aparelho por até sete dias. Offline depende dos arquivos já armazenados pelo navegador. Sem dinheiro real, cadastro ou rede.</p>
   <button onClick={()=>start()}>Começar leilão</button>
  </>:paused?<><p>Seu orçamento, coleção e lances foram preservados.</p><button onClick={()=>setPaused(false)}>Continuar leilão</button></>:<>
   {match!.phase==='finished'?<>
    <p className="ra-outcome" role="status">{leaders.length===1?`${playerName(leaders[0])} venceu!`:`Empate: ${leaders.map(playerName).join(', ')}.`}</p>
    <p>Resultados desta partida; não competem com recordes de outros modos.</p>
    <button onClick={()=>start()}>Jogar novamente</button><button onClick={()=>start(match!.seed)}>Repetir os mesmos lotes</button><button onClick={()=>setSession(null)}>Alterar configuração</button>
   </>:session.covered?<div className="ra-curtain"><p>Entregue o aparelho a {playerName(current)}. Quem já respondeu deve olhar para outro lado.</p><button onClick={()=>setSession(s=>s?{...s,covered:false}:s)}>Estou pronto</button></div>:match!.phase==='reveal'?<>
    <p className="ra-outcome" role="status">{result!.winner===null?'Todos passaram. O lote foi descartado.':`${playerName(result!.winner)} levou ${result!.relic.name} por ${result!.price} moedas.`}</p>
    <ul className="ra-bids" aria-label="Lances da rodada">{result!.bids.map((value,i)=><li key={i}>{playerName(i)}: <strong>{value} moedas</strong></li>)}</ul>
    <button onClick={()=>{setSession(s=>s&&s.match.phase==='reveal'?sessionFor(nextLot(s.match),settings):s);setBid(0);}}>{match!.round===8?'Ver resultado':'Próximo lote'}</button>
   </>:<>
    <div className="ra-lot" data-family={match!.lots[match!.round].family}><RelicMark family={match!.lots[match!.round].family}/><div><h3>{match!.lots[match!.round].name}</h3><p>{familyNames[match!.lots[match!.round].family]} · {match!.lots[match!.round].value} pontos</p></div></div>
    <p>Empate de lances favorece {playerName(priority(match!))}. Zero é passar.</p>
    <p>{playerName(current)} tem <strong>{match!.coins[current]} moedas</strong>. Esta peça acrescentaria {collectionScore([...match!.piles[current],match!.lots[match!.round]])-scores[current]} pontos à sua coleção.</p>
    <label>Seu lance<select aria-label="Valor do lance" value={bid} onChange={e=>setBid(Number(e.target.value))}>{Array.from({length:Math.min(10,match!.coins[current])+1},(_,i)=><option key={i} value={i}>{i===0?'0 — Passar':`${i} moedas`}</option>)}</select></label>
    <button onClick={confirm}>Confirmar lance secreto</button>
   </>}
   <div className="ra-scoreboard" aria-label="Coleções e orçamento">{match!.piles.map((pile,i)=><section key={i}><h3>{playerName(i)}</h3><p><strong>{scores[i]} pontos</strong> · {match!.coins[i]} moedas</p><ul>{pile.map(relic=><li key={relic.id}>{relic.name} · {familyNames[relic.family]} · {relic.value}</li>)}</ul>{!pile.length&&<p>Nenhuma relíquia ainda.</p>}</section>)}</div>
   {match!.phase!=='finished'&&<><details><summary>Próximos lotes e bônus</summary><p>Par da mesma família: +3. Trio: +8 no lugar do par. Grupos não se sobrepõem.</p><ol>{match!.lots.slice(match!.round+1).map(relic=><li key={relic.id}>{relic.name} · {familyNames[relic.family]} · {relic.value} pontos</li>)}</ol></details><button onClick={()=>setPaused(true)}>Pausar leilão</button></>}
  </>}
 </section>;
}
