import {useEffect,useState} from "react";
import {changeCube,getCubeViews,newHiddenCubes,nextCubes,restartCubes,undoCube,type Difficulty} from "./rules";
import "./HiddenCubes.css";
export default function HiddenCubes({record,onRecord}:{record:number;onRecord:(n:number)=>void}){
 const [game,setGame]=useState(()=>newHiddenCubes());
 useEffect(()=>{if(game.phase==="won"&&game.score>record)onRecord(game.score);},[game.phase,game.score,record,onRecord]);
 const views=getCubeViews(game.heights,game.size);
 const correct=game.target.top.filter((value,i)=>value===views.top[i]).length;
 return <section className="hidden-cubes" data-hidden-cubes aria-label="Cubos Ocultos">
  <div className="cubes-stats"><p>Movimentos <strong>{game.moves}</strong></p><p>Casas corretas <strong>{correct}/{game.size*game.size}</strong></p><p>Recorde <strong>{Math.max(record,game.score)}</strong></p></div>
  <p>Reconstrua uma escultura de cubos pelas três vistas. A planta indica quais casas têm pilhas, e os números da frente e da lateral mostram a maior altura vista de cada direção. Toque em uma casa para aumentar sua altura de 0 até o máximo e voltar a 0.</p>
  <label className="cubes-difficulty">Dificuldade
   <select aria-label="Dificuldade de Cubos Ocultos" value={game.difficulty}
    onChange={e=>setGame(newHiddenCubes(Number(e.target.value) as Difficulty,game.seed))}>
    <option value="0">Fácil — 3×3, 2 camadas</option>
    <option value="1">Normal — 4×4, 3 camadas</option>
    <option value="2">Difícil — 5×5, 4 camadas</option>
   </select></label>
  <div className="cubes-target">
   <div><strong>Planta da escultura</strong><div className="cubes-top" role="grid" aria-label="Vista superior exigida" style={{gridTemplateColumns:`repeat(${game.size},minmax(0,1fr))`}}>
    {game.target.top.map((cell,i)=><span key={i} data-cube-target={cell} aria-label={`Linha ${Math.floor(i/game.size)+1}, coluna ${i%game.size+1}: ${cell?"ocupada":"vazia"}`} role="gridcell">{cell?"■":"·"}</span>)}
   </div></div>
   <div className="cubes-projections"><strong>Alturas-alvo</strong>
    <p>Frente (colunas): <b>{game.target.front.join(" · ")}</b></p>
    <p>Lateral (linhas): <b>{game.target.side.join(" · ")}</b></p>
   </div>
  </div>
  <div className="cubes-construction">
   <div className="cubes-board" role="grid" aria-label="Construir a escultura" style={{gridTemplateColumns:`repeat(${game.size},minmax(0,1fr))`}}>
    {game.heights.map((height,i)=><button type="button" key={i} data-cube-cell={i} data-cube-height={height} disabled={game.phase==="won"}
      aria-label={`Linha ${Math.floor(i/game.size)+1}, coluna ${i%game.size+1}: altura ${height}. Aumentar pilha`}
      onClick={()=>setGame(g=>changeCube(g,i))}>
      <span className="cube-stack" style={{height:`${Math.max(0,height/game.limit*100)}%`}} aria-hidden="true"/>
      <strong>{height}</strong>
    </button>)}
   </div>
   <p className="cubes-current" aria-label="Projeções atuais">Frente atual: <strong>{views.front.join(" · ")}</strong>. Lateral atual: <strong>{views.side.join(" · ")}</strong>.</p>
  </div>
  {game.phase==="won"&&<p className="cubes-victory" role="status">Escultura reconstruída! {game.score} pontos com {game.moves} movimentos.</p>}
  <div className="cubes-actions">
   <button type="button" onClick={()=>setGame(undoCube)} disabled={!game.history.length}>Desfazer</button>
   <button type="button" onClick={()=>setGame(restartCubes)}>Reiniciar</button>
   <button type="button" onClick={()=>setGame(nextCubes)}>Nova escultura</button>
  </div>
  <p className="cubes-note">Pode haver mais de uma escultura correta: qualquer configuração que reproduza exatamente as três projeções vence. Jogo solo, offline, com toque, Tab e Enter, sem cronômetro nem bot.</p>
 </section>;
}
