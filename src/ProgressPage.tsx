import { localDiagnostics, diagnosticsStatus, startDiagnostics, stopDiagnostics } from "./lib/localDiagnostics";
import { MAX_PROGRESS_BACKUP_BYTES, validateProgressBackup } from "./lib/progressBackup";
import { searchText } from "./lib/discovery";
import { scopedRecordLabel } from "./lib/scopedRecordLabels";
import { useState, useEffect, type RefObject } from "react";
import { ArrowRight, Heart, Trophy } from "lucide-react";
import { games, type GameId } from "./lib/catalog";
import { recordUnits } from "./lib/recordUnits";
import { mergeProgress, type Progress } from "./lib/progress";
import { readDailyActivity, restoreDailyActivity, summarizeDailyActivity } from "./lib/dailyProgress";
import "./ProgressPage.css";

type Props = {
 progress: Progress;
 heading: RefObject<HTMLHeadingElement | null>;
 update: (fn: (p: Progress) => Progress) => void;
};
export default function ProgressPage({progress, heading, update}:Props) {
 const [collecting,setCollecting]=useState(()=>diagnosticsStatus().collecting);
 const [recordQuery,setRecordQuery]=useState("");
 const [message,setMessage]=useState("");
 const [recordView,setRecordView]=useState("todos");
 useEffect(()=>{ heading.current?.focus({preventScroll:true}); },[heading]);
 function exportProgress() {
  const url=URL.createObjectURL(new Blob([JSON.stringify({...progress,dailyActivity:readDailyActivity()},null,2)],{type:"application/json"}));
  const link=document.createElement("a");link.href=url;link.download="pg-arcade-progresso.json";link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  setMessage("Cópia de progresso preparada. Guarde o arquivo para restaurar em outro navegador.");
 }
 function exportDiagnostics() {
  const url=URL.createObjectURL(new Blob([JSON.stringify(localDiagnostics(),null,2)],{type:"application/json"}));
  const link=document.createElement("a");link.href=url;link.download="pg-arcade-diagnostico.json";link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  setMessage("Diagnóstico local preparado, sem URL, favoritos ou recordes. Nenhum dado foi enviado.");
 }
 const hasRecord = (id: GameId) => !!progress.records[id] || Object.keys(progress.recordsV2 || {}).some(key => key.startsWith(`${id}|`));
 const recordCount=games.filter(g=>hasRecord(g.id)).length;
 const normalizedRecordQuery = searchText(recordQuery);
 const matchingRecordGames = games.filter(game => searchText(game.name).includes(normalizedRecordQuery));
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
              <p>Para investigar lentidão, inicie uma coleta, teste o catálogo e volte para salvar o diagnóstico. A coleta fica apenas neste aparelho.</p>
              <button aria-pressed={collecting} onClick={()=>{
                if(collecting){stopDiagnostics();setCollecting(false);setMessage("Coleta interrompida. Você pode salvar o diagnóstico local.");}
                else {const started=startDiagnostics();setCollecting(started);setMessage(started?"Coleta local iniciada. Teste o catálogo e volte para salvar o diagnóstico. Nenhum dado é enviado.":"Este navegador não oferece medição de tarefas longas. O diagnóstico básico continua disponível.");}
              }}>{collecting?"Parar coleta local":"Iniciar coleta local"}</button>
              <button onClick={exportDiagnostics}>Salvar diagnóstico local</button>
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
                      if (file.size > MAX_PROGRESS_BACKUP_BYTES) throw Error();
                      const data: unknown = JSON.parse(await file.text());
                      const validity = validateProgressBackup(data);
                      if (validity === "invalid") throw Error();
                      if (validity === "empty") { setMessage("Cópia válida, mas sem favoritos, visitas ou recordes para restaurar."); return; }
                      update((p) => mergeProgress(p, data));
                      const hasDaily = !!data && typeof data === "object" && "dailyActivity" in data;
                      const dailySaved = !hasDaily || restoreDailyActivity((data as Record<string, unknown>).dailyActivity);
                      setMessage(
                        dailySaved
                          ? "Progresso restaurado. Seus melhores recordes foram preservados."
                          : "Recordes restaurados. A atividade diária não pôde ser salva neste navegador.",
                      );
                    } catch {
                      setMessage(
                        "Não foi possível restaurar. Escolha uma cópia JSON do PG Arcade de até 2 MiB.",
                      );
                    }
                  }}
                />
              </label>
            </div>
            {Object.keys(progress.recordsV2 || {}).length > 0 && <section aria-label="Recordes por modo e dificuldade">
              <h3>Por modo e dificuldade</h3>
              <label>Buscar recordes<input type="search" aria-label="Buscar recordes por jogo" value={recordQuery} onChange={e => setRecordQuery(e.target.value)}/></label>
              {matchingRecordGames.map(game => {
                const entries = Object.entries(progress.recordsV2 || {}).filter(([key]) => key.startsWith(`${game.id}|`));
                return entries.length ? <details key={game.id}><summary>{game.name} · {entries.length} configurações</summary>
                  <div className="record-list">{entries.map(([key, value]) => <a href={`#/jogar/${game.id}`} key={key}><span>{game.name}<small>{scopedRecordLabel(key)}</small></span><strong>{value} {recordUnits[game.id]}</strong></a>)}</div>
                </details> : null;
              })}
              {recordQuery && !matchingRecordGames.some(game => Object.keys(progress.recordsV2 || {}).some(key => key.startsWith(`${game.id}|`))) && <p role="status">Nenhum recorde encontrado para este jogo.</p>}
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
