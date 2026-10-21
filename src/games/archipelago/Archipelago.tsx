import {useEffect,useState} from "react";
import {createArchipelago,nextArchipelago,restartArchipelago,setBridge,undoBridge,type Difficulty} from "./rules";
import "./Archipelago.css";
export default function Archipelago({record,onRecord}:{record:number;onRecord:(n:number)=>void}){
 const [game,setGame]=useState(()=>createArchipelago());
 useEffect(()=>{if(game.phase==="won"&&game.score>record)onRecord(game.score);},[game.phase,game.score,record,onRecord]);
 const pad=48,step=61;
 return <section className="archipelago-game" data-archipelago aria-label="Pontes do Arquipélago">
  <div className="archipelago-stats"><p>Movimentos <strong>{game.moves}</strong></p><p>Recorde <strong>{Math.max(record,game.score)}</strong></p><p>Ilhas <strong>{game.islands.length}</strong></p></div>
  <p>Ligue todas as ilhas usando uma ou duas pontes entre vizinhas alinhadas. Cada ilha precisa receber exatamente o número mostrado e nenhuma ponte pode cruzar outra.</p>
  <label>Desafio <select aria-label="Dificuldade de Pontes do Arquipélago" value={game.difficulty} onChange={e=>setGame(createArchipelago(Number(e.target.value) as Difficulty,game.seed))}>
   <option value="0">Fácil — 6 ilhas</option><option value="1">Normal — 8 ilhas</option><option value="2">Difícil — 9 ilhas</option></select></label>
  <svg viewBox="0 0 340 340" className="archipelago-map" role="img" aria-label="Mapa das ilhas, pontes e números">
   {game.bridges.map((b,i)=>{const a=game.islands[b.a],c=game.islands[b.b],horizontal=a.y===c.y;
    const x1=pad+a.x*step,y1=pad+a.y*step,x2=pad+c.x*step,y2=pad+c.y*step;
    return <g key={i} data-bridge-map={i}>
     {b.count===0?<line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#5d819a" strokeWidth="3" strokeDasharray="6 8"/>:
      Array.from({length:b.count},(_,k)=><line key={k} x1={x1+(horizontal?0:(k-(b.count-1)/2)*7)} y1={y1+(horizontal?(k-(b.count-1)/2)*7:0)}
       x2={x2+(horizontal?0:(k-(b.count-1)/2)*7)} y2={y2+(horizontal?(k-(b.count-1)/2)*7:0)} stroke="#bef1cb" strokeWidth="5" strokeLinecap="round"/>)}
    </g>;
   })}
   {game.islands.map(island=>{const current=game.bridges.reduce((n,b)=>n+((b.a===island.id||b.b===island.id)?b.count:0),0);
    return <g key={island.id} data-island={island.id}><circle cx={pad+island.x*step} cy={pad+island.y*step} r="21" stroke={current===island.goal?"#abf3c7":"#f5c97f"} strokeWidth="4" fill="#254258"/>
      <text x={pad+island.x*step} y={pad+island.y*step+6} fontSize="19" fontWeight="bold" fill="white" textAnchor="middle">{island.goal}</text></g>;
   })}
  </svg>
  <div className="archipelago-links" role="group" aria-label="Pontes disponíveis">
   {game.bridges.map((b,i)=><button key={i} type="button" data-bridge={i} disabled={game.phase==="won"}
    aria-label={`Ligar ilha ${b.a+1} a ${b.b+1}, ${b.count} pontes`} onClick={()=>setGame(g=>setBridge(g,i))}>
    <strong>Ilhas {b.a+1}–{b.b+1}</strong><span>{b.count} {b.count===1?"ponte":"pontes"}</span></button>)}
  </div>
  {game.phase==="won"&&<p role="status" className="archipelago-result">Todas as ilhas conectadas! {game.score} pontos em {game.moves} movimentos.</p>}
  <div className="archipelago-actions"><button onClick={()=>setGame(undoBridge)} disabled={!game.history.length}>Desfazer</button>
   <button onClick={()=>setGame(restartArchipelago)}>Reiniciar</button><button onClick={()=>setGame(nextArchipelago)}>Novas ilhas</button></div>
  <p className="archipelago-note">Toque em um par de ilhas para alternar 0, 1 ou 2 pontes. Cruzamentos são bloqueados. Use Tab e Enter no teclado. Jogo solo e offline.</p>
 </section>;
}
