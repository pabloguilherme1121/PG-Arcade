import {useEffect,useState} from "react";
import {currentTide,disembark,newRescueGame,nextRescue,refuelBoat,rescueSurvivor,restartRescue,sail,sailingFuel,siteNames,waitForTide,type Difficulty,type RescueSite} from "./rules";
import "./RescueBoats.css";
export default function RescueBoats({record,onRecord}:{record:number;onRecord:(score:number)=>void}){
 const [game,setGame]=useState(()=>newRescueGame());
 useEffect(()=>{if(game.phase==="won"&&game.score>record)onRecord(game.score);},[game.phase,game.score,record,onRecord]);
 return <section className="rescue-boats" data-rescue-boats aria-label="Barcos de Resgate">
  <div className="rescue-stats"><p>Resgatados <strong>{game.delivered}/{game.active.length}</strong></p>
   <p>Combustível <strong>{game.fuel}/{game.maxFuel}</strong></p><p>Turnos <strong>{game.turns}/{game.maxTurns}</strong></p>
   <p>Recorde <strong>{Math.max(record,game.score)}</strong></p></div>
  <p>Resgate as pessoas nas ilhas e leve-as de volta à Base Costeira. A embarcação comporta dois passageiros. O consumo depende da distância e da maré: a maré alta custa uma unidade extra. Planeje combustível, ordem das ilhas e retornos antes que os turnos acabem.</p>
  <label className="rescue-difficulty">Dificuldade <select aria-label="Dificuldade de Barcos de Resgate" value={game.difficulty}
   onChange={e=>setGame(newRescueGame(Number(e.target.value) as Difficulty,game.seed))}>
   <option value="0">Fácil — 2 pessoas, 16 turnos</option>
   <option value="1">Normal — 3 pessoas, 22 turnos</option>
   <option value="2">Difícil — 4 pessoas, 28 turnos</option>
  </select></label>
  <div className="rescue-status" role="status">
   <strong>Local atual: {siteNames[game.site]}</strong>
   <span>Maré: {currentTide(game)} · A bordo: {game.onboard.length}/2 · Reserva na base: {game.depot} unidades</span>
   <span>Ilhas aguardando: {game.remaining.length}</span>
  </div>
  <div className="rescue-destinations" role="group" aria-label="Navegar até ilhas ou base">
   {siteNames.map((name,i)=>{const dest=i as RescueSite,cost=sailingFuel(game,dest);
    const active=game.remaining.includes(dest);
    return <button key={name} type="button" data-rescue-destination={i} data-rescue-active={active}
     disabled={game.phase!=="playing"||cost===null||cost>game.fuel}
     onClick={()=>setGame(g=>sail(g,dest))}>
     <strong>{name}</strong><span>{i===game.site?"Você está aqui":cost===null?"":`Custo: ${cost} combustível`}</span>
     <small>{active?"Uma pessoa aguardando":game.active.includes(dest)?"Pessoa já resgatada":i===0?"Desembarque e abasteça":"Sem pedido de resgate"}</small>
    </button>;
   })}
  </div>
  <div className="rescue-actions" role="group" aria-label="Ações de resgate">
   <button type="button" disabled={game.phase!=="playing"||game.site===0||!game.remaining.includes(game.site)||game.onboard.length>=2}
    onClick={()=>setGame(rescueSurvivor)}>Resgatar pessoa</button>
   <button type="button" disabled={game.phase!=="playing"||game.site!==0||!game.onboard.length}
    onClick={()=>setGame(disembark)}>Desembarcar na base</button>
   <button type="button" disabled={game.phase!=="playing"||game.site!==0||game.fuel===game.maxFuel||game.depot===0}
    onClick={()=>setGame(refuelBoat)}>Abastecer na base</button>
   <button type="button" disabled={game.phase!=="playing"} onClick={()=>setGame(waitForTide)}>Aguardar maré</button>
  </div>
  {game.phase!=="playing"&&<p className="rescue-result" role="status">
   {game.phase==="won"?`Todos os resgates concluídos! ${game.score} pontos.`:
    `O tempo da missão terminou após ${game.maxTurns} turnos. Pessoas ainda em risco: ${game.active.length-game.delivered}.`}
  </p>}
  <ol className="rescue-log" aria-label="Histórico da missão">
   {[...game.events].reverse().slice(0,7).map(entry=><li key={entry.turn}>{entry.message} — turno {entry.turn}</li>)}
  </ol>
  <div className="rescue-reset">
   <button type="button" onClick={()=>setGame(restartRescue)}>Reiniciar missão</button>
   <button type="button" onClick={()=>setGame(nextRescue)}>Nova missão</button>
  </div>
  <p className="rescue-note">As marés mudam a cada ação. Você pode navegar entre ilhas ou retornar à base para desembarcar e abastecer. Toda missão tem uma solução demonstrável. Solo e offline, com toque ou teclado.</p>
 </section>;
}
