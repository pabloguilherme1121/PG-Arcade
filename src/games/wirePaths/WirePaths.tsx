import {useEffect,useState} from "react";
import {applyWire,newWireGame,nextWire,ownerAt,restartWire,undoWire,type Difficulty} from "./rules";
import "./WirePaths.css";
export default function WirePaths({record,onRecord}:{record:number;onRecord:(n:number)=>void}){
 const [game,setGame]=useState(()=>newWireGame());
 useEffect(()=>{if(game.phase==="won"&&game.score>record)onRecord(game.score);},[game.phase,game.score,record,onRecord]);
 const completed=game.paths.filter((p,i)=>p.length>=2&&p.at(-1)===game.pairs[i].target).length;
 return <section className="wire-game" data-wire-game aria-label="Fio Condutor">
  <div className="wire-stats">
   <p>Conexões <strong>{completed}/{game.pairs.length}</strong></p>
   <p>Passos <strong>{game.moves}</strong></p>
   <p>Recorde <strong>{Math.max(game.score,record)}</strong></p>
  </div>
  <p>Conecte cada ponto de origem ao destino da mesma cor. Toque na origem e depois em casas vizinhas para desenhar o fio. Fios de cores diferentes não podem compartilhar casas e as casas bloqueadas impedem a passagem. Conclua todas as ligações para vencer.</p>
  <label className="wire-difficulty">Dificuldade
   <select aria-label="Dificuldade de Fio Condutor" value={game.difficulty}
    onChange={e=>setGame(newWireGame(Number(e.target.value) as Difficulty,game.seed))}>
    <option value="0">Fácil — 5×5, duas conexões</option>
    <option value="1">Normal — 6×6, três conexões</option>
    <option value="2">Difícil — 7×7, três conexões</option>
   </select></label>
  <div className="wire-legend" role="group" aria-label="Cores e conexões">
   {game.pairs.map((pair,i)=><span key={pair.name} data-wire-legend={i}>{pair.name}: {game.paths[i].at(-1)===pair.target?"conectado":"pendente"}</span>)}
  </div>
  <div className="wire-board" role="grid" aria-label="Tabuleiro de fios" style={{gridTemplateRows:`repeat(${game.size},minmax(0,1fr))`}}>
   {Array.from({length:game.size},(_,row)=><div className="wire-row" role="row" key={row} style={{gridTemplateColumns:`repeat(${game.size},minmax(0,1fr))`}}>
    {Array.from({length:game.size},(_,col)=>{
      const index=row*game.size+col,owner=ownerAt(game,index),blocked=game.blocked.includes(index);
      const start=game.pairs.findIndex(p=>p.source===index),end=game.pairs.findIndex(p=>p.target===index);
      const type=blocked?"blocked":start>=0?"start":end>=0?"end":owner!==null?"path":"empty";
      return <button type="button" role="gridcell" key={index} data-wire-cell={index} data-wire-type={type} data-wire-owner={owner??""}
       disabled={blocked||game.phase==="won"}
       aria-label={`Linha ${row+1}, coluna ${col+1}: ${blocked?"bloqueada":start>=0?"origem "+game.pairs[start].name:end>=0?"destino "+game.pairs[end].name:owner!==null?"fio "+game.pairs[owner].name:"vazia"}`}
       onClick={()=>setGame(g=>applyWire(g,index))}>
       <span aria-hidden="true">{blocked?"✕":start>=0?"●":end>=0?"◎":owner!==null?"━":""}</span>
      </button>;
    })}
   </div>)}
  </div>
  {game.phase==="won"&&<p className="wire-result" role="status">Todas as conexões foram concluídas! Você ganhou {game.score} pontos em {game.moves} passos.</p>}
  <div className="wire-actions">
   <button type="button" onClick={()=>setGame(undoWire)} disabled={game.active===null&&game.paths.every(p=>p.length<2)}>Desfazer</button>
   <button type="button" onClick={()=>setGame(restartWire)}>Reiniciar</button>
   <button type="button" onClick={()=>setGame(nextWire)}>Novo circuito</button>
  </div>
  <p className="wire-note">Controles por toque ou Tab e Enter. Toque na casa anterior para voltar um passo. Sem bot nem multiplayer online; o desafio possui ao menos uma solução.</p>
 </section>;
}
