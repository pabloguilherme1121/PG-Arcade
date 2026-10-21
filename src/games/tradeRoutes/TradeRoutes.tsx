import {useEffect,useState} from "react";
import {buyCargo,cargoCount,cargoNames,cityNames,moveTrader,netProfit,newTradeGame,nextTrade,refuel,restartTrade,routeFuel,sellCargo,type City,type Difficulty} from "./rules";
import "./TradeRoutes.css";
export default function TradeRoutes({record,onRecord}:{record:number;onRecord:(n:number)=>void}){
 const [game,setGame]=useState(()=>newTradeGame());
 useEffect(()=>{if(game.phase==="won"&&game.score>record)onRecord(game.score);},[game.phase,game.score,record,onRecord]);
 return <section className="trade-routes" data-trade-routes aria-label="Mercadores de Rotas">
  <div className="trade-stats"><p>Lucro <strong>{netProfit(game)}/{game.goal}</strong></p>
   <p>Combustível <strong>{game.fuel}/{game.maxFuel}</strong></p>
   <p>Turnos <strong>{game.turns}/{game.maxTurns}</strong></p><p>Recorde <strong>{Math.max(record,game.score)}</strong></p></div>
  <p>Compre grãos no Porto, cristais na Serra e ervas no Vale. Planeje a rota até a Capital, onde os produtos são vendidos com lucro. Você tem combustível, 22 moedas iniciais e espaço para três cargas. Alcance o lucro da missão antes de acabar o limite de turnos.</p>
  <label className="trade-difficulty">Dificuldade
   <select aria-label="Dificuldade de Mercadores de Rotas" value={game.difficulty}
    onChange={e=>setGame(newTradeGame(Number(e.target.value) as Difficulty,game.seed))}>
    <option value="0">Fácil — lucro 10, 9 turnos</option>
    <option value="1">Normal — lucro 18, 12 turnos</option>
    <option value="2">Difícil — lucro 25, 14 turnos</option>
   </select></label>
  <div className="trade-summary" role="status">
   <strong>Cidade atual: {cityNames[game.city]}</strong>
   <span>Caixa: {game.credits} moedas · Carga: {cargoCount(game)}/3</span>
   <span>Inventário: {game.inventory.map((n,i)=>`${cargoNames[i]} ${n}`).join(" · ")}</span>
  </div>
  <div className="trade-markets" role="group" aria-label="Preços nos mercados">
   {cargoNames.map((name,i)=><p key={name}><strong>{name}</strong><span>Comprar: {game.buyPrices[i]} em {cityNames[i]}</span>
    <span>Vender: {game.sellPrices[i]} na Capital</span><span>Estoque: {game.stock[i]}</span></p>)}
  </div>
  <div className="trade-buy" role="group" aria-label="Negociar mercadorias">
   <button type="button" disabled={game.phase!=="playing"||game.city===3||cargoCount(game)>=3||game.credits<(game.buyPrices[game.city]??999)}
    onClick={()=>setGame(g=>buyCargo(g,1))}>Comprar 1 carga</button>
   <button type="button" disabled={game.phase!=="playing"||game.city===3||cargoCount(game)>1||game.credits<2*(game.buyPrices[game.city]??999)}
    onClick={()=>setGame(g=>buyCargo(g,2))}>Comprar 2 cargas</button>
   <button type="button" disabled={game.phase!=="playing"||game.city!==3||cargoCount(game)===0}
    onClick={()=>setGame(sellCargo)}>Vender tudo na Capital</button>
   <button type="button" disabled={game.phase!=="playing"||game.city!==0||game.fuel>game.maxFuel-5||game.credits<5}
    onClick={()=>setGame(refuel)}>Reabastecer +5 (5 moedas)</button>
  </div>
  <div className="trade-travel" role="group" aria-label="Escolher próximo destino">
   {cityNames.map((name,i)=>{
    const cost=routeFuel(game.city,i as City);
    return <button type="button" key={name} data-trade-city={i}
     disabled={game.phase!=="playing"||cost===null||cost>game.fuel}
     onClick={()=>setGame(g=>moveTrader(g,i as City))}>{name}{cost!==null&&i!==game.city?` · ${cost} combustível`:i===game.city?" · aqui":""}</button>;
   })}
  </div>
  {game.phase!=="playing"&&<p className="trade-result" role="status">{game.phase==="won"?`Rota comercial concluída! Lucro de ${netProfit(game)} moedas e ${game.score} pontos.`:`Fim da expedição: limite de ${game.maxTurns} turnos atingido.`}</p>}
  <ol className="trade-log" aria-label="Registro das transações">
   {[...game.log].reverse().slice(0,6).map((entry,i)=><li key={entry.turns}>{entry.description} · caixa {entry.credits} · turno {entry.turns}</li>)}
  </ol>
  <div className="trade-actions"><button type="button" onClick={()=>setGame(restartTrade)}>Reiniciar</button>
   <button type="button" onClick={()=>setGame(nextTrade)}>Nova expedição</button></div>
  <p className="trade-note">As estradas Porto–Serra, Serra–Vale e Vale–Porto custam 2; qualquer uma até a Capital custa 3. Planeje com Tab/Enter ou toque. Jogo solo offline, sem dinheiro real ou bot.</p>
 </section>;
}
