import {useEffect,useState} from "react";
import {countJoinedEdges,newEdgeGame,nextEdges,restartEdges,rotatedEdges,turnEdge,undoEdge,type Difficulty} from "./rules";
import "./EnchantedEdges.css";
const colors=["#71818d","#edbd7b","#84d9f4","#9df0c3"];
const colorNames=["fechada","âmbar","ciano","jade"];
export default function EnchantedEdges({record,onRecord}:{record:number;onRecord:(n:number)=>void}){
 const [game,setGame]=useState(()=>newEdgeGame());
 useEffect(()=>{if(game.phase==="won"&&game.score>record)onRecord(game.score);},[game.phase,game.score,record,onRecord]);
 const total=2*game.size*(game.size-1),joined=countJoinedEdges(game);
 return <section className="enchanted-edges" data-enchanted-edges aria-label="Bordas Encantadas">
  <div className="edge-stats"><p>Conexões <strong>{joined}/{total}</strong></p><p>Rotações <strong>{game.moves}</strong></p><p>Recorde <strong>{Math.max(record,game.score)}</strong></p></div>
  <p>Gire as peças até que duas bordas vizinhas tenham a mesma cor, sem deixar saídas abertas na moldura externa. Bordas cinzentas representam paredes fechadas; conexões internas devem ter uma cor. Cada toque gira uma peça 90°.</p>
  <label className="edge-difficulty">Desafio <select aria-label="Dificuldade de Bordas Encantadas" value={game.difficulty}
    onChange={e=>setGame(newEdgeGame(Number(e.target.value) as Difficulty,game.seed))}>
    <option value="0">Fácil — 3×3</option><option value="1">Normal — 4×4</option><option value="2">Difícil — 5×5</option>
   </select></label>
  <div className="edge-legend" aria-label="Legenda das bordas"><span>Fechada</span><span>Âmbar</span><span>Ciano</span><span>Jade</span></div>
  <div className="edge-board" role="group" aria-label="Peças giratórias" style={{gridTemplateColumns:`repeat(${game.size},minmax(0,1fr))`}}>
   {game.tiles.map((tile,index)=>{const edges=rotatedEdges(tile);
    return <button type="button" key={index} data-edge-tile={index} data-rotation={tile.rotation}
      disabled={game.phase==="won"} aria-label={`Peça linha ${Math.floor(index/game.size)+1}, coluna ${index%game.size+1}: cima ${colorNames[edges[0]]}, direita ${colorNames[edges[1]]}, baixo ${colorNames[edges[2]]}, esquerda ${colorNames[edges[3]]}. Girar 90 graus`}
      onClick={()=>setGame(g=>turnEdge(g,index))}
      style={{borderTopColor:colors[edges[0]],borderRightColor:colors[edges[1]],borderBottomColor:colors[edges[2]],borderLeftColor:colors[edges[3]]}}>
      <span aria-hidden="true">⟳</span></button>;
   })}
  </div>
  {game.phase==="won"&&<p className="edge-result" role="status">Todas as bordas coincidem! {game.score} pontos em {game.moves} rotações.</p>}
  <div className="edge-actions"><button onClick={()=>setGame(undoEdge)} disabled={!game.history.length}>Desfazer</button>
   <button onClick={()=>setGame(restartEdges)}>Reiniciar</button><button onClick={()=>setGame(nextEdges)}>Novo mosaico</button></div>
  <p className="edge-note">Toque ou use Tab e Enter para girar. O mosaico tem uma solução garantida e pode admitir outras combinações válidas. Não há cronômetro, bot ou serviço online.</p>
 </section>;
}
