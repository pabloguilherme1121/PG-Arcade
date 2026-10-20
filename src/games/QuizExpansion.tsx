import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useScopedRecord } from './RecordScope';
import {
  colorNames,
  colorValues,
  evaluate24,
  question,
  selectedWord,
  wordDifficultyDescriptions,
  hangmanMistakeLimits,
} from "../lib/quizExpansion";
import { newGamesWithHelp as newGames } from "../lib/newCatalogFull";
import type { NewGameId } from "../lib/newCatalog";
import { quizAward } from "../lib/quizScoring";
import { useAutoPause } from "./useAutoPause";
import "./newGames.css";
import { useBoardGesture } from './useBoardGesture';
import { wordSearchDescriptions } from '../lib/wordsearch';
export default function QuizExpansion({
  gameId,
  record: legacyRecord,
  onRecord: saveLegacy,
}: {
  gameId: NewGameId;
  record: number;
  onRecord: (n: number) => void;
}) {
  const [difficulty, setDifficulty] = useState(1),
    [seed, setSeed] = useState(1),
    [round, setRound] = useState(0),
    [score, setScore] = useState(0),
    [streak, setStreak] = useState(0),
    [input, setInput] = useState(""),
    [message, setMessage] = useState("Escolha sua resposta."),
    [answered, setAnswered] = useState(false),
    [paused, setPaused] = useState(false),
    [guessed, setGuessed] = useState<string[]>([]),
    [found, setFound] = useState<string[]>([]),
    [start, setStart] = useState(-1),
    [marks, setMarks] = useState<number[]>([]),
    [hidden, setHidden] = useState(false);
  const awarded = useRef(false),
    lock = useRef(false),
    q = useMemo(() => question(gameId, difficulty, seed, round), [gameId, difficulty, seed, round]),
    meta = newGames.find((g) => g.id === gameId)!;
  const [record, onRecord] = useScopedRecord(String(difficulty), legacyRecord, saveLegacy);
  const mistakeLimit = hangmanMistakeLimits[difficulty];
  const [dragPath,setDragPath]=useState<number[]>([]);
  const [picked,setPicked]=useState(''), [exactAnswers,setExactAnswers]=useState(0), [lastPoints,setLastPoints]=useState(0);
  const nextAction=useRef<HTMLButtonElement>(null), prompt=useRef<HTMLHeadingElement>(null);
  const special = ["hangman", "wordsearch"].includes(gameId),
    done = special ? answered : round === 9 && answered;
  const pause = useCallback(() => setPaused(true), []);
  useAutoPause(pause);
  useEffect(()=>{if(answered && !special) nextAction.current?.focus({preventScroll:true});},[answered,special]);
  useEffect(()=>{if(round>0) prompt.current?.focus({preventScroll:true});},[round]);
  useEffect(() => {
    if (done && !awarded.current) {
      awarded.current = true;
      onRecord(score);
    }
  }, [done, score, onRecord]);
  function reset(d = difficulty, next = seed) {
    setDifficulty(d);
    setSeed(next);
    setRound(0);
    setScore(0);
    setStreak(0);
    setInput("");
    setMessage("Escolha sua resposta.");
    setAnswered(false);
    setPaused(false);
    setGuessed([]);
    setFound([]);
    setStart(-1);
    setMarks([]);
    setDragPath([]);
    setHidden(false);
    setPicked('');setExactAnswers(0);setLastPoints(0);
    awarded.current = false;
    lock.current = false;
  }
  function answer(value: string) {
    if (paused || answered || lock.current) return;
    if (gameId === "estimate" && !hidden) {
      setMessage("Observe os pontos e oculte a imagem antes de responder.");
      return;
    }
    if (gameId === "estimate" && !/^\d{1,3}$/.test(value.trim())) {
      setMessage("Digite uma quantidade inteira de pontos.");
      return;
    }
    lock.current = true;
    const normalized = value
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase(),
      correct =
        gameId === "twentyfour"
          ? evaluate24(value, q.numbers)
          : normalized === q.answer.toUpperCase();
    const points =
      gameId === "estimate"
        ? Math.max(0, 100 - Math.abs(Number(value) - Number(q.answer)) * 12)
        : quizAward(difficulty, streak, correct);
    setScore((s) => s + (Number.isFinite(points) ? points : 0));
    setPicked(value);setLastPoints(Number.isFinite(points)?points:0);
    if(correct) setExactAnswers(n=>n+1);
    setStreak((current) => (correct ? current + 1 : 0));
    setAnswered(true);
    setMessage(
      correct
        ? `Resposta certa! Sequência ${streak + 1}.`
        : gameId === "estimate"
          ? `Eram ${q.answer} pontos. Precisão: ${Math.max(0, points)} pontos.`
          : `A resposta era ${q.answer}. Sequência reiniciada.`,
    );
  }
  function letter(ch: string) {
    if (paused || answered || guessed.includes(ch)) return;
    const next = [...guessed, ch],
      misses = next.filter((x) => !q.answer.includes(x)).length;
    setGuessed(next);
    if ([...q.answer].every((x) => next.includes(x))) {
      setScore((mistakeLimit + 1 - misses) * 100 * (difficulty + 1));
      setAnswered(true);
      setMessage("Palavra descoberta!");
    } else if (misses >= mistakeLimit) {
      setAnswered(true);
      setMessage(`Tentativas encerradas. A palavra era ${q.answer}.`);
    } else
      setMessage(
        q.answer.includes(ch)
          ? "Essa letra está na palavra."
          : `Letra ausente. Restam ${mistakeLimit - misses} erros.`,
      );
  }
  function selectCell(i: number) {
    if (paused || answered) return;
    if (start < 0) {
      setStart(i);
      return;
    }
    selectSegment(start,i);
  }
  function selectSegment(from:number,to:number) {
    if(paused || answered || from<0 || to<0) return;
    const result = selectedWord(q.grid, from, to);
    setStart(-1);
    const word = q.words.includes(result.word)
      ? result.word
      : [...result.word].reverse().join("");
    if (q.words.includes(word) && !found.includes(word)) {
      const next = [...found, word];
      setFound(next);
      setMarks((m) => [...m, ...result.path]);
      setScore((s) => s + 250 * (difficulty + 1));
      setMessage(`${word} encontrada!`);
      if (next.length === q.words.length) {
        setAnswered(true);
        setMessage("Todas as palavras encontradas!");
      }
    } else setMessage("Esse segmento não contém uma palavra da lista.");
  }
  function advance() {
    setPicked('');setLastPoints(0);
    setRound((r) => r + 1);
    setAnswered(false);
    setInput("");
    setHidden(false);
    setMessage("Escolha sua resposta.");
    lock.current = false;
  }
  const swipe=useBoardGesture((from,to)=>selectSegment(from,to),!paused && !answered,(from,to)=>setDragPath(from<0?[]:selectedWord(q.grid,from,to).path),selectCell);
  return (
    <section className="new-game quiz-expansion" data-new-game={gameId}>
      <div className="new-options">
        <label>
          Dificuldade
          <select
            aria-label="Dificuldade"
            aria-describedby={['wordsearch', 'hangman', 'anagram'].includes(gameId) ? 'quiz-difficulty-description' : undefined}
            value={difficulty}
            onChange={(e) => reset(Number(e.target.value))}
          >
            <option value={0}>Iniciante</option>
            <option value={1}>Normal</option>
            <option value={2}>Avançado</option>
          </select>
        </label>
        <button onClick={() => reset(difficulty, seed + 1)}>
          Novo desafio
        </button>
      </div>
      <div className="new-hud">
        <span>
          Pontos <strong>{score}</strong>
        </span>
        <span>
          Recorde <strong>{record}</strong>
        </span>
        {!special && (
          <span>
            Sequência <strong>{streak}</strong>
          </span>
        )}
        <span>
          Rodada{" "}
          <strong>
            {special ? 1 : round + 1}
            {special ? "" : " / 10"}
          </strong>
        </span>
      </div>
      {!special && <div className="quiz-progress" role="progressbar" aria-label="Rodadas respondidas" aria-valuemin={0} aria-valuemax={10} aria-valuenow={round+Number(answered)}>
        <span>{round+Number(answered)} de 10 respondidas</span><span>{exactAnswers} {exactAnswers===1?'resposta exata':'respostas exatas'}</span>
        <div aria-hidden="true">{Array.from({length:10},(_,i)=><i key={i} data-complete={i<round+Number(answered)} data-current={i===round && !answered}/>)}</div>
      </div>}
      <div role="status" className="new-status">
        {paused ? "Partida pausada" : message}
      </div>
      <div className="new-workspace">
        <div className="quiz-stage">
          {['hangman', 'anagram'].includes(gameId) && <p id="quiz-difficulty-description">{wordDifficultyDescriptions[difficulty]}{gameId === 'hangman' && ` Você pode errar ${mistakeLimit} vezes.`}</p>}
          {paused ? (
            <div className="new-pause">
              <p>Desafio pausado.</p>
              <button onClick={() => setPaused(false)}>Continuar</button>
            </div>
          ) : (
            <>
              <h2
                ref={prompt} tabIndex={-1}
                className={`quiz-prompt ${gameId === "stroop" ? "stroop" : ""}`}
                style={
                  gameId === "stroop"
                    ? { color: colorValues[q.color] }
                    : undefined
                }
                aria-label={
                  gameId === "stroop"
                    ? `Palavra ${q.prompt}, tinta ${colorNames[q.color]}`
                    : undefined
                }
              >
                {gameId === 'wordsearch' ? 'Encontre as palavras' : q.prompt}
              </h2>
              {gameId === "hangman" ? (
                <>
                  <div className="hangman-word" aria-label="Palavra oculta">
                    {[...q.answer].map((x, i) => (
                      <span key={i}>
                        {guessed.includes(x) || answered ? x : "_"}
                      </span>
                    ))}
                  </div>
                  <p>
                    Erros: {guessed.filter((x) => !q.answer.includes(x)).length}{" "}
                    / {mistakeLimit}
                  </p>
                  <div className="letter-picker">
                    {[..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"].map((ch) => (
                      <button
                        key={ch}
                        onClick={() => letter(ch)}
                        disabled={answered || guessed.includes(ch)}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                </>
              ) : gameId === "wordsearch" ? (
                <>
                <p id="quiz-difficulty-description" className="wordsearch-rules">{wordSearchDescriptions[difficulty]} Arraste ou toque na primeira e na última letra.</p>
                <p>Encontradas: {found.length} / {q.words.length}</p>
                <ul className="wordsearch-list" aria-label="Palavras para encontrar">
                  {q.words.map(word => <li key={word} data-word={word} data-found={found.includes(word)}>
                    {word}{found.includes(word) && <span aria-label="encontrada"> ✓</span>}
                  </li>)}
                </ul>
                <div
                  className="wordsearch-grid"
                  {...swipe}
                  role="group"
                  aria-label="Grade de letras: arraste sobre uma palavra ou toque na primeira e na última letra."
                >
                  {q.grid.map((x, i) => (
                    <button
                      key={i}
                      data-drag-index={i}
                      className={
                        marks.includes(i)
                          ? "found"
                          : start === i || dragPath.includes(i)
                            ? "selected"
                            : ""
                      }
                      aria-label={`Linha ${Math.floor(i / 6) + 1}, coluna ${(i % 6) + 1}: ${x}`}
                      onClick={() => selectCell(i)}
                      disabled={answered}
                    >
                      {x}
                    </button>
                  ))}
                </div>
                </>
              ) : (
                <>
                  {gameId === "estimate" && !hidden && !answered && (
                    <>
                      <div
                        className="estimate-dots"
                        role="img"
                        aria-label="Grupo de pontos para estimar"
                      >
                        {q.numbers.map((x, i) => (
                          <span
                            key={i}
                            style={{
                              left: `${5 + (x % 8) * 11}%`,
                              top: `${5 + Math.floor(x / 8) * 11}%`,
                            }}
                          />
                        ))}
                      </div>
                      <button onClick={() => setHidden(true)}>
                        Ocultar pontos
                      </button>
                    </>
                  )}
                  {q.choices.length ? (
                    <div className="quiz-choices">
                      {q.choices.map((choice) => (
                        <button
                          key={choice}
                          disabled={answered}
                          data-answer-result={answered ? choice.toUpperCase()===q.answer.toUpperCase() ? 'correct' : choice===picked ? 'wrong' : 'neutral' : undefined}
                          onClick={() => answer(choice)}
                        >
                          {choice}
                          {answered && choice.toUpperCase()===q.answer.toUpperCase() && <span className="answer-marker" aria-hidden="true">✓</span>}
                          {answered && choice===picked && choice.toUpperCase()!==q.answer.toUpperCase() && <span className="answer-marker" aria-hidden="true">×</span>}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (input.trim()) answer(input);
                      }}
                    >
                      <label htmlFor="quiz-answer">
                        {gameId === "twentyfour"
                          ? "Expressão usando + - * / e parênteses"
                          : "Sua resposta"}
                      </label>
                      <input
                        id="quiz-answer"
                        value={input}
                        disabled={
                          answered || (gameId === "estimate" && !hidden)
                        }
                        maxLength={120}
                        autoComplete="off"
                        inputMode={
                          ["anagram", "twentyfour"].includes(gameId)
                            ? "text"
                            : "numeric"
                        }
                        onChange={(e) => setInput(e.target.value)}
                      />
                      <button
                        className="primary"
                        disabled={
                          answered ||
                          !input.trim() ||
                          (gameId === "estimate" && !hidden)
                        }
                      >
                        Confirmar resposta
                      </button>
                    </form>
                  )}
                </>
              )}
              {answered && !done && (
                <button ref={nextAction} className="primary" onClick={advance}>
                  Próxima rodada
                </button>
              )}
              {answered && !special && <p className="quiz-award">+{lastPoints} pontos nesta rodada · {exactAnswers} {exactAnswers===1?'resposta exata':'respostas exatas'}</p>}
              {done && (
                <div className="quiz-result">
                  <h2>{gameId === 'hangman' ? (score > 0 ? 'Palavra descoberta!' : 'Palavra não descoberta') : gameId === 'wordsearch' ? 'Grade concluída!' : 'Sessão concluída'}</h2>
                  <p>{score} pontos</p>
                  {!special && <p>{exactAnswers} de 10 respostas exatas · {exactAnswers*10}% de acertos</p>}
                  <button
                    ref={nextAction}
                    className="primary"
                    onClick={() => reset(difficulty, seed + 1)}
                  >
                    Jogar novamente
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        <aside className="new-instructions">
          <h2>Como jogar</h2>
          <p>{meta.help}</p>
          {gameId==='wordsearch' && <p>Arraste da primeira até a última letra para marcar uma palavra. Você também pode tocar nas duas pontas.</p>}
          {q.hint && <p className="clue-panel">{q.hint}</p>}
          <div className="new-actions">
            <button onClick={() => setPaused((p) => !p)}>
              {paused ? "Continuar" : "Pausar"}
            </button>
            <button onClick={() => reset()}>Reiniciar</button>
          </div>
          <p className="new-tip">
            Use Tab e Enter ou toque nas respostas. A pontuação é salva ao
            concluir a sessão.
          </p>
        </aside>
      </div>
    </section>
  );
}
