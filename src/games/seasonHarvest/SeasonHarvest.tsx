import {useEffect,useState} from "react";
import {canHarvest,cropNames,cropYield,fertilityCost,forecast,harvestPlot,newHarvestGame,nextHarvest,resetHarvest,restSeason,selectCrop,selectPlot,undoHarvest,waterCost,type Crop,type Difficulty} from "./rules";
import "./SeasonHarvest.css";
export default function SeasonHarvest({record,onRecord}:{record:number;onRecord:(score:number)=>void}){
 const [game,setGame]=useState(()=>newHarvestGame());
 useEffect(()=>{if(game.phase==="won"&&game.score>record)onRecord(game.score);},[game.phase,game.score,record,onRecord]);
 const weather=forecast(game.seed,game.season);
 return <section data-season-harvest className="season-harvest" aria-label="Colheita das Estações">
  <div className="harvest-stats"><p>Produção <strong>{game.points}/{game.goal}</strong></p>
   <p>Água <strong>{game.water}/{game.maxWater}</strong></p>
   <p>Estação <strong>{game.season}/{game.maxSeasons}</strong></p>
   <p>Recorde <strong>{Math.max(record,game.score)}</strong></p>
  </div>
  <p>Faça a fazenda produzir o suficiente antes do fim das estações. Cereais geram mais pontos, mas gastam fertilidade e água; raízes consomem menos solo e leguminosas o recuperam. Você pode descansar uma estação para recuperar água e fertilidade. Cada plantio ocupa uma estação.</p>
  <label className="harvest-difficulty">Dificuldade
   <select aria-label="Dificuldade de Colheita das Estações" value={game.difficulty}
    onChange={e=>setGame(newHarvestGame(Number(e.target.value) as Difficulty,game.seed))}>
    <option value="0">Fácil — meta 24, 6 estações</option>
    <option value="1">Normal — meta 30, 7 estações</option>
    <option value="2">Difícil — meta 38, 8 estações</option>
   </select></label>
  <p className="harvest-weather" role="status">Previsão da estação {game.season+1}: <strong>{weather}</strong>.
   {weather==="seca"?" Cereais custam 3 de água.":weather==="chuvosa"?" Cereais rendem 10 pontos.":" Cereais rendem 9 pontos."}</p>
  <div className="harvest-plots" role="group" aria-label="Canteiros da fazenda">
   {game.soil.map((soil,i)=><button type="button" key={i} data-harvest-plot={i}
    aria-pressed={game.selectedPlot===i} data-soil={soil} disabled={game.phase!=="playing"}
    onClick={()=>setGame(g=>selectPlot(g,i))}>
    <strong>Canteiro {i+1}</strong><span>Fertilidade: {soil}/3</span>
   </button>)}
  </div>
  <div className="harvest-crops" role="group" aria-label="Escolher cultura">
   {cropNames.map((name,i)=>{
    const crop=i as Crop,needed=fertilityCost(crop);
    return <button type="button" key={name} data-harvest-crop={i} aria-pressed={game.selectedCrop===crop}
     disabled={game.phase!=="playing"} onClick={()=>setGame(g=>selectCrop(g,crop))}>
     <strong>{name}</strong><span>+{cropYield(crop,weather)} produção</span>
     <small>{crop===0?"+1 fertilidade":`-${needed} fertilidade`} · {waterCost(crop,weather)} água</small>
    </button>;
   })}
  </div>
  <p className="harvest-selection" aria-live="polite">Escolhido: canteiro {game.selectedPlot+1}, {cropNames[game.selectedCrop]}.
   {canHarvest(game)?" Recursos suficientes para o plantio.":" Recursos insuficientes: escolha outra cultura/canteiro ou descanse."}</p>
  {game.phase!=="playing"&&<p role="status" className="harvest-result">{game.phase==="won"?
   `Meta de colheita atingida! Produção ${game.points}, ${game.score} pontos.`:
   `Fim das estações. Produção ${game.points} de ${game.goal}. Faça outra tentativa.`}</p>}
  <div className="harvest-actions">
   <button type="button" disabled={!canHarvest(game)} onClick={()=>setGame(harvestPlot)}>Plantar e colher</button>
   <button type="button" disabled={game.phase!=="playing"} onClick={()=>setGame(restSeason)}>Descansar a terra</button>
   <button type="button" disabled={!game.history.length} onClick={()=>setGame(undoHarvest)}>Desfazer estação</button>
   <button type="button" onClick={()=>setGame(resetHarvest)}>Reiniciar</button>
   <button type="button" onClick={()=>setGame(nextHarvest)}>Nova fazenda</button>
  </div>
  <ol className="harvest-history" aria-label="Diário da fazenda">{[...game.log].reverse().slice(0,6).map((entry,i)=><li key={game.log.length-i}>{entry}</li>)}</ol>
  <p className="harvest-note">Solo máximo: 3. A fertilidade não pode ficar negativa; o plantio falha sem água suficiente. Culturas, clima e recorde locais são verdadeiros. Jogo solo e offline com controles de toque e teclado.</p>
 </section>;
}
