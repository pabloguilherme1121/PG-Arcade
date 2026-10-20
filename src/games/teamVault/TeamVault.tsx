import {useEffect,useState} from "react";
import {createVault,revealClue,hideClue,enterCode,submitCode,nextVault, type VaultPlayers} from "./rules";
import "./TeamVault.css";

export default function TeamVault({record,onRecord}:{record:number;onRecord:(score:number)=>void}) {
  const [game,setGame]=useState(()=>createVault(2,41));
  const [entry,setEntry]=useState("");
  const [warning,setWarning]=useState("");
  useEffect(()=>{if(game.phase==="won"&&game.score>record)onRecord(game.score);},[game.phase,game.score,record,onRecord]);
  useEffect(()=>{
    if(game.phase!=="clue")return;
    const close=()=>setGame(current=>current.phase==="clue"?hideClue(current):current);
    window.addEventListener("blur",close);
    const hide=()=>{if(document.visibilityState==="hidden")close();};
    document.addEventListener("visibilitychange",hide);
    return()=>{window.removeEventListener("blur",close);document.removeEventListener("visibilitychange",hide);};
  },[game.phase]);
  function checkGuess(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const candidate=entry.trim();
    if(!/^[1-9]{4}$/.test(candidate)||new Set(candidate).size!==4){
      setWarning("Digite quatro algarismos diferentes, de 1 a 9.");
      return;
    }
    setGame(current=>submitCode(enterCode(current,candidate)));
    setEntry("");
    setWarning("");
  }
  return <section className="team-vault" data-team-vault aria-label="Cofre em Equipe">
    <div className="vault-stats"><p>Equipe <strong>{game.players} pessoas</strong></p>
      <p>Tentativas <strong>{game.history.length}/4</strong></p>
      <p>Recorde <strong>{Math.max(record,game.score)}</strong></p></div>
    <p className="vault-instructions">Cada pessoa recebe parte do código secreto. Passe o mesmo aparelho de forma privada, memorize sua pista e explique-a aos colegas. Quando todos terminarem, montem juntos a senha de quatro algarismos, sem repetir números.</p>
    {game.phase==="handoff"&&<div className="vault-private">
      {game.player===0&&!game.viewed.some(Boolean)&&<label>Participantes
        <select aria-label="Participantes de Cofre em Equipe" value={game.players}
          onChange={event=>setGame(createVault(Number(event.target.value) as VaultPlayers,game.seed))}>
          {[2,3,4].map(n=><option key={n} value={n}>{n} pessoas</option>)}
        </select></label>}
      <strong>Vez da pessoa {game.player+1}</strong>
      <p>Passe o celular antes de abrir a pista. Os números permanecem ocultos até você confirmar.</p>
      <button type="button" onClick={()=>setGame(revealClue)} aria-label={`Ver pista da pessoa ${game.player+1}`}>Ver minha pista</button>
    </div>}
    {game.phase==="clue"&&<div className="vault-clue" role="region" aria-label={`Pista privada da pessoa ${game.player+1}`}>
      <strong>Pessoa {game.player+1} — sua pista</strong>
      {game.clues[game.player].positions.map(slot=><p key={slot}>Na posição <strong>{slot+1}</strong>, o algarismo é <strong>{game.secret[slot]}</strong>.</p>)}
      <p>Memorize seus números e suas posições. Não mostre esta tela aos outros.</p>
      <button onClick={()=>setGame(hideClue)}>Ocultar pista e passar</button>
    </div>}
    {game.phase==="guess"&&<div className="vault-unlock">
      <strong>Todas as pistas foram distribuídas.</strong>
      <p>Agora conversem e montem o código. Os acertos são informados após cada tentativa.</p>
      <form onSubmit={checkGuess}><label>Senha de quatro algarismos
        <input aria-label="Senha do cofre" inputMode="numeric" autoComplete="off" pattern="[1-9]{4}"
          maxLength={4} value={entry} onChange={event=>setEntry(event.target.value.replace(/[^1-9]/g,"").slice(0,4))} />
        </label><button type="submit">Testar código</button></form>
      {warning&&<p role="alert">{warning}</p>}
      <ol aria-label="Tentativas anteriores">{game.history.map((tryCode,i)=><li key={i}>
        <strong>{tryCode.guess}</strong> — {tryCode.exact} dígitos na posição certa; {tryCode.shared} dígitos em outra posição
      </li>)}</ol>
    </div>}
    {(game.phase==="won"||game.phase==="lost")&&<div className="vault-finish" role="status">
      <strong>{game.phase==="won"?"Cofre aberto — equipe vencedora!":"Cofre bloqueado após quatro tentativas."}</strong>
      <p>Senha desta rodada: {game.secret.join(" ")}. Pontos: {game.score}.</p>
    </div>}
    <div className="vault-actions">
      <button onClick={()=>{setGame(nextVault);setEntry("");setWarning("");}}>Novo cofre</button>
    </div>
    <p className="vault-disclaimer">Modo cooperativo local no mesmo aparelho, sem servidor e sem conta. As pistas não são transmitidas; cada jogador precisa olhar sua tela separadamente.</p>
  </section>;
}
