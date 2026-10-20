import { useCallback, useEffect, useState } from "react";
import { useAutoPause } from "../useAutoPause";
import {
  createFruitGame, startFruitGame, pauseFruitGame, resumeFruitGame, dropFruit,
  fruitSize, type FruitDifficulty,
} from "./engine";
import "./FruitFusion.css";
const fruitNames=["Vazio","Cereja","Limão","Maçã","Uva","Melão","Fruta dourada"];
const fruitIcons=["","●","◆","⬢","✿","✦","★"];
const levelLabels:Record<FruitDifficulty,string>={
  easy:"Fácil · 35 jogadas",normal:"Normal · 27 jogadas",hard:"Difícil · 21 jogadas",
};
export default function FruitFusion({record,onRecord}:{record:number;onRecord:(value:number)=>void}) {
  const [game,setGame]=useState(()=>createFruitGame("normal",5));
  const pause=useCallback(()=>setGame(pauseFruitGame),[]);
  useAutoPause(pause,game.phase==="playing",game.phase==="won"||game.phase==="lost",game.score);
  const place=useCallback((column:number)=>setGame(game=>dropFruit(game,column)),[]);
  useEffect(()=>{
    if(game.phase==="won"||game.phase==="lost")onRecord(Math.max(record,game.score));
  },[game.phase,game.score,record,onRecord]);
  useEffect(()=>{
    const keyboard=(event:KeyboardEvent)=>{
      if(event.repeat||event.isComposing||event.altKey||event.metaKey||event.ctrlKey)return;
      if(event.target instanceof HTMLElement && event.target.closest("input,textarea,select,[contenteditable='true'],dialog"))return;
      const column=Number(event.key)-1;
      if(!Number.isInteger(column)||column<0||column>=fruitSize.width)return;
      if(game.phase!=="playing")return;
      event.preventDefault();
      place(column);
    };
    window.addEventListener("keydown",keyboard);
    return()=>window.removeEventListener("keydown",keyboard);
  },[game.phase,place]);
  const message=game.phase==="ready"?"Escolha a dificuldade e comece."
    :game.phase==="paused"?"Jogo pausado. Continue quando quiser."
    :game.phase==="won"?"Fruta dourada criada! Você venceu."
    :game.phase==="lost"?"Desafio encerrado. Tente outra combinação."
    :"Toque numa coluna para deixar a próxima fruta cair.";
  return <section className="fruit-fusion" data-fruit-fusion aria-label="Frutas em Fusão">
    <div className="fruit-status">
      <p>Pontos <strong>{game.score}</strong></p>
      <p>Jogadas <strong>{game.turn}/{game.turnLimit}</strong></p>
      <p>Próxima fruta <strong>{fruitNames[game.next]}</strong></p>
      <p>Recorde <strong>{Math.max(record,game.score)}</strong></p>
    </div>
    {game.phase==="ready"&&<div className="fruit-setup">
      <label>Dificuldade <select aria-label="Dificuldade de Frutas em Fusão"
        value={game.difficulty} onChange={e=>setGame(createFruitGame(e.target.value as FruitDifficulty,game.seed))}>
          {Object.entries(levelLabels).map(([v,label])=><option value={v} key={v}>{label}</option>)}
        </select></label>
      <button onClick={()=>setGame(startFruitGame)}>Começar fusão</button>
    </div>}
    <p className="fruit-guidance">Junte duas frutas iguais para subir um nível. As peças caem com a gravidade; fusões em cadeia valem mais pontos. Alcance a fruta dourada antes das jogadas acabarem.</p>
    <div className="fruit-board" role="grid" aria-label="Tabuleiro de seis colunas e sete linhas">
      {game.cells.map((tier,i)=><span role="gridcell" key={i}
        aria-label={`Linha ${Math.floor(i/fruitSize.width)+1}, coluna ${i%fruitSize.width+1}: ${fruitNames[tier]}`}
        data-fruit-tier={tier}>{fruitIcons[tier]}</span>)}
    </div>
    {game.phase==="playing"&&<div className="fruit-columns" role="group" aria-label="Escolher coluna para jogar">
      {Array.from({length:fruitSize.width},(_,i)=>{
        const full=game.cells[i]!==0;
        return <button type="button" key={i} disabled={full}
          aria-label={`Jogar na coluna ${i+1}`} onClick={()=>place(i)}>{i+1} ↓</button>;
      })}
    </div>}
    {game.phase==="playing"&&<button onClick={pause}>Pausar</button>}
    {game.phase==="paused"&&<button onClick={()=>setGame(resumeFruitGame)}>Continuar</button>}
    <p className="fruit-message" role="status" aria-live="polite">{message}</p>
    <button onClick={()=>setGame(prev=>createFruitGame(prev.difficulty,(prev.seed+1)>>>0))}>
      Novo desafio
    </button>
    <p className="fruit-help">Teclado: números de 1 a 6. No celular, toque na coluna. Pausa automática quando o app perde foco. Sem anúncios, compras ou internet obrigatória após armazenar o jogo.</p>
  </section>;
}
