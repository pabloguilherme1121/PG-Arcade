import {useEffect,useState} from "react";
import {composeShadows,createShadowVault,nextShadow,restartShadow,turnShutter,undoShutter,type Difficulty} from "./rules";
import "./ShadowVault.css";
function ShadowBoard({mask,title}:{mask:readonly number[];title:string}){
 return <div className="shadow-panel" aria-label={title}>
  <strong>{title}</strong>
  <div className="shadow-board" role="grid" aria-label={title}>
   {Array.from({length:4},(_,row)=><div role="row" key={row} className="shadow-row">
    {mask.slice(row*4,row*4+4).map((v,col)=><span key={col} role="gridcell" data-shadow-state={v}
      aria-label={`Linha ${row+1}, coluna ${col+1}: ${v?"escuro":"claro"}`}/>)}
   </div>)}
  </div>
 </div>;
}
export default function ShadowVault({record,onRecord}:{record:number;onRecord:(score:number)=>void}){
 const [game,setGame]=useState(()=>createShadowVault());
 useEffect(()=>{if(game.phase==="won"&&game.score>record)onRecord(game.score);},[game.phase,game.score,record,onRecord]);
 const current=composeShadows(game.orientations);
 const matches=current.filter((v,i)=>v===game.target[i]).length;
 return <section className="shadow-vault" data-shadow-vault aria-label="Cofre de Sombras">
  <div className="shadow-stats"><p>Movimentos <strong>{game.moves}</strong></p><p>Casas corretas <strong>{matches}/16</strong></p><p>Recorde <strong>{Math.max(record,game.score)}</strong></p></div>
  <p>Abra o cofre reproduzindo exatamente a silhueta de referência. Cada veneziana gira uma máscara de 90°; quando duas máscaras se sobrepõem, os filtros alternados anulam a sombra. Compare as 16 casas claras e escuras antes de mudar outra veneziana.</p>
  <label className="shadow-difficulty">Desafio
   <select aria-label="Dificuldade de Cofre de Sombras" value={game.difficulty}
     onChange={e=>setGame(createShadowVault(Number(e.target.value) as Difficulty,game.seed))}>
     <option value="0">Fácil — 3 venezianas</option><option value="1">Normal — 4 venezianas</option><option value="2">Difícil — 5 venezianas</option>
   </select></label>
  <div className="shadow-comparison">
   <ShadowBoard mask={game.target} title="Sombra objetivo"/>
   <ShadowBoard mask={current} title="Sombra atual"/>
  </div>
  <div className="shadow-controls" role="group" aria-label="Girar venezianas">
   {game.orientations.map((rotation,i)=><button type="button" key={i} data-shutter={i} disabled={game.phase==="won"}
     aria-label={`Girar veneziana ${i+1}, orientação ${rotation*90} graus`}
     onClick={()=>setGame(g=>turnShutter(g,i))}>
     <strong>Veneziana {i+1}</strong><span>{rotation*90}°</span>
   </button>)}
  </div>
  {game.phase==="won"&&<p className="shadow-result" role="status">Cofre aberto! A silhueta está completa. {game.score} pontos em {game.moves} movimentos.</p>}
  <div className="shadow-actions">
   <button type="button" onClick={()=>setGame(undoShutter)} disabled={!game.history.length}>Desfazer</button>
   <button type="button" onClick={()=>setGame(restartShadow)}>Reiniciar</button>
   <button type="button" onClick={()=>setGame(nextShadow)}>Novo cofre</button>
  </div>
  <p className="shadow-note">Jogue com toque, Tab e Enter; os estados claros e escuros têm rótulos para leitores de tela. Jogo solo sem rede e sem timer.</p>
 </section>;
}
