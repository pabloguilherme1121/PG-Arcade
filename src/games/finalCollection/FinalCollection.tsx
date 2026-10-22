import { useEffect, useState } from 'react';
import { finalGames, type FinalId } from '../../lib/finalCatalog';
import { act, initial, won, undo, score, lineTotals, nearbyCount, visible, solutions, trees, islandClues, rectangleClues, hitoriNumbers, trailNumbers, dominoNumbers, edges, weights, values } from './rules';
import { instructions } from './instructions';
import './FinalCollection.css';
export default function FinalCollection({gameId,record,onRecord}:{gameId:FinalId;record:number;onRecord:(n:number)=>void}) {
 const [state,setState]=useState(()=>initial(gameId)),[paint,setPaint]=useState(1);
 const win=won(gameId,state.cells),game=finalGames.find(g=>g.id===gameId)!;
 useEffect(()=>{if(win&&score(state)>record)onRecord(score(state))},[win,state,record,onRecord]);
 const play=(i:number)=>setState(s=>act(gameId,s,i,paint));
 const totals=lineTotals(solutions[gameId]!,gameId==='kakurasu');
 const marginal=['kakurasu','tendas','termometros','aquarios'].includes(gameId);
 const grid=!['baldes','mochila','panquecas','sapos','restos'].includes(gameId);
 const clue=(i:number):string=>{
  if(gameId==='hitori')return String(hitoriNumbers[i]);
  if(gameId==='tendas'&&trees.includes(i))return 'Árvore';
  if(gameId==='mosaico')return String(nearbyCount(solutions.mosaico!,i));
  if(gameId==='visibilidade'&&[0,3,6,9,12,15].includes(i))return String(visible(solutions.visibilidade!,i));
  if(gameId==='ilhas')return String(islandClues.find(q=>q.at===i)?.size||'');
  if(gameId==='retangulos')return String(rectangleClues.find(q=>q.at===i)?.size||'');
  if(gameId==='trilha-soma')return `${i===0?'INÍCIO ':i===15?'FIM ':''}${trailNumbers[i]}`;
  if(gameId==='dominosa')return `${dominoNumbers[i]} · ${edges.filter((e,j)=>state.cells[j]&&e.includes(i)).length}×`;
  if(gameId==='termometros'&&i>=12)return '●';
  return '';
 };
 return <section className="final-puzzle" data-final-game={gameId} aria-label={game.name}>
  <p className="final-instructions">{instructions[gameId]}</p>
  <div className="final-stats" role="status" aria-live="polite"><span>Jogadas: {state.moves}</span><span>Recorde: {Math.max(record,win?score(state):0)}</span>{win&&<strong>Vitória! {score(state)} pontos</strong>}</div>
  {marginal&&<div className="final-clues"><p>Linhas: {totals.rows.join(' · ')}</p>{gameId!=='termometros'&&<p>Colunas: {totals.cols.join(' · ')}</p>}{gameId==='kakurasu'&&<small>Pesos de posição: 1, 2, 3, 4</small>}</div>}
  {gameId==='trilha-soma'&&<p>Meta: {solutions[gameId]!.reduce((s,v,i)=>s+v*trailNumbers[i],0)} · Atual: {state.cells.reduce((s,v,i)=>s+v*trailNumbers[i],0)}</p>}
  {gameId==='retangulos'&&<div className="final-actions" role="group" aria-label="Escolher grupo">{[1,2,3,4].map(n=><button key={n} aria-pressed={paint===n} onClick={()=>setPaint(n)}>Grupo {'ABCD'[n-1]}</button>)}</div>}
  {grid&&<div className={`final-grid final-${gameId}`} role="group" aria-label="Tabuleiro, quatro linhas e quatro colunas">
   {Array.from({length:16},(_,i)=>gameId==='dominosa'?<div className="final-cell" key={i} aria-label={`Linha ${Math.floor(i/4)+1}, coluna ${i%4+1}: ${clue(i)}`}>{clue(i)}</div>:<button key={i} className={`final-cell ${state.cells[i]?'marked':''}`} data-cell={i} data-value={state.cells[i]} aria-pressed={!!state.cells[i]} aria-label={`Linha ${Math.floor(i/4)+1}, coluna ${i%4+1}${clue(i)?`, pista ${clue(i)}`:''}${gameId==='retangulos'&&state.cells[i]?`, grupo ${'ABCD'[state.cells[i]-1]}`:''}`} disabled={win||(gameId==='tendas'&&trees.includes(i))||(gameId==='visibilidade'&&[0,3,6,9,12,15].includes(i))} onClick={()=>play(i)}><span>{clue(i)}</span><b aria-hidden="true">{state.cells[i]?(gameId==='constelacao'?'★':gameId==='lanternas'?'☀':gameId==='retangulos'?'ABCD'[state.cells[i]-1]:'●'):''}</b></button>)}
  </div>}
  {gameId==='dominosa'&&<div className="final-dominos" role="group" aria-label="Peças de dominó">{edges.map(([a,b],i)=><button key={i} aria-pressed={!!state.cells[i]} disabled={win} onClick={()=>play(i)}>{Math.floor(a/4)+1},{a%4+1} ↔ {Math.floor(b/4)+1},{b%4+1} <strong>{dominoNumbers[a]}–{dominoNumbers[b]}</strong></button>)}</div>}
  {gameId==='baldes'&&<><div className="final-vessels">{state.cells.map((v,i)=><div key={i}><meter min={0} max={i?5:3} value={v} aria-label={`Água no balde de ${i?5:3} litros`}/><strong>{v} / {i?5:3} L</strong></div>)}</div><div className="final-actions">{['Encher 3 L','Encher 5 L','Esvaziar 3 L','Esvaziar 5 L','Transferir 3 → 5','Transferir 5 → 3'].map((label,i)=><button disabled={win} key={label} onClick={()=>play(i)}>{label}</button>)}</div></>}
  {gameId==='mochila'&&<><p>Peso: {state.cells.reduce((s,v,i)=>s+v*weights[i],0)} / 10 · Valor: {state.cells.reduce((s,v,i)=>s+v*values[i],0)} / 18</p><div className="final-actions">{weights.map((w,i)=><button aria-pressed={!!state.cells[i]} disabled={win} key={i} onClick={()=>play(i)}>Item {i+1}: peso {w}, valor {values[i]}</button>)}</div></>}
  {gameId==='panquecas'&&<><ol className="final-stack" aria-label="Pilha do topo à base">{state.cells.map(n=><li key={n} style={{width:`${n*18+20}%`}}>{n}</li>)}</ol><div className="final-actions">{[2,3,4].map(n=><button key={n} disabled={win} onClick={()=>play(n)}>Inverter {n} do topo</button>)}</div></>}
  {gameId==='sapos'&&<div className="final-actions final-frogs">{state.cells.map((n,i)=><button key={i} disabled={win||!n} aria-label={`Casa ${i+1}: ${n===1?'sapo para direita':n===-1?'sapo para esquerda':'vazia'}`} onClick={()=>play(i)}>{n===1?'→':n===-1?'←':'·'}</button>)}</div>}
  {gameId==='restos'&&<div className="final-actions">{state.cells.map((n,i)=><button key={i} disabled={win} onClick={()=>play(i)} aria-label={`Disco ${'ABC'[i]}: ${n}`}>{'ABC'[i]}: {n}</button>)}</div>}
  <div className="final-actions final-toolbar"><button disabled={!state.history.length} onClick={()=>setState(undo)}>Desfazer ação</button><button onClick={()=>setState(initial(gameId))}>Reiniciar</button></div>
 </section>;
}
