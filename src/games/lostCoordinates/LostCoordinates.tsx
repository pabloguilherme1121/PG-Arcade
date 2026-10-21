import {useEffect,useState} from "react";
import {candidateCount,confirmCoordinate,manhattan,newCoordinates,nextCoordinates,restartCoordinates,revealBeacon,selectCoordinate,type Difficulty} from "./rules";
import "./LostCoordinates.css";
export default function LostCoordinates({record,onRecord}:{record:number;onRecord:(n:number)=>void}){
 const [game,setGame]=useState(()=>newCoordinates());
 useEffect(()=>{if(game.phase==="won"&&game.score>record)onRecord(game.score);},[game.phase,game.score,record,onRecord]);
 const candidates=candidateCount(game);
 return <section className="lost-coordinates" data-lost-coordinates aria-label="Coordenadas Perdidas">
  <div className="coords-stats"><p>Tentativas <strong>{game.attempts}/3</strong></p><p>Possíveis <strong>{candidates}</strong></p><p>Recorde <strong>{Math.max(record,game.score)}</strong></p></div>
  <p>Encontre um ponto escondido no mapa. Cada farol informa sua posição e a distância em quadras até o destino: conte passos horizontais e verticais, sem diagonais. Use as pistas para marcar uma casa e confirmar sua coordenada. Três tentativas e pistas extras opcionais.</p>
  <label className="coords-difficulty">Dificuldade <select aria-label="Dificuldade de Coordenadas Perdidas" value={game.difficulty}
   onChange={e=>setGame(newCoordinates(Number(e.target.value) as Difficulty,game.seed))}>
   <option value="0">Fácil — mapa 5×5, três pistas</option>
   <option value="1">Normal — mapa 7×7, duas pistas</option>
   <option value="2">Difícil — mapa 9×9, uma pista</option>
  </select></label>
  <div className="coords-clues" aria-label="Distâncias dos faróis">
   {game.beacons.map((beacon,i)=><p key={i} data-coord-beacon={i}>
    <strong>Farol {i+1}</strong> {game.shown>i?
     `linha ${Math.floor(beacon.position/game.size)+1}, coluna ${beacon.position%game.size+1}: ${beacon.distance} quadras`
     :"pista ainda não revelada"}
   </p>)}
  </div>
  <div className="coords-scroll" role="region" aria-label="Mapa de coordenadas rolável" tabIndex={0}>
   <div className="coords-grid" role="grid" aria-label="Selecione uma coordenada" style={{minWidth:`${game.size*46}px`}}>
    {Array.from({length:game.size},(_,row)=><div className="coords-row" role="row" key={row} style={{gridTemplateColumns:`repeat(${game.size},minmax(0,1fr))`}}>
     {Array.from({length:game.size},(_,col)=>{
      const index=row*game.size+col,selected=game.selected===index;
      const beacon=game.beacons.findIndex(b=>b.position===index);
      return <button role="gridcell" type="button" key={index} data-coord-cell={index} data-coord-selected={selected}
       disabled={game.phase!=="playing"} aria-pressed={selected}
       aria-label={`Linha ${row+1}, coluna ${col+1}${beacon>=0?", farol "+(beacon+1):""}`}
       onClick={()=>setGame(g=>selectCoordinate(g,index))}>
       <span aria-hidden="true">{beacon>=0?"◆":selected?"●":""}</span>
      </button>;
     })}
    </div>)}
   </div>
  </div>
  {game.selected!==null&&<p className="coords-selection" aria-live="polite">Selecionado: linha {Math.floor(game.selected/game.size)+1}, coluna {game.selected%game.size+1}.
   {" "}Distâncias calculadas: {game.beacons.slice(0,game.shown).map((beacon,i)=>`Farol ${i+1}: ${manhattan(game.size,game.selected!,beacon.position)}`).join(" · ")}.</p>}
  {game.attempts>0&&<p role="status" className="coords-feedback">
    {game.phase==="won"?`Destino localizado! ${game.score} pontos.`:game.phase==="lost"?"Acabaram suas três tentativas.":"Posição incorreta; revise as pistas e tente novamente."}
    {game.lastDistance!==null&&game.phase!=="won"&&` Seu último palpite estava a ${game.lastDistance} quadras do destino.`}
  </p>}
  <div className="coords-actions">
   <button type="button" onClick={()=>setGame(confirmCoordinate)} disabled={game.selected===null||game.phase!=="playing"}>Confirmar coordenada</button>
   <button type="button" onClick={()=>setGame(revealBeacon)} disabled={game.shown===3||game.phase!=="playing"}>Revelar outra pista</button>
   <button type="button" onClick={()=>setGame(restartCoordinates)}>Reiniciar</button>
   <button type="button" onClick={()=>setGame(nextCoordinates)}>Novo mapa</button>
  </div>
  <p className="coords-note">Em celulares pequenos o mapa rola horizontalmente para manter casas tocáveis. Use Tab e Enter; as coordenadas têm rótulos de linha e coluna. Jogo solo e offline.</p>
 </section>;
}
