import { useState, type FormEvent } from "react";
import "./CatalogPGBot.css";
import { catalogBotAnswer } from "./lib/pgBotCatalog";

const quick=[
 {label:"Partida rápida",question:"Quero um jogo rápido"},
 {label:"Estratégia e lógica",question:"Quero jogos de estratégia"},
 {label:"Para duas pessoas",question:"Quero jogar em dupla"},
 {label:"Progresso e favoritos",question:"Como salvar favoritos?"},
 {label:"Modo offline",question:"Funciona offline?"},
];
export default function CatalogPGBot(){
 const [query,setQuery]=useState("");
 const [selected,setSelected]=useState("");
 const [result,setResult]=useState(()=>catalogBotAnswer(""));
 function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setResult(catalogBotAnswer(query));setSelected("");}
 function choose(question:string){setResult(catalogBotAnswer(question));setSelected(question);}
 return <details className="catalog-pg-bot" data-pg-bot="catalog-help">
  <summary><img src={import.meta.env.BASE_URL+"brand/pg-bot/mascot.webp"} alt="" loading="lazy" width="35" height="42" decoding="async"/>
   <span><strong>PG Bot · encontre seu próximo jogo</strong><small>Indicações por estilo, ajuda com progresso e offline</small></span></summary>
  <div className="catalog-pg-bot-body">
   <p>Descreva o que quer jogar ou selecione um assunto. As respostas são locais, sem IA conectada e sem enviar suas perguntas.</p>
   <div className="catalog-pg-bot-topics" role="group" aria-label="Assuntos do PG Bot no catálogo">
    {quick.map(t=><button type="button" key={t.question} aria-pressed={selected===t.question} onClick={()=>choose(t.question)}>{t.label}</button>)}
   </div>
   <form onSubmit={submit} autoComplete="off">
    <label htmlFor="catalog-pg-bot-query">Pergunte ao PG Bot</label>
    <div className="catalog-pg-bot-form-row">
     <input id="catalog-pg-bot-query" type="search" maxLength={240} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ex.: jogo curto para duas pessoas" enterKeyHint="send"/>
     <button type="submit">Perguntar</button>
    </div>
   </form>
   <div className="catalog-pg-bot-answer">
    <p role="status" aria-live="polite">{result.answer}</p>
    {result.suggestions.length>0&&<div className="catalog-pg-bot-links" aria-label="Jogos indicados">
     {result.suggestions.map(g=><a key={g.id} href={"#/jogar/"+g.id} data-bot-game={g.id}>{g.name}</a>)}
    </div>}
   </div>
  </div>
 </details>;
}
