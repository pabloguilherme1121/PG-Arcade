import {useEffect,useState} from "react";
import {newContracts,startContracts,chooseContractColor,nextContracts, type PlayerCount,type ColorToken} from "./rules";
import "./ColorContracts.css";

const labels:Record<ColorToken,string>={rubro:"Rubro",ciano:"Ciano",jade:"Jade",ouro:"Ouro"};
const symbols:Record<ColorToken,string>={rubro:"◆",ciano:"●",jade:"✿",ouro:"★"};
export default function ColorContracts({record,onRecord}:{record:number;onRecord:(score:number)=>void}){
 const [game,setGame]=useState(()=>newContracts(2,29));
 useEffect(()=>{if(game.phase==="done"){const best=Math.max(...game.scores);if(best>record)onRecord(best);}},[game.phase,game.scores,record,onRecord]);
 const activePlayer=game.turn%game.players;
 const intro="Cada pessoa escolhe uma peça por turno de um mercado compartilhado. Faça pares, trincas e conjuntos de quatro cores; as cores contratadas dão bônus. Após quatro escolhas por participante, a maior pontuação vence.";
 return <section className="color-contracts" data-color-contracts aria-label="Contrato das Cores">
   <div className="contract-status">
     <p>Participantes <strong>{game.players}</strong></p>
     <p>Rodada <strong>{Math.floor(game.turn/game.players)+1>4?4:Math.floor(game.turn/game.players)+1}/4</strong></p>
     <p>Recorde <strong>{Math.max(record,...game.scores)}</strong></p>
   </div>
   <p className="contract-guide">{intro}</p>
   <div className="contract-goals" role="group" aria-label="Contratos públicos de cores">
     <strong>Contratos públicos: +4 por peça</strong>
     {game.contracts.map((color,i)=><span key={i} data-contract-color={color}>{symbols[color]} {labels[color]}</span>)}
   </div>
   {game.phase==="ready"&&<div className="contract-setup">
     <label>Jogadores <select aria-label="Jogadores de Contrato das Cores" value={game.players}
       onChange={e=>setGame(newContracts(Number(e.target.value) as PlayerCount,game.seed))}>
       {[2,3,4].map(n=><option value={n} key={n}>{n} participantes</option>)}
     </select></label>
     <button type="button" onClick={()=>setGame(startContracts)}>Começar rodada</button>
   </div>}
   {game.phase==="playing"&&<div className="contract-market">
     <strong>Vez da pessoa {activePlayer+1} — escolha uma peça</strong>
     <div role="group" aria-label="Mercado compartilhado" className="contract-options">
       {game.market.map((color,i)=><button key={i} type="button"
         data-contract-color={color}
         aria-label={`Selecionar ${labels[color]} da posição ${i+1}`}
         onClick={()=>setGame(g=>chooseContractColor(g,i))}>
         <span aria-hidden="true">{symbols[color]}</span>
         <strong>{labels[color]}</strong>
       </button>)}
     </div>
   </div>}
   <div className="contract-players">
     {game.collections.map((collection,i)=><div className="contract-player" key={i}
       aria-label={`Coleção da pessoa ${i+1}, ${game.scores[i]} pontos`}
       data-current-player={game.phase==="playing"&&i===activePlayer?"true":"false"}>
       <strong>Pessoa {i+1} — {game.scores[i]} pontos {game.winners.includes(i)?"(vencedor/a)":""}</strong>
       <div className="contract-collection" role="list" aria-label={`Peças da pessoa ${i+1}`}>
         {collection.map((color,k)=><span role="listitem" data-contract-color={color} key={k} aria-label={labels[color]}>{symbols[color]} <small>{labels[color]}</small></span>)}
         {collection.length===0&&<span role="listitem" className="contract-empty">Sem peças</span>}
       </div>
     </div>)}
   </div>
   {game.phase==="done"&&<div className="contract-finish" role="status">
     <strong>Contrato encerrado</strong>
     <p>{game.winners.map(i=>`Pessoa ${i+1}`).join(" e ")} {game.winners.length>1?"empataram":"venceu"} com {Math.max(...game.scores)} pontos!</p>
     <p>Par: +5, trinca: +15, quatro iguais: +20, quatro diferentes: +12, contrato: +4 por peça.</p>
   </div>}
   <button type="button" onClick={()=>setGame(nextContracts)}>Novo contrato</button>
   <p className="contract-note">Competição local no mesmo aparelho, sem servidor. Cada pessoa joga na sua vez. Os contratos são públicos, e o mercado repõe uma carta após cada escolha.</p>
 </section>;
}
