import {useEffect,useState} from "react";
import {assignPan,canWeigh,chooseSuspect,chooseWeight,newBalanceGame,nextBalance,restartBalance,submitSuspicion,weighCoins,type Difficulty,type WeightKind} from "./rules";
import "./BalanceRiddle.css";
const side=["Esquerda","Fora","Direita"] as const;
export default function BalanceRiddle({record,onRecord}:{record:number;onRecord:(score:number)=>void}){
 const [game,setGame]=useState(()=>newBalanceGame());
 useEffect(()=>{if(game.phase==="won"&&game.score>record)onRecord(game.score);},[game.phase,game.score,record,onRecord]);
 const left=game.placements.filter(p=>p===-1).length,right=game.placements.filter(p=>p===1).length;
 return <section className="balance-riddle" data-balance-riddle aria-label="Enigma das Balanças">
  <div className="balance-stats"><p>Pesagens <strong>{game.history.length}/{game.maxWeighings}</strong></p><p>Erros <strong>{game.wrongGuesses}/2</strong></p><p>Recorde <strong>{Math.max(record,game.score)}</strong></p></div>
  <p>Uma moeda tem peso diferente, mas pode ser mais pesada ou mais leve. Use uma balança de dois pratos para descobrir qual é, comparando grupos com a mesma quantidade de moedas. Você só pode pesar algumas vezes e tem duas chances para acusar a moeda correta.</p>
  <label className="balance-difficulty">Dificuldade
   <select aria-label="Dificuldade de Enigma das Balanças" value={game.difficulty} onChange={e=>setGame(newBalanceGame(Number(e.target.value) as Difficulty,game.seed))}>
    <option value="0">Fácil — 4 moedas, 3 pesagens</option><option value="1">Normal — 6 moedas, 4 pesagens</option><option value="2">Difícil — 8 moedas, 5 pesagens</option>
   </select>
  </label>
  <div className="balance-pans" role="status">Prato esquerdo: {left} moedas — Prato direito: {right} moedas. {left===right&&left>0?"Pratos equilibrados para pesar.":"Selecione grupos de mesma quantidade."}</div>
  <div className="balance-coins" role="group" aria-label="Posicionar moedas nos pratos">
   {game.placements.map((placement,i)=><button type="button" key={i} data-balance-coin={i} data-balance-pan={placement}
    disabled={game.phase!=="playing"} aria-label={`Moeda ${i+1}: ${placement===-1?"esquerda":placement===1?"direita":"fora da balança"}`}
    onClick={()=>setGame(g=>assignPan(g,i))}><strong>Moeda {i+1}</strong><span>{placement===-1?side[0]:placement===1?side[2]:side[1]}</span></button>)}
  </div>
  <button type="button" className="balance-weigh" onClick={()=>setGame(weighCoins)} disabled={!canWeigh(game)}>Pesar moedas</button>
  <ol className="balance-history" aria-label="Resultados das pesagens">
   {game.history.map((v,i)=><li key={i}>Pesagem {i+1}: moedas {v.left.map(n=>n+1).join(", ")} contra {v.right.map(n=>n+1).join(", ")} — {v.result==="left"?"esquerda mais pesada":v.result==="right"?"direita mais pesada":"equilíbrio"}</li>)}
  </ol>
  {game.history.length===0&&<p>Você ainda não realizou nenhuma pesagem.</p>}
  <div className="balance-guess">
   <label>Moeda suspeita<select aria-label="Escolher moeda suspeita" value={game.guessCoin===null?"":String(game.guessCoin)}
    disabled={game.phase!=="playing"} onChange={e=>setGame(g=>chooseSuspect(g,e.target.value===""?null:Number(e.target.value)))}>
    <option value="">Escolha uma moeda</option>
    {game.placements.map((_,i)=><option value={i} key={i}>Moeda {i+1}</option>)}
   </select></label>
   <label>Diferença de peso<select aria-label="Natureza da moeda falsa" value={game.guessKind} disabled={game.phase!=="playing"}
    onChange={e=>setGame(g=>chooseWeight(g,e.target.value as WeightKind))}>
    <option value="heavy">Mais pesada</option><option value="light">Mais leve</option>
   </select></label>
   <button type="button" disabled={game.phase!=="playing"||game.guessCoin===null} onClick={()=>setGame(submitSuspicion)}>Acusar moeda</button>
  </div>
  {game.phase!=="playing"&&<p role="status" className="balance-result">
    {game.phase==="won"?`Moeda falsa descoberta! ${game.score} pontos.`:"As duas tentativas de acusação acabaram."} Era a moeda {game.fake+1}, {game.fakeKind==="heavy"?"mais pesada":"mais leve"}.
  </p>}
  <div className="balance-actions"><button type="button" onClick={()=>setGame(restartBalance)}>Reiniciar</button>
   <button type="button" onClick={()=>setGame(nextBalance)}>Novas moedas</button></div>
  <p className="balance-note">Toque ou use Tab e Enter para alternar cada moeda entre fora, esquerda e direita. Peso e resultados são calculados, não sorteados após a pesagem. Sem bot, rede ou compras.</p>
 </section>;
}
