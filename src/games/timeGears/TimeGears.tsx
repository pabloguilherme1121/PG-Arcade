import {useEffect,useState} from "react";
import {newTimeGears,rotateGear,undoGear,resetGears,nextGears,scoreGears,type GearDifficulty} from "./rules";
import "./TimeGears.css";
const arrows=["↑","→","↓","←"] as const;
const levels=["Iniciante","Intermediário","Avançado"] as const;
export default function TimeGears({record,onRecord}:{record:number;onRecord:(value:number)=>void}){
  const [game,setGame]=useState(()=>newTimeGears(0,13));
  const score=scoreGears(game);
  useEffect(()=>{if(game.phase==="won"&&score>record)onRecord(score);},[game.phase,score,record,onRecord]);
  return <section className="time-gears" data-time-gears aria-label="Engrenagens do Tempo">
    <p>Gire as engrenagens até todas apontarem para cima. Cada giro move a engrenagem escolhida e as vizinhas no sentido contrário.</p>
    <div className="time-gears-toolbar">
      <label>Dificuldade <select aria-label="Dificuldade das engrenagens" value={game.difficulty}
        onChange={e=>setGame(newTimeGears(Number(e.target.value) as GearDifficulty,game.seed))}>
        {levels.map((name,i)=><option value={i} key={name}>{name}</option>)}
      </select></label>
      <span>Movimentos: <strong data-gear-moves>{game.moves}</strong></span>
      <span>Recorde: <strong>{Math.max(record,score)}</strong> pontos</span>
    </div>
    <div className="time-gears-grid" role="group" aria-label="Engrenagens conectadas">
      {game.turns.map((turn,index)=><div className="time-gear" key={index}>
        <strong>Engrenagem {index+1}</strong>
        <span className="time-gear-dial" data-gear-dial={index} data-gear-direction={turn} aria-label={`Direção ${["cima","direita","baixo","esquerda"][turn]}`}>{arrows[turn]}</span>
        <div className="time-gear-controls">
          <button type="button" disabled={game.phase==="won"} aria-label={`Engrenagem ${index+1}, girar para a esquerda`}
            onClick={()=>setGame(g=>rotateGear(g,index,-1))}>↶</button>
          <button type="button" disabled={game.phase==="won"} aria-label={`Engrenagem ${index+1}, girar para a direita`}
            onClick={()=>setGame(g=>rotateGear(g,index,1))}>↷</button>
        </div>
      </div>)}
    </div>
    <div className="time-gears-actions">
      <button type="button" onClick={()=>setGame(undoGear)} disabled={!game.history.length}>Desfazer giro</button>
      <button type="button" onClick={()=>setGame(resetGears)}>Reiniciar desafio</button>
      <button type="button" onClick={()=>setGame(nextGears)}>Novo desafio</button>
    </div>
    <p className="time-gears-result" role="status" aria-live="polite">
      {game.phase==="won"?`Engrenagens alinhadas! Você venceu com ${game.moves} movimentos e ${score} pontos.`:
        `${game.turns.filter(n=>n===0).length} de ${game.turns.length} engrenagens alinhadas. ${levels[game.difficulty]}.`}
    </p>
    <p className="time-gears-note">Toque ou use Tab, Enter e Espaço para girar. Desfazer recupera o giro anterior. Jogo gratuito, sem relógio, bot ou conexão online.</p>
  </section>;
}