import {useEffect,useState} from "react";
import {alphabet} from "./symbols";
import {assignRune,checkRunes,decodeCipher,newRuneGame,nextRunes,restartRunes,revealRune,type RuneDifficulty} from "./rules";
import "./RuneCipher.css";
export default function RuneCipher({record,onRecord}:{record:number;onRecord:(score:number)=>void}) {
 const [game,setGame]=useState(()=>newRuneGame());
 useEffect(()=>{if(game.status==="won"&&game.score>record)onRecord(game.score);},[game.status,game.score,record,onRecord]);
 const decoded=decodeCipher(game.cipher,game.assignments);
 return <section className="rune-cipher" data-rune-cipher aria-label="Código de Runas">
  <div className="rune-stats">
   <p>Tentativas <strong>{game.attempts}</strong></p>
   <p>Dicas usadas <strong>{game.hintsUsed}/2</strong></p>
   <p>Recorde <strong>{Math.max(record,game.score)}</strong></p>
  </div>
  <p>Decifre a mensagem secreta. Cada runa equivale sempre à mesma letra e nenhuma runa compartilha uma letra com outra. Use a pista, associe runas a letras e verifique sua tradução. As associações corretas formam a senha para abrir o pergaminho.</p>
  <label className="rune-difficulty">Dificuldade
   <select aria-label="Dificuldade de Código de Runas" value={game.difficulty}
    onChange={e=>setGame(newRuneGame(Number(e.target.value) as RuneDifficulty,game.seed))}>
    <option value="0">Fácil — frase curta</option><option value="1">Normal — frase intermediária</option><option value="2">Difícil — frase longa</option>
   </select>
  </label>
  <div className="rune-message">
   <strong>Pista: {game.hint}</strong>
   <p className="rune-symbols" aria-label="Mensagem codificada">{game.cipher}</p>
   <p className="rune-decoded" aria-label="Sua tradução">{decoded}</p>
  </div>
  <div className="rune-mappings" role="group" aria-label="Tradução das runas">
   {game.symbols.map((symbol,i)=><label key={symbol} className="rune-mapping">
    <strong><span aria-hidden="true">{symbol}</span><span className="rune-index">Runa {i+1}</span></strong>
    <select aria-label={`Letra da runa ${i+1}`} value={game.assignments[symbol]||""} disabled={game.status==="won"||game.revealed.includes(symbol)}
     onChange={e=>setGame(g=>assignRune(g,symbol,e.target.value))}>
     <option value="">?</option>{[...alphabet].map(letter=><option key={letter} value={letter}>{letter}</option>)}
    </select>
    {game.revealed.includes(symbol)&&<small>Dica revelada</small>}
   </label>)}
  </div>
  {game.attempts>0&&<p role="status" className="rune-feedback">
   {game.status==="won"?`Código decifrado! ${game.score} pontos.`:`${game.matched} de ${game.symbols.length} associações corretas. Ajuste sua tabela e tente novamente.`}
  </p>}
  <div className="rune-actions">
   <button type="button" onClick={()=>setGame(checkRunes)} disabled={game.status==="won"}>Verificar tradução</button>
   <button type="button" onClick={()=>setGame(revealRune)} disabled={game.hintsUsed>=2||game.status==="won"}>Revelar uma letra</button>
   <button type="button" onClick={()=>setGame(restartRunes)}>Reiniciar</button>
   <button type="button" onClick={()=>setGame(nextRunes)}>Novo código</button>
  </div>
  <p className="rune-note">Jogo solo, offline, sem bot, cronômetro ou compras. Use os seletores com toque ou Tab e teclado; as runas têm numeração para leitura de tela.</p>
 </section>;
}
