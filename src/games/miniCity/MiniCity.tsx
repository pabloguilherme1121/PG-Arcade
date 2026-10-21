import {useEffect,useState} from "react";
import {cityIsSolved,createCity,measureCity,nextCity,placeCityZone,resetCity,selectCityZone,undoCity,zoneCosts,zoneNames,type Difficulty,type Zone} from "./rules";
import "./MiniCity.css";

export default function MiniCity({record,onRecord}:{record:number;onRecord:(score:number)=>void}){
 const [game,setGame]=useState(()=>createCity());
 useEffect(()=>{if(game.phase==="won"&&game.score>record)onRecord(game.score);},[game.phase,game.score,record,onRecord]);
 const m=measureCity(game),go=game.goal;
 return <section data-mini-city className="mini-city" aria-label="Cidade em Miniatura">
  <div className="city-stats" role="status">
   <p>Investimento <strong>{m.cost}/{game.budget}</strong></p>
   <p>Moradias satisfeitas <strong>{m.happyHomes}/{m.homes}</strong></p>
   <p>Poluição residencial <strong>{m.pollutedHomes}</strong></p>
   <p>Recorde <strong>{Math.max(record,game.score)}</strong></p>
  </div>
  <p>Planeje uma pequena cidade com moradias, parques, comércios e indústrias. Todos os moradores precisam morar ao lado de um parque ou comércio, sem nenhuma indústria vizinha. Respeite o orçamento, a quantidade mínima de cada tipo e as áreas protegidas.</p>
  <label className="city-difficulty">Complexidade do bairro
   <select aria-label="Dificuldade de Cidade em Miniatura" value={game.difficulty}
    onChange={e=>setGame(createCity(Number(e.target.value) as Difficulty,game.seed))}>
    <option value="0">Fácil — 3×3</option>
    <option value="1">Normal — 4×4</option>
    <option value="2">Difícil — 5×5</option>
   </select>
  </label>
  <div className="city-goals" role="group" aria-label="Metas de zoneamento">
   <span>Moradias: {m.homes}/{go.homes}</span>
   <span>Parques: {m.parks}/{go.parks}</span>
   <span>Comércios: {m.shops}/{go.shops}</span>
   <span>Indústrias: {m.factories}/{go.factories}</span>
  </div>
  <div className="city-zone-picker" role="group" aria-label="Escolher zoneamento">
   {zoneNames.map((name,i)=><button type="button" key={name} data-city-zone-choice={i}
    aria-pressed={game.selected===i} disabled={game.phase==="won"}
    onClick={()=>setGame(g=>selectCityZone(g,i as Zone))}>
    <strong>{name}</strong><small>{i===0?"Apagar":`${zoneCosts[i]} moedas`}</small>
   </button>)}
  </div>
  <div className="city-board-viewport" role="region" aria-label="Grade de planejamento urbano" tabIndex={0}>
   <div className="city-board" role="group" aria-label={`Cidade de ${game.size} por ${game.size}`}
    style={{gridTemplateColumns:`repeat(${game.size},minmax(0,1fr))`}}>
    {game.cells.map((zone,i)=>{const protectedArea=game.blocked.includes(i);
     return <button type="button" key={i} data-city-cell={i} data-city-zone={zone}
      disabled={protectedArea||game.phase==="won"} aria-label={`Lote linha ${Math.floor(i/game.size)+1}, coluna ${i%game.size+1}: ${protectedArea?"área protegida":zoneNames[zone]}`}
      onClick={()=>setGame(g=>placeCityZone(g,i))}>
       <span aria-hidden="true">{protectedArea?"✕":["·","⌂","♣","▣","▴"][zone]}</span>
       <small>{protectedArea?"Protegida":zoneNames[zone]}</small>
     </button>;
    })}
   </div>
  </div>
  <p className="city-hint" role="status">{cityIsSolved(game)?"Metas de infraestrutura concluídas.":
   m.pollutedHomes>0?`${m.pollutedHomes} moradia(s) vizinha(s) à indústria; reposicione as zonas.`:
   m.homes>m.happyHomes?`${m.homes-m.happyHomes} moradia(s) precisam de parque ou comércio ao lado.`:
   "Organize zonas e vizinhanças dentro do orçamento. Toque novamente no mesmo tipo para limpar o lote."}</p>
  {game.phase==="won"&&<p className="city-victory" role="status">Cidade aprovada! {game.score} pontos. Todas as necessidades dos moradores foram atendidas.</p>}
  <div className="city-actions">
   <button type="button" disabled={!game.history.length} onClick={()=>setGame(undoCity)}>Desfazer lote</button>
   <button type="button" onClick={()=>setGame(resetCity)}>Reiniciar cidade</button>
   <button type="button" onClick={()=>setGame(nextCity)}>Novo terreno</button>
  </div>
  <p className="city-note">A vizinhança vale apenas nas direções horizontal e vertical. Casas protegidas não podem receber construções. Sem bots, compras ou rede: solo/offline, por toque ou teclado.</p>
 </section>;
}
