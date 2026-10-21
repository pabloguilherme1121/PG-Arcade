import {useEffect,useState} from "react";
import {changeSwitch,createRails,modeNames,nextRails,resetRails,testRoute,type Difficulty} from "./rules";
import "./RailSwitches.css";
const trains=["A","B","C"] as const;
export default function RailSwitches({record,onRecord}:{record:number;onRecord:(score:number)=>void}) {
 const [game,setGame]=useState(()=>createRails());
 useEffect(()=>{if(game.phase==="won"&&game.score>record)onRecord(game.score);},[game.phase,game.score,record,onRecord]);
 return <section className="rail-switches" data-rail-switches aria-label="Trilhos Cruzados">
  <div className="rail-stats"><p>Testes de rota <strong>{game.attempts}</strong></p><p>Desvios alterados <strong>{game.edits}</strong></p><p>Recorde <strong>{Math.max(record,game.score)}</strong></p></div>
  <p>Três trens partem dos trilhos 1, 2 e 3. Configure os desvios para que cada trem chegue à saída designada. Cada desvio troca a posição de dois trens ou deixa todos seguindo reto. Os movimentos são simultâneos: não há colisões falsas.</p>
  <label className="rail-difficulty">Dificuldade
   <select aria-label="Dificuldade de Trilhos Cruzados" value={game.difficulty}
    onChange={e=>setGame(createRails(Number(e.target.value) as Difficulty,game.seed))}>
    <option value="0">Fácil — 3 desvios</option><option value="1">Normal — 4 desvios</option><option value="2">Difícil — 5 desvios</option>
   </select></label>
  <div className="rail-objectives" role="group" aria-label="Destinos dos trens">
   {trains.map((train,i)=><p key={train}>Trem <strong>{train}</strong> <span aria-hidden="true">→</span> saída <strong>{game.target[i]+1}</strong></p>)}
  </div>
  <div className="rail-track" role="group" aria-label="Configuração da ferrovia">
   {game.switches.map((mode,i)=><button key={i} type="button" data-rail-switch={i}
    aria-label={`Alterar desvio ${i+1}: ${modeNames[mode]}`}
    disabled={game.phase==="won"} onClick={()=>setGame(g=>changeSwitch(g,i))}>
    <span>Desvio {i+1}</span><strong>{modeNames[mode]}</strong>
    <span aria-hidden="true">{mode===0?"║ ║ ║":mode===1?"╲╱ ║":"║ ╲╱"}</span>
   </button>)}
  </div>
  {game.lastRoute&&<div role="status" className="rail-feedback">
   <strong>{game.phase==="won"?"Todos os trens chegaram aos destinos!":"Confira os desvios e tente outra rota."}</strong>
   <ol>{trains.map((train,i)=><li key={train}>Trem {train}: saída {game.lastRoute![i]+1} — {game.lastRoute![i]===game.target[i]?"correta":"esperada "+(game.target[i]+1)}</li>)}</ol>
   {game.phase==="won"&&<p>Vitória com {game.score} pontos!</p>}
  </div>}
  <div className="rail-actions">
   <button type="button" onClick={()=>setGame(testRoute)} disabled={game.phase==="won"}>Testar percurso</button>
   <button type="button" onClick={()=>setGame(resetRails)}>Reiniciar desvios</button>
   <button type="button" onClick={()=>setGame(nextRails)}>Nova ferrovia</button>
  </div>
  <p className="rail-note">Controles: toque ou Tab e Enter. Os três trens percorrem a mesma sequência de desvios. Sem bot, partida online ou cronômetro.</p>
 </section>;
}
