import {useEffect,useState} from "react";
import {aligned,createClocks,moveClocks,nextClocks,pointerPhase,resetClocks,undoClocks,type Difficulty} from "./rules";
import "./ClockPhases.css";
export default function ClockPhases({record,onRecord}:{record:number;onRecord:(n:number)=>void}){
 const [game,setGame]=useState(()=>createClocks());
 useEffect(()=>{if(game.phase==="won"&&game.score>record)onRecord(game.score);},[game.phase,game.score,record,onRecord]);
 return <section className="clock-phases" data-clock-phases aria-label="Ponteiros em Fase">
  <div className="clock-stats"><p>Tempo simulado <strong>{game.time} minutos</strong></p>
   <p>Comandos <strong>{game.moves}</strong></p><p>Recorde <strong>{Math.max(record,game.score)}</strong></p></div>
  <p>Os relógios têm ciclos diferentes, mas todos avançam juntos. Encontre o instante em que cada ponteiro aponta para o norte (fase zero). Use as durações e fases para deduzir o encontro; avance 1, 5 ou 10 minutos e volte 1 se ultrapassar. Não é necessário acertar por sorte.</p>
  <label className="clock-difficulty">Dificuldade
   <select value={game.difficulty} aria-label="Dificuldade de Ponteiros em Fase"
    onChange={e=>setGame(createClocks(Number(e.target.value) as Difficulty,game.seed))}>
    <option value="0">Fácil — 3 relógios</option><option value="1">Normal — 4 relógios</option><option value="2">Difícil — 5 relógios</option>
   </select></label>
  <div className="clock-grid" role="group" aria-label="Relógios em andamento">
   {game.periods.map((period,i)=>{const phase=pointerPhase(period,game.time,game.target);return <div className="clock-item" key={period}
     aria-label={`Relógio ${i+1}, ciclo ${period} minutos, fase ${phase} de ${period}`}>
      <strong>Relógio {i+1}</strong>
      <div className="clock-face" aria-hidden="true"><span style={{transform:`rotate(${360*phase/period}deg)`}}>↑</span></div>
      <span>Ciclo: {period} minutos</span><span>Fase: {phase}/{period}</span>
     </div>;})}
  </div>
  {game.phase==="won"&&<p className="clock-result" role="status">Sincronização completa! Todos os ponteiros apontam para o norte. {game.score} pontos em {game.moves} comandos.</p>}
  <div className="clock-actions">
   <button type="button" disabled={game.phase==="won"} onClick={()=>setGame(g=>moveClocks(g,1))}>Avançar 1 minuto</button>
   <button type="button" disabled={game.phase==="won"} onClick={()=>setGame(g=>moveClocks(g,5))}>Avançar 5 minutos</button>
   <button type="button" disabled={game.phase==="won"} onClick={()=>setGame(g=>moveClocks(g,10))}>Avançar 10 minutos</button>
   <button type="button" disabled={game.time===0||game.phase==="won"} onClick={()=>setGame(g=>moveClocks(g,-1))}>Voltar 1 minuto</button>
   <button type="button" disabled={!game.history.length} onClick={()=>setGame(undoClocks)}>Desfazer</button>
   <button type="button" onClick={()=>setGame(resetClocks)}>Reiniciar</button>
   <button type="button" onClick={()=>setGame(nextClocks)}>Novo desafio</button>
  </div>
  <p className="clock-note">Os ciclos avançam simultaneamente. Use Tab e Enter ou toque nos comandos; o painel mantém os valores numéricos visíveis sem depender apenas da cor. Sem bot nem modo online.</p>
 </section>;
}
