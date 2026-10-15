import { scopedRecordLabel } from "./lib/scopedRecords";
import { useState, useEffect, type RefObject } from "react";
import { ArrowRight, Heart, Trophy } from "lucide-react";
import { games, type GameId } from "./lib/catalog";
import { recordUnits } from "./lib/gameHelp";
import { mergeProgress, type Progress } from "./lib/progress";
import { readDailyActivity, restoreDailyActivity, summarizeDailyActivity } from "./lib/dailyProgress";
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
  const url=URL.createObjectURL(new Blob([JSON.stringify({...progress,dailyActivity:readDailyActivity()},null,2)],{type:"application/json"}));
  const link=document.createElement("a");link.href=url;link.download="pg-arcade-progresso.json";link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  setMessage("Cópia de progresso preparada. Guarde o arquivo para restaurar em outro navegador.");
 }
 const hasRecord = (id: GameId) => !!progress.records[id] || Object.keys(progress.recordsV2 || {}).some(key => key.startsWith(`${id}|`));
 const recordCount=games.filter(g=>hasRecord(g.id)).length;
 const today = summarizeDailyActivity(readDailyActivity());
 return (
          <section className="progress-section">
            <h1 ref={heading} tabIndex={-1}>
              Meu progresso
            </h1>
            <p className="muted">
              Suas visitas e recordes ficam neste navegador. Sem cadastro.
            </p>
            <p className="muted" aria-label="Atividade de hoje">Hoje: {today.visitsToday} {today.visitsToday === 1 ? "visita" : "visitas"} em {today.uniqueGamesToday} {today.uniqueGamesToday === 1 ? "jogo" : "jogos"}. Sequência atual: {today.currentStreak} {today.currentStreak === 1 ? "dia" : "dias"}. Apenas dias registrados neste navegador são considerados.</p>
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
                Salve uma cópia dos favoritos, recordes e atividade diária. Restaurar combina os
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
                      if (file.size > 512000) throw Error();
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
                      const hasDaily = "dailyActivity" in data;
                      const dailySaved = !hasDaily || restoreDailyActivity(data.dailyActivity);
                      setMessage(
                        dailySaved
                          ? "Progresso restaurado. Seus melhores recordes foram preservados."
                          : "Recordes restaurados. A atividade diária não pôde ser salva neste navegador.",
                      );
                    } catch {
                      setMessage(
                        "Não foi possível restaurar. Escolha uma cópia JSON do PG Arcade de até 500 KB.",
                      );
                    }
                  }}
                />
              </label>
            </div>
            {Object.keys(progress.recordsV2 || {}).length > 0 && <section aria-label="Recordes por modo e dificuldade">
              <h3>Por modo e dificuldade</h3>
              <div className="record-list">{Object.entries(progress.recordsV2 || {}).map(([key, value]) => {
                const game = games.find(g => g.id === key.split("|")[0]);
                return game && <a href={`#/jogar/${game.id}`} key={key}><span>{game.name}<small>{scopedRecordLabel(key)}</small></span><strong>{value} {recordUnits[game.id]}</strong></a>;
              })}</div>
            </section>}
            <h3>Marcas gerais</h3>
            <p className="muted">As marcas gerais abaixo incluem resultados antigos e podem misturar modos. Os recordes por modo não atribuem dificuldade aos dados antigos.</p>
            <div className="record-list">
              {games
                .filter((g) => !!recordUnits[g.id] && (recordView === "todos" || hasRecord(g.id)))
                .map((g) => (
                  <a href={`#/jogar/${g.id}`} key={g.id}>
                    <span>{g.name}</span>
                    <strong>
                      {progress.records[g.id]
                        ? `${progress.records[g.id]} ${recordUnits[g.id]}`
                        : "Sem marca geral"}
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
