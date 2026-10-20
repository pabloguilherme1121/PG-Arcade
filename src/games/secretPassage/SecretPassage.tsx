import {useEffect,useState} from "react";
import {createPassage,startPlan,chooseMove,undoMove,lockPlan,replayPassage,type PassagePlayers,type PassageMove} from "./rules";
import "./SecretPassage.css";

const movement:readonly {id:PassageMove;label:string;symbol:string}[]=[
  {id:"up",label:"Cima",symbol:"↑"},
  {id:"left",label:"Esquerda",symbol:"←"},
  {id:"wait",label:"Esperar",symbol:"·"},
  {id:"right",label:"Direita",symbol:"→"},
  {id:"down",label:"Baixo",symbol:"↓"},
];
const iconOf:Record<PassageMove,string>={up:"↑",left:"←",wait:"·",right:"→",down:"↓"};
export default function SecretPassage({record,onRecord}:{record:number;onRecord:(n:number)=>void}) {
  const [game,setGame]=useState(()=>createPassage(2,17));
  useEffect(()=>{const best=Math.max(...game.scores);if(game.phase==="result"&&best>record)onRecord(best);},[game.phase,game.scores,record,onRecord]);
  useEffect(()=>{
    if(game.phase!=="planning")return;
    const conceal=()=>setGame(current=>current.phase==="planning"?{...current,phase:"handoff"}:current);
    const hidden=()=>{if(document.visibilityState==="hidden")conceal();};
    window.addEventListener("blur",conceal);
    document.addEventListener("visibilitychange",hidden);
    return()=>{window.removeEventListener("blur",conceal);document.removeEventListener("visibilitychange",hidden);};
  },[game.phase]);
  const word=(pos:number)=>{
    if(game.walls.includes(pos))return "Parede";
    const current=game.positions.findIndex(playerPos=>playerPos===pos);
    if(current>=0)return `Explorador ${current+1}`;
    if(game.gems.includes(pos))return pos===12?"Cristal central":"Cristal";
    return "Passagem livre";
  };
  const showRoute=game.phase==="result";
  return <section className="secret-passage" data-secret-passage aria-label="Passagem Secreta">
    <div className="passage-summary"><p>Participantes <strong>{game.players}</strong></p>
      <p>Planos <strong>{game.routes.filter(route=>route.length===4).length}/{game.players}</strong></p>
      <p>Recorde <strong>{Math.max(record,...game.scores)}</strong></p></div>
    <p className="passage-explain">Planeje secretamente quatro passos em um labirinto compartilhado. Todos se movem ao mesmo tempo: dois exploradores que tentarem ocupar a mesma casa colidem e não avançam. Cristais rendem pontos; chegar ao centro vale mais.</p>
    <div className="passage-board" role="grid" aria-label="Mapa de cinco linhas e cinco colunas">
      {Array.from({length:5},(_,row)=><div role="row" className="passage-row" key={row}>
        {Array.from({length:5},(_,col)=>{
          const pos=row*5+col;
          const here=game.positions.findIndex(p=>p===pos);
          const wall=game.walls.includes(pos);
          const gem=game.gems.includes(pos)&&!game.claimed.includes(pos);
          return <span role="gridcell" key={pos} data-passage-tile={wall?"wall":here>=0?"player":gem?"gem":"empty"}
            aria-label={`Linha ${row+1}, coluna ${col+1}: ${word(pos)}`}>
            <span aria-hidden="true">{wall?"▥":here>=0?String(here+1):gem?pos===12?"✦":"◆":""}</span>
          </span>;
        })}
      </div>)}
    </div>
    {game.phase==="handoff"&&<div className="passage-handoff">
      {game.player===0&&game.routes.every(route=>route.length===0)&&<label>Jogadores
        <select aria-label="Jogadores de Passagem Secreta" value={game.players}
          onChange={e=>setGame(createPassage(Number(e.target.value) as PassagePlayers,game.seed))}>
          {[2,3,4].map(n=><option key={n} value={n}>{n} pessoas</option>)}
        </select></label>}
      <strong>Passe o aparelho ao explorador {game.player+1}</strong>
      <p>Os planos anteriores estão escondidos. Cada pessoa escolhe seus passos em particular.</p>
      <button onClick={()=>setGame(startPlan)} aria-label={`Planejar rota do explorador ${game.player+1}`}>Planejar minha rota</button>
    </div>}
    {game.phase==="planning"&&<div className="passage-planning" role="region" aria-label={`Rota privada do explorador ${game.player+1}`}>
      <strong>Explorador {game.player+1} · escolha quatro movimentos</strong>
      <p>Passos escolhidos: {game.draft.length}/4</p>
      <div className="passage-route" aria-label="Rota preparada">{game.draft.length?game.draft.map((move,i)=><span key={i}>{iconOf[move]}</span>):"Nenhum passo ainda"}</div>
      <div className="passage-actions" role="group" aria-label="Direções da rota">
        {movement.map(m=><button key={m.id} disabled={game.draft.length===4} onClick={()=>setGame(g=>chooseMove(g,m.id))}
          aria-label={`Adicionar ${m.label}`}>{m.symbol}<span>{m.label}</span></button>)}
      </div>
      <div className="passage-controls">
        <button onClick={()=>setGame(undoMove)} disabled={game.draft.length===0}>Desfazer último passo</button>
        <button onClick={()=>setGame(lockPlan)} disabled={game.draft.length!==4}>Confirmar e ocultar rota</button>
      </div>
    </div>}
    {showRoute&&<div className="passage-result" role="status">
      <strong>Rodada resolvida — quatro turnos simultâneos</strong>
      <p>Colisões: {game.collisions}. Cristais recolhidos: {game.claimed.length}.</p>
      <ol>{game.scores.map((score,i)=><li key={i}>Explorador {i+1}: <strong>{score} pontos</strong>
        {game.winners.includes(i)?" — melhor percurso":""} · {game.routes[i].map(move=>iconOf[move]).join(" ")}</li>)}</ol>
      <p>Posições por turno: {game.history.map((frame,i)=>`T${i+1}: ${frame.positions.map(pos=>`${Math.floor(pos/5)+1}×${pos%5+1}`).join(" / ")}`).join("; ")}</p>
    </div>}
    <button onClick={()=>setGame(replayPassage)}>Novo percurso</button>
    <p className="passage-note">Competição local no mesmo celular, sem sala online. Cada participante usa os botões, passa o aparelho e só depois todos os trajetos são revelados. Teclado: Tab e Enter.</p>
  </section>;
}
