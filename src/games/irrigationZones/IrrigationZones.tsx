import {useEffect,useState} from "react";
import {edgeKey,measureFlow,newIrrigationGame,nextIrrigation,resetIrrigation,tapIrrigationCell,undoIrrigation,type Difficulty} from "./rules";
import "./IrrigationZones.css";
export default function IrrigationZones({record,onRecord}:{record:number;onRecord:(score:number)=>void}){
 const [game,setGame]=useState(()=>newIrrigationGame());
 useEffect(()=>{if(game.phase==="won"&&game.score>record)onRecord(game.score);},[game.phase,game.score,record,onRecord]);
 const m=measureFlow(game);
 return <section className="irrigation-zones" data-irrigation-zones aria-label="Zonas de Irrigação">
  <div className="irrigation-stats" role="status">
   <p>Campos irrigados <strong>{m.watered}/{game.fields.length}</strong></p>
   <p>Água utilizada <strong>{m.used}/{game.supply}</strong></p>
   <p>Canais <strong>{game.edges.length}/{game.pipeBudget}</strong></p>
   <p>Recorde <strong>{Math.max(record,game.score)}</strong></p>
  </div>
  <p>Conduza água da nascente aos campos por uma rede de canais. Cada canal usa uma conexão ortogonal; clique em duas casas vizinhas para abrir ou fechar um canal. Campos consomem água conforme sua demanda. Pontas abertas sem campo desperdiçam uma unidade; para vencer, todos os campos precisam receber água, sem vazamentos e dentro do orçamento de canais.</p>
  <label className="irrigation-difficulty">Complexidade da rede
   <select aria-label="Dificuldade de Zonas de Irrigação" value={game.difficulty}
    onChange={e=>setGame(newIrrigationGame(Number(e.target.value) as Difficulty,game.seed))}>
    <option value="0">Fácil — dois campos, 4×4</option>
    <option value="1">Normal — três campos, 5×5</option>
    <option value="2">Difícil — quatro campos, 6×6</option>
   </select></label>
  <div className="irrigation-scroll" role="region" aria-label="Mapa de irrigação rolável" tabIndex={0}>
   <div className="irrigation-board" role="group" aria-label="Canais e campos" style={{gridTemplateColumns:`repeat(${game.size},minmax(0,1fr))`}}>
    {Array.from({length:game.size*game.size},(_,i)=>{
     const field=game.fields.indexOf(i),spring=i===game.source,selected=game.selected===i,wet=m.reachable.includes(i);
     const right=(i%game.size)!==game.size-1&&game.edges.includes(edgeKey(i,i+1));
     const down=i+game.size<game.size*game.size&&game.edges.includes(edgeKey(i,i+game.size));
     return <button type="button" key={i} data-irrigation-cell={i} data-irrigation-selected={selected}
      data-irrigation-right={right} data-irrigation-down={down} data-irrigation-wet={wet}
      disabled={game.phase==="won"}
      aria-pressed={selected}
      aria-label={`Casa linha ${Math.floor(i/game.size)+1}, coluna ${i%game.size+1}: ${spring?"nascente":field>=0?`campo, demanda ${game.demands[field]}`:"terreno"}, ${wet?"conectada":"sem água"}`}
      onClick={()=>setGame(g=>tapIrrigationCell(g,i))}>
      <span aria-hidden="true">{spring?"◉":field>=0?"♣":"·"}</span>
      {field>=0&&<small>Campo {field+1}</small>}
      {spring&&<small>Fonte</small>}
     </button>;
    })}
   </div>
  </div>
  <div className="irrigation-feedback" role="status">
   {game.selected===null?"Selecione uma casa e depois uma vizinha para abrir ou fechar um canal.":`Casa ${game.selected+1} selecionada. Escolha uma casa vizinha.`}
   {" "}Vazamentos: {m.leaks}. Água livre: {m.available}.
  </div>
  {game.phase==="won"&&<p className="irrigation-win" role="status">Irrigação concluída, sem vazamentos! {game.score} pontos.</p>}
  <div className="irrigation-actions">
   <button type="button" disabled={!game.history.length} onClick={()=>setGame(undoIrrigation)}>Desfazer canal</button>
   <button type="button" onClick={()=>setGame(resetIrrigation)}>Reiniciar</button>
   <button type="button" onClick={()=>setGame(nextIrrigation)}>Novo terreno</button>
  </div>
  <p className="irrigation-note">◉ nascente, ♣ campo. Linhas claras indicam canais abertos. Apenas conexões horizontais/verticais são permitidas. Sem robôs, rede ou compras; funciona offline com toque e teclado.</p>
 </section>;
}
