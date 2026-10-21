import {useEffect,useState} from "react";
import {createRelayGame,nextRelay,relayMetrics,restartRelay,toggleRelay,undoRelay,type Difficulty} from "./rules";
import "./RelayNetwork.css";
export default function RelayNetwork({record,onRecord}:{record:number;onRecord:(n:number)=>void}){
 const [game,setGame]=useState(()=>createRelayGame());
 useEffect(()=>{if(game.phase==="won"&&game.score>record)onRecord(game.score);},[game.phase,game.score,record,onRecord]);
 const m=relayMetrics(game);
 return <section className="relay-network" data-relay-network aria-label="Rede de Relés">
  <div className="relay-stats" role="status">
   <p>Dispositivos online <strong>{m.covered.length}/{game.devices.length}</strong></p>
   <p>Relés instalados <strong>{game.selected.length}/{game.budget}</strong></p>
   <p>Energia <strong>{m.energyUsed}/{game.energy}</strong></p>
   <p>Recorde <strong>{Math.max(record,game.score)}</strong></p>
  </div>
  <p>Leve comunicação da Base aos dispositivos remotos. Coloque relés nos locais permitidos: cada relé precisa estar até 3 quadras de outro relé já conectado ou da Base e cobre dispositivos a até 2 quadras. Relés sem ligação não transmitem sinal. Cubra todos os dispositivos sem ultrapassar o orçamento de antenas e energia.</p>
  <label className="relay-difficulty">Complexidade de comunicação
   <select aria-label="Dificuldade de Rede de Relés" value={game.difficulty}
    onChange={e=>setGame(createRelayGame(Number(e.target.value) as Difficulty,game.seed))}>
    <option value="0">Fácil — 2 dispositivos, 5×5</option>
    <option value="1">Normal — 3 dispositivos, 6×6</option>
    <option value="2">Difícil — 4 dispositivos, 7×7</option>
   </select></label>
  <div className="relay-scroll" role="region" aria-label="Mapa de antenas rolável" tabIndex={0}>
   <div className="relay-board" role="group" aria-label="Pontos de relés e dispositivos" style={{gridTemplateColumns:`repeat(${game.size},minmax(0,1fr))`}}>
    {Array.from({length:game.size*game.size},(_,i)=>{
      const slot=game.slots.includes(i),device=game.devices.includes(i),base=i===game.base,
        selected=game.selected.includes(i),linked=m.linked.includes(i),covered=m.covered.includes(i);
      if(slot) return <button type="button" key={i} data-relay-slot={i} data-relay-online={linked}
       aria-pressed={selected} disabled={game.phase==="won"}
       aria-label={`Ponto de relé linha ${Math.floor(i/game.size)+1}, coluna ${i%game.size+1}: ${selected?linked?"ativo e conectado":"instalado sem conexão":"sem antena"}`}
       onClick={()=>setGame(g=>toggleRelay(g,i))}>
       <span aria-hidden="true">{selected?"⌁":"◌"}</span><small>{selected?(linked?"Online":"Isolado"):"Instalar"}</small>
      </button>;
      return <div key={i} className="relay-tile" role="img" data-relay-device={device} data-relay-covered={covered}
       aria-label={base?"Base principal":device?`Dispositivo ${game.devices.indexOf(i)+1}, ${covered?"online":"offline"}`:"Terreno livre"}>
       <span aria-hidden="true">{base?"◉":device?"▣":"·"}</span>
       {base&&<small>Base</small>}{device&&<small>{covered?"Ligado":"Sem sinal"}</small>}
      </div>;
    })}
   </div>
  </div>
  <p className="relay-feedback" role="status">Antenas desconectadas: {m.unlinked}.
   {" "}Dispositivos sem cobertura: {game.devices.length-m.covered.length}.
   {" "}Energia livre: {game.energy-m.energyUsed}.
  </p>
  {game.phase==="won"&&<p className="relay-win" role="status">Rede completa! Todos os dispositivos comunicam com a Base. {game.score} pontos.</p>}
  <div className="relay-actions">
   <button type="button" disabled={!game.history.length} onClick={()=>setGame(undoRelay)}>Desfazer antena</button>
   <button type="button" onClick={()=>setGame(restartRelay)}>Reiniciar</button>
   <button type="button" onClick={()=>setGame(nextRelay)}>Nova região</button>
  </div>
  <p className="relay-note">◉ Base; ▣ dispositivo; ◌ local para instalar. O alcance considera apenas deslocamentos horizontais/verticais. A rede depende de todos os relés instalados estarem conectados. Offline, sem bot, toque ou teclado.</p>
 </section>;
}
