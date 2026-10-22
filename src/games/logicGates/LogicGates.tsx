import {useEffect,useState} from "react";
import {cycleGate,getTruthTable,newLogicGame,nextLogic,operators,restartLogic,toggleOutput,undoLogic,type Difficulty} from "./rules";
import "./LogicGates.css";
const rows=[[false,false],[false,true],[true,false],[true,true]] as const;
const bit=(n:boolean)=>n?"1":"0";
export default function LogicGates({record,onRecord}:{record:number;onRecord:(n:number)=>void}){
 const [game,setGame]=useState(()=>newLogicGame());
 useEffect(()=>{if(game.phase==="won"&&game.score>record)onRecord(game.score);},[game.phase,game.score,record,onRecord]);
 const output=getTruthTable(game.gates,game.invert);
 const correct=output.filter((v,i)=>v===game.target[i]).length;
 return <section className="logic-gates" data-logic-gates aria-label="Portas Lógicas">
  <div className="logic-stats"><p>Linhas corretas <strong>{correct}/4</strong></p><p>Comandos <strong>{game.moves}</strong></p><p>Recorde <strong>{Math.max(record,game.score)}</strong></p></div>
  <p>Monte um circuito que reproduza a tabela-verdade desejada. Cada porta transforma sinais 0 e 1. Toque nos controles para alternar E, OU, XOU e NÃO-E; também pode inverter a saída final. Todas as quatro combinações de entrada devem coincidir para vencer.</p>
  <label className="logic-difficulty">Dificuldade
   <select aria-label="Dificuldade de Portas Lógicas" value={game.difficulty}
    onChange={e=>setGame(newLogicGame(Number(e.target.value) as Difficulty,game.seed))}>
    <option value="0">Fácil — uma porta</option>
    <option value="1">Normal — duas portas</option>
    <option value="2">Difícil — três portas</option>
   </select></label>
  <div className="logic-chain" role="group" aria-label="Configurar circuito">
   {game.gates.map((op,i)=><button type="button" key={i} data-logic-gate={i} disabled={game.phase==="won"}
    aria-label={`Alternar porta ${i+1}, atual ${operators[op]}`}
    onClick={()=>setGame(g=>cycleGate(g,i))}>
    <span>{i===0?"A e B":i%2===1?"Sinal anterior e A":"Sinal anterior e B"}</span>
    <strong>Porta {i+1}: {operators[op]}</strong>
   </button>)}
   <button type="button" className="logic-invert" data-logic-invert={game.invert}
    disabled={game.phase==="won"} aria-label={`Inverter saída: ${game.invert?"ligado":"desligado"}`}
    onClick={()=>setGame(toggleOutput)}>Inverter saída: <strong>{game.invert?"Sim":"Não"}</strong></button>
  </div>
  <div className="logic-table-wrap">
   <table className="logic-truth-table">
    <caption>Tabela-verdade: compare o sinal obtido com a meta</caption>
    <thead><tr><th scope="col">A</th><th scope="col">B</th><th scope="col">Meta</th><th scope="col">Saída</th><th scope="col">Teste</th></tr></thead>
    <tbody>{rows.map(([a,b],i)=><tr key={i} data-logic-row={i}>
     <td>{bit(a)}</td><td>{bit(b)}</td><td>{bit(game.target[i])}</td><td>{bit(output[i])}</td>
     <td>{output[i]===game.target[i]?"Correto":"Diferente"}</td>
    </tr>)}</tbody>
   </table>
  </div>
  {game.phase==="won"&&<p role="status" className="logic-victory">Circuito aprovado! As quatro saídas estão corretas. {game.score} pontos.</p>}
  <div className="logic-actions"><button type="button" onClick={()=>setGame(undoLogic)} disabled={!game.history.length}>Desfazer</button>
   <button type="button" onClick={()=>setGame(restartLogic)}>Reiniciar</button>
   <button type="button" onClick={()=>setGame(nextLogic)}>Novo circuito</button></div>
  <p className="logic-note">E precisa de dois sinais 1; OU aceita qualquer sinal 1; XOU aceita exatamente um sinal 1; NÃO-E inverte E. Use toque, Tab ou Enter. Sem bot, timer ou rede.</p>
 </section>;
}
