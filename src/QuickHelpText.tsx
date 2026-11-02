import { useState, type FormEvent } from "react";
import type { GameId } from "./lib/catalog";
import { gameHelp } from "./lib/gameHelp";
import { answerArcadeQuestion, type ArcadeBotTopic } from "./lib/pgBotAnswers";

const topics: readonly {topic: ArcadeBotTopic;label: string;question: string}[] = [
  {topic:"objetivo",label:"Objetivo",question:"Como vencer este jogo?"},
  {topic:"controles",label:"Controles",question:"Quais são os controles?"},
  {topic:"pausa",label:"Pausar e reiniciar",question:"Como pausar e reiniciar?"},
  {topic:"recordes",label:"Recordes",question:"Como salvar recordes?"},
  {topic:"offline",label:"Offline",question:"Funciona offline?"},
  {topic:"acessibilidade",label:"Teclado e acessibilidade",question:"Como usar o teclado?"},
];

function QuickHelpPanel({ id }: {id: GameId}) {
  const [question,setQuestion] = useState("");
  const [selected,setSelected] = useState<ArcadeBotTopic>("objetivo");
  const [answer,setAnswer] = useState(() => answerArcadeQuestion(id,"Como vencer este jogo?").answer);
  function respond(q: string) {
    const result = answerArcadeQuestion(id,q);
    setAnswer(result.answer);
    setSelected(result.topic);
  }
  function ask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    respond(question);
  }
  return <>
    <p>{gameHelp[id]}</p>
    <div className="pg-bot-arcade-topics" role="group" aria-label="Perguntas rápidas do PG Bot">
      {topics.map(({topic,label,question:q}) =>
        <button type="button" key={topic} aria-pressed={selected === topic} onClick={() => respond(q)}>{label}</button>)}
    </div>
    <form className="pg-bot-arcade-form" onSubmit={ask} autoComplete="off">
      <label htmlFor={"pg-bot-ask-"+id}>Pergunte ao PG Bot sobre {id}</label>
      <div className="pg-bot-arcade-input">
        <input id={"pg-bot-ask-"+id} type="search" maxLength={240} placeholder="Ex.: como vencer este jogo?"
          enterKeyHint="send" value={question} onChange={event => setQuestion(event.target.value)} />
        <button type="submit">Perguntar</button>
      </div>
    </form>
    <p className="pg-bot-arcade-disclosure">As respostas são orientações locais, não uma IA conectada. Nenhuma pergunta é enviada ou armazenada.</p>
    <p><a href={"https://pabloguilherme1121.github.io/PG-Bot/?projeto=arcade&jogo="+encodeURIComponent(id)} target="_blank" rel="noopener noreferrer">PG Bot completo deste jogo</a></p>
    <div className="pg-bot-arcade-response">
      <strong>Resposta do PG Bot</strong>
      <p role="status" aria-live="polite" data-pg-bot-answer>{answer}</p>
    </div>
    <p>Atalhos globais: Alt + Shift + B leva ao tabuleiro; Alt + Shift + H abre a ajuda; Alt + Shift + R pede confirmação para reiniciar. Eles ficam inativos enquanto você edita um campo.</p>
    <p>Favoritos e recordes ficam neste navegador. Trocar de jogo inicia outra partida.</p>
  </>;
}

/** Ajuda carregada somente ao entrar na arena; fora dela mantém o resumo leve. */
export default function QuickHelpText({ id, leadOnly = false }: { id: GameId; leadOnly?: boolean }) {
  if (leadOnly) return <span>{gameHelp[id].split(". ")[0]}</span>;
  return <QuickHelpPanel key={id} id={id}/>;
}
