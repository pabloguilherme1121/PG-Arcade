import {useEffect,useState} from "react";
import {coverage,newBeaconDefense,nextBeacon,resetBeacon,toggleBeacon,undoBeacon,redundancy,type Difficulty} from "./rules";
import "./LighthouseDefense.css";
export default function LighthouseDefense({record,onRecord}:{record:number;onRecord:(n:number)=>void}){
 const [game,setGame]=useState(()=>newBeaconDefense());
 useEffect(()=>{if(game.phase==="won"&&game.score>record)onRecord(game.score);},[game.phase,game.score,record,onRecord]);
 const counts=coverage(game),covered=counts.filter(n=>n>=1).length,overlap=redundancy(counts);
 return <section className="lighthouse-defense" data-lighthouse-defense aria-label="Defesa de Faróis">
  <div className="beacon-stats"><p>Trechos iluminados <strong>{covered}/{game.routes.length}</strong></p>
   <p>Faróis <strong>{game.selected.length}/{game.budget}</strong></p>
   <p>Sobreposição <strong>{overlap}/{game.overlapLimit}</strong></p>
   <p>Recorde <strong>{Math.max(game.score,record)}</strong></p></div>
  <p>Posicione faróis nos nove pontos permitidos para iluminar os trechos marcados da rota. Cada farol ilumina casas a até duas quadras de distância, contando ruas horizontais e verticais. Você tem um número limitado de faróis e não pode ultrapassar o limite de sobreposição das luzes.</p>
  <label className="beacon-difficulty">Dificuldade
   <select aria-label="Dificuldade de Defesa de Faróis" value={game.difficulty}
    onChange={e=>setGame(newBeaconDefense(Number(e.target.value) as Difficulty,game.seed))}>
    <option value="0">Fácil — 5×5, 2 faróis</option>
    <option value="1">Normal — 7×7, 3 faróis</option>
    <option value="2">Difícil — 9×9, 4 faróis</option>
   </select></label>
  <div className="beacon-map-scroll" role="region" aria-label="Mapa de rotas com rolagem horizontal" tabIndex={0}>
   <div className="beacon-board" role="grid" aria-label="Posicionamento de faróis" style={{minWidth:`${game.size*45}px`}}>
   {Array.from({length:game.size},(_,row)=><div className="beacon-row" role="row" key={row}
     style={{gridTemplateColumns:`repeat(${game.size},minmax(0,1fr))`}}>
    {Array.from({length:game.size},(_,col)=>{
     const cell=row*game.size+col,slot=game.slots.indexOf(cell);
     const selected=game.selected.includes(slot),routeIndex=game.routes.indexOf(cell);
     const lit=routeIndex>=0&&counts[routeIndex]>0;
     return slot>=0?
      <button key={cell} type="button" role="gridcell" data-beacon-slot={slot} data-selected={selected}
       disabled={game.phase==="won"} aria-pressed={selected}
       aria-label={`Ponto ${slot+1}: linha ${row+1}, coluna ${col+1}, ${selected?"farol instalado":"sem farol"}`}
       onClick={()=>setGame(g=>toggleBeacon(g,slot))}>
       <span aria-hidden="true">{selected?"◆":"◈"}</span>{routeIndex>=0&&<small aria-hidden="true">{lit?"✓":"●"}</small>}
      </button>:
      <span key={cell} role="gridcell" data-route-cell={routeIndex>=0} data-lit={lit}
       aria-label={`Linha ${row+1}, coluna ${col+1}, ${routeIndex>=0?"trecho "+(lit?"iluminado":"escuro"):"sem rota"}`}>
       {routeIndex>=0?(lit?"✓":"●"):""}
      </span>;
    })}
   </div>)}
   </div>
  </div>
  <p className="beacon-detail" role="status">{covered} trechos cobertos. {overlap>game.overlapLimit?
   `Excesso de ${overlap-game.overlapLimit} sobreposições; reposicione os faróis.`:
   `Limite restante de sobreposição: ${game.overlapLimit-overlap}.`}</p>
  {game.phase==="won"&&<p className="beacon-victory" role="status">Todos os trechos estão iluminados dentro do limite! {game.score} pontos.</p>}
  <div className="beacon-actions">
   <button type="button" onClick={()=>setGame(undoBeacon)} disabled={!game.history.length}>Desfazer</button>
   <button type="button" onClick={()=>setGame(resetBeacon)}>Reiniciar</button>
   <button type="button" onClick={()=>setGame(nextBeacon)}>Novo arquipélago</button>
  </div>
  <p className="beacon-note">Quadrado ◈: local disponível para um farol; ◆: farol instalado; ●: trecho da rota; ✓: trecho iluminado. O mapa é rolável em celulares pequenos. Use toque, Tab ou Enter. Sem bot ou rede.</p>
 </section>;
}
