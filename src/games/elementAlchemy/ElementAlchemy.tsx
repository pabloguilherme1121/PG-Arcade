import {useEffect,useState} from "react";
import {canCraft,craftElement,elementNames,newAlchemyGame,nextAlchemy,recipes,restartAlchemy,undoAlchemy,type Difficulty,type RecipeId} from "./rules";
import "./ElementAlchemy.css";
export default function ElementAlchemy({record,onRecord}:{record:number;onRecord:(points:number)=>void}){
 const [game,setGame]=useState(()=>newAlchemyGame());
 useEffect(()=>{if(game.phase==="won"&&game.score>record)onRecord(game.score);},[game.phase,game.score,record,onRecord]);
 const recipeIds=Object.keys(recipes).map(Number) as RecipeId[];
 return <section className="element-alchemy" data-element-alchemy aria-label="Alquimia de Elementos">
  <div className="alchemy-stats"><p>Combinações <strong>{game.moves}/{game.maxMoves}</strong></p>
   <p>Objetivo <strong>{elementNames[game.goal]}</strong></p>
   <p>Recorde <strong>{Math.max(record,game.score)}</strong></p></div>
  <p>Combine reagentes limitados para fabricar um produto final. Cada receita consome dois elementos, que desaparecem do estoque, e cria um produto novo. Faça as combinações na ordem correta; desperdiçar matérias-primas pode impedir a vitória. Use Desfazer para recuperar uma combinação.</p>
  <label className="alchemy-difficulty">Complexidade
   <select aria-label="Dificuldade de Alquimia de Elementos" value={game.difficulty}
    onChange={e=>setGame(newAlchemyGame(Number(e.target.value) as Difficulty,game.seed))}>
    <option value="0">Fácil — criar Elixir</option>
    <option value="1">Normal — criar Cristal</option>
    <option value="2">Difícil — criar Obra-prima</option>
   </select></label>
  <div className="alchemy-inventory" role="group" aria-label="Estoque de elementos">
   {elementNames.map((name,i)=><div key={name} className="alchemy-item" data-alchemy-stock={i} data-amount={game.inventory[i]}>
    <strong>{name}</strong><span>{game.inventory[i]} unidades</span>
   </div>)}
  </div>
  <h3>Receitas disponíveis</h3>
  <div className="alchemy-recipes" role="group" aria-label="Combinar reagentes">
   {recipeIds.map(id=><button type="button" key={id} data-alchemy-recipe={id}
     disabled={!canCraft(game,id)} onClick={()=>setGame(g=>craftElement(g,id))}>
    <strong>Produzir {elementNames[id]}</strong>
    <span>{elementNames[recipes[id][0]]} + {elementNames[recipes[id][1]]}</span>
   </button>)}
  </div>
  {game.phase==="won"&&<p className="alchemy-result" role="status">
   Receita concluída: {elementNames[game.goal]}. Você conquistou {game.score} pontos!
  </p>}
  {game.phase==="lost"&&<p className="alchemy-result" role="status">
   Acabaram as {game.maxMoves} combinações. Sua Obra ainda não está pronta. Desfaça e tente outra sequência.
  </p>}
  <ol className="alchemy-log" aria-label="Histórico de combinações">
   {[...game.log].reverse().map((entry,i)=><li key={game.log.length-i}>{entry}</li>)}
  </ol>
  <div className="alchemy-actions"><button type="button" disabled={!game.history.length} onClick={()=>setGame(undoAlchemy)}>Desfazer</button>
   <button type="button" onClick={()=>setGame(restartAlchemy)}>Reiniciar</button>
   <button type="button" onClick={()=>setGame(nextAlchemy)}>Nova bancada</button>
  </div>
  <p className="alchemy-note">Cada nível tem ao menos uma solução por receitas reais, verificada em testes. A bancada é local, funciona sem rede e pode ser controlada por toque, Tab ou Enter; não há bots ou compras.</p>
 </section>;
}
