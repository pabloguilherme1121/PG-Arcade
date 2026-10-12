import { useState, useEffect, type RefObject } from "react";
import { ArrowRight, Heart, Trophy } from "lucide-react";
import { games } from "./lib/catalog";
import { recordUnits } from "./lib/gameHelp";
import { mergeProgress, type Progress } from "./lib/progress";
import { readDailyActivity, summarizeDailyActivity } from "./lib/dailyProgress";
import "./ProgressPage.css";

type Props = {
 progress: Progress;
 heading: RefObject<HTMLHeadingElement | null>;
 update: (fn: (p: Progress) => Progress) => void;
};
export default function ProgressPage({progress, heading, update}:Props) {
 const [message,setMessage]=useState("");
 const [recordView,setRecordView]=useState("todos");
 useEffect(()=>{ heading.current?.focus({preventScroll:true}); },[heading]);
 function exportProgress() {
  const url=URL.createObjectURL(new Blob([JSON.stringify(progress,null,2)],{type:"application/json"}));
  const link=document.createElement("a");link.href=url;link.download="pg-arcade-progresso.json";link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  setMessage("Cópia de progresso preparada. Guarde o arquivo para restaurar em outro navegador.");
 }
 const recordCount=games.filter(g=>progress.records[g.id]).length;
 const today = summarizeDailyActivity(readDailyActivity());
 return (
          <section className="progress-section">
            <h1 ref={heading} tabIndex={-1}>
              Meu progresso
            </h1>
            <p className="muted">
              Suas visitas e recordes ficam neste navegador. Sem cadastro.
            </p>
            <p className="muted" aria-label="Atividade de hoje">Hoje: {today.visitsToday} visitas em {today.uniqueGamesToday} jogos. Sequência atual: {today.currentStreak} dias. Apenas dias registrados neste navegador são considerados.</p>
            <div className="progress-journey"><span>Seu caminho pelo catálogo</span><progress value={Object.keys(progress.visits).length} max={games.length} aria-label="Jogos explorados no catálogo" /><span>{games.length - Object.keys(progress.visits).length} jogos para descobrir</span></div>
            <div className="progress-grid">
              <div>
                <Trophy />
                <h2>Jogos explorados</h2>
                <strong>
                  {Object.keys(progress.visits).length} de {games.length}
                </strong>
              </div>
              <div>
                <Heart />
                <h2>Favoritos</h2>
                <strong>{progress.favorites.length}</strong>
              </div>
            </div>
            <div className="progress-record-heading"><h2>Seus recordes</h2><div role="group" aria-label="Exibir recordes">
              <button aria-pressed={recordView === "todos"} onClick={()=>setRecordView("todos")}>Todos os jogos</button>
              <button aria-pressed={recordView === "com-recorde"} onClick={()=>setRecordView("com-recorde")}>Com recorde ({recordCount})</button>
            </div></div>
            <div className="progress-backup">
              <p className="feedback" role="status">
                {message}
              </p>
              <h3>Leve seu progresso com você</h3>
              <p>
                Salve uma cópia dos favoritos e recordes. Restaurar combina os
                dados e preserva os melhores resultados. Nenhum arquivo é
                enviado a servidores.
              </p>
              <button onClick={exportProgress}>
                Salvar cópia do progresso
              </button>
              <label>
                Restaurar cópia
                <input
                  type="file"
                  accept=".json,application/json"
                  aria-label="Restaurar cópia do progresso"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    try {
                      if (file.size > 100000) throw Error();
                      const data: unknown = JSON.parse(await file.text());
                      if (
                        !data ||
                        typeof data !== "object" ||
                        Array.isArray(data) ||
                        !("favorites" in data) ||
                        !("records" in data)
                      )
                        throw Error();
                      update((p) => mergeProgress(p, data));
                      setMessage(
                        "Progresso restaurado. Seus melhores recordes foram preservados.",
                      );
                    } catch {
                      setMessage(
                        "Não foi possível restaurar. Escolha uma cópia JSON do PG Arcade de até 100 KB.",
                      );
                    }
                  }}
                />
              </label>
            </div>
            <div className="record-list">
              {games
                .filter((g) => !!recordUnits[g.id] && (recordView === "todos" || progress.records[g.id]))
                .map((g) => (
                  <a href={`#/jogar/${g.id}`} key={g.id}>
                    <span>{g.name}</span>
                    <strong>
                      {progress.records[g.id]
                        ? `${progress.records[g.id]} ${recordUnits[g.id]}`
                        : "Ainda sem recorde"}
                    </strong>
                    <ArrowRight size={18} />
                  </a>
                ))}
            </div>
            {recordView === "com-recorde" && !recordCount && <div className="progress-empty"><p>Seu primeiro recorde começa com uma partida.</p><a href="#/">Explorar jogos <ArrowRight size={18} aria-hidden="true" /></a></div>}
            <h2>Jogos visitados</h2>
            <p className="muted">
              Cada abertura de um jogo conta como uma visita.
            </p>
            <div className="record-list">
              {games
                .filter((g) => progress.visits[g.id])
                .map((g) => (
                  <a href={`#/jogar/${g.id}`} key={g.id}>
                    <span>{g.name}</span>
                    <span>{progress.visits[g.id]} visitas</span>
                    <ArrowRight size={18} />
                  </a>
                ))}
              {!Object.keys(progress.visits).length && (
                <p>Escolha um jogo para começar.</p>
              )}
            </div>
          </section>
 );
}
