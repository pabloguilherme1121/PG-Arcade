import {useEffect,useState} from "react";
import {availableCards,climateNames,getPower,newClimateGame,nextClimate,nextPlayer,playClimateCard,restartClimate,terrainAt,terrainNames,winningPlayer,type Difficulty} from "./rules";
import "./ClimateCards.css";
export default function ClimateCards({record,onRecord}:{record:number;onRecord:(score:number)=>void}){
 const [game,setGame]=useState(()=>newClimateGame());
 useEffect(()=>{if(game.phase==="finished"){const value=Math.max(...game.scores);if(value>record)onRecord(value);}},[game.phase,game.scores,record,onRecord]);
 const terrain=terrainAt(game);
 const winner=winningPlayer(game);
 return <section className="climate-cards" data-climate-cards aria-label="Cartas de Climas">
  <div className="climate-stats">
   <p>Jogador 1 <strong>{game.scores[0]} pts</strong></p>
   <p>Jogador 2 <strong>{game.scores[1]} pts</strong></p>
   <p>Rodadas <strong>{game.round}/{game.rounds}</strong></p>
   <p>Recorde <strong>{Math.max(record,...game.scores)}</strong></p>
  </div>
  <p>Duelo presencial para exatamente duas pessoas no mesmo aparelho. Em cada rodada, cada jogador escolhe uma carta em segredo: Sol domina Planície, Chuva domina Floresta e Vento domina Costa. A carta ganha 3 pontos de força no terreno certo. Quem tiver maior força conquista 2 pontos de vitória; empate dá 1 a cada.</p>
  <label className="climate-difficulty">Duração do duelo
   <select aria-label="Dificuldade de Cartas de Climas" value={game.difficulty} onChange={e=>setGame(newClimateGame(Number(e.target.value) as Difficulty,game.seed))}>
    <option value="0">Rápido — 3 rodadas</option>
    <option value="1">Normal — 4 rodadas</option>
    <option value="2">Longo — 5 rodadas</option>
   </select>
  </label>
  {game.phase!=="finished"&&<p className="climate-terrain" role="status">Terreno da rodada {game.round+1}: <strong>{terrainNames[terrain]}</strong>. Bônus para cartas de {climateNames[terrain]} (+3 de força).</p>}
  {game.phase==="choosing"&&<div className="climate-turn">
   <h3>Vez do Jogador {game.player+1}</h3>
   <p>Escolha uma das suas cartas disponíveis. Cartas escolhidas deixam sua mão para o restante da partida.</p>
   <div className="climate-hand" role="group" aria-label={`Cartas do Jogador ${game.player+1}`}>
    {availableCards(game).map(card=><button type="button" key={card.id} data-climate-card={card.id}
     onClick={()=>setGame(g=>playClimateCard(g,card.id))}
     aria-label={`Usar carta ${climateNames[card.climate]} de força ${card.power}, bônus ${getPower(card,terrain)-card.power}`}>
     <strong>{climateNames[card.climate]}</strong><span>Força {card.power}</span>
     <small>{card.climate===terrain?`Bônus +3 · Total ${getPower(card,terrain)}`:"Sem bônus"}</small>
    </button>)}
   </div>
  </div>}
  {game.phase==="handoff"&&<div className="climate-handoff" role="status">
   <strong>Entregue o aparelho ao Jogador {game.player+1}</strong>
   <p>As cartas do outro jogador estão ocultas. Só continue depois que ele estiver com a tela.</p>
   <button type="button" onClick={()=>setGame(nextPlayer)}>Estou pronto — revelar minhas cartas</button>
  </div>}
  {game.history.length>0&&<ol className="climate-results" aria-label="Resultados das rodadas">
   {game.history.map((entry,i)=><li key={i}>
    Rodada {i+1} — {terrainNames[entry.terrain]}: força {entry.first} × {entry.second}.
    {" "}{entry.winner===null?"Empate":`Vitória do Jogador ${entry.winner+1}`}.
   </li>)}
  </ol>}
  {game.phase==="finished"&&<p className="climate-final" role="status">
   {winner===null?"Duelo empatado!":`Jogador ${winner+1} venceu!`} Placar final: {game.scores[0]} × {game.scores[1]}.
  </p>}
  <div className="climate-actions">
   <button type="button" onClick={()=>setGame(restartClimate)}>Reiniciar duelo</button>
   <button type="button" onClick={()=>setGame(nextClimate)}>Novo baralho</button>
  </div>
  <p className="climate-note">As mãos dos jogadores são independentes, geradas por seed reproduzível. As escolhas só são reveladas no resultado, após as duas jogadas. Funciona offline com toque e teclado, sem bot ou partida online.</p>
 </section>;
}
