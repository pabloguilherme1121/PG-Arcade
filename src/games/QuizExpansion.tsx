import { useCallback, useEffect, useRef, useState } from "react";
import {
  colorNames,
  colorValues,
  evaluate24,
  question,
  selectedWord,
} from "../lib/quizExpansion";
import { newGames, type NewGameId } from "../lib/newCatalog";
import { useAutoPause } from "./useAutoPause";
import "./newGames.css";
export default function QuizExpansion({
  gameId,
  record,
  onRecord,
}: {
  gameId: NewGameId;
  record: number;
  onRecord: (n: number) => void;
}) {
  const [difficulty, setDifficulty] = useState(1),
    [seed, setSeed] = useState(1),
    [round, setRound] = useState(0),
    [score, setScore] = useState(0),
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
    q = question(gameId, difficulty, seed, round),
    meta = newGames.find((g) => g.id === gameId)!;
  const special = ["hangman", "wordsearch"].includes(gameId),
    done = special ? answered : round === 9 && answered;
  const pause = useCallback(() => setPaused(true), []);
  useAutoPause(pause);
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
    setInput("");
    setMessage("Escolha sua resposta.");
    setAnswered(false);
    setPaused(false);
    setGuessed([]);
    setFound([]);
    setStart(-1);
    setMarks([]);
    setHidden(false);
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
        : correct
          ? 100 * (difficulty + 1)
          : 0;
    setScore((s) => s + (Number.isFinite(points) ? points : 0));
    setAnswered(true);
    setMessage(
      correct
        ? "Resposta certa!"
        : gameId === "estimate"
          ? `Eram ${q.answer} pontos. Precisão: ${Math.max(0, points)} pontos.`
          : `A resposta era ${q.answer}. Tente a próxima.`,
    );
  }
  function letter(ch: string) {
    if (paused || answered || guessed.includes(ch)) return;
    const next = [...guessed, ch],
      misses = next.filter((x) => !q.answer.includes(x)).length;
    setGuessed(next);
    if ([...q.answer].every((x) => next.includes(x))) {
      setScore((7 - misses) * 100 * (difficulty + 1));
      setAnswered(true);
      setMessage("Palavra descoberta!");
    } else if (misses >= 6) {
      setAnswered(true);
      setMessage(`Tentativas encerradas. A palavra era ${q.answer}.`);
    } else
      setMessage(
        q.answer.includes(ch)
          ? "Essa letra está na palavra."
          : `Letra ausente. Restam ${6 - misses} erros.`,
      );
  }
  function selectCell(i: number) {
    if (paused || answered) return;
    if (start < 0) {
      setStart(i);
      return;
    }
    const result = selectedWord(q.grid, start, i);
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
    setRound((r) => r + 1);
    setAnswered(false);
    setInput("");
    setHidden(false);
    setMessage("Escolha sua resposta.");
    lock.current = false;
  }
  return (
    <section className="new-game quiz-expansion" data-new-game={gameId}>
      <div className="new-options">
        <label>
          Dificuldade
          <select
            aria-label="Dificuldade"
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
        <span>
          Rodada{" "}
          <strong>
            {special ? 1 : round + 1}
            {special ? "" : " / 10"}
          </strong>
        </span>
      </div>
      <div role="status" className="new-status">
        {paused ? "Partida pausada" : message}
      </div>
      <div className="new-workspace">
        <div className="quiz-stage">
          {paused ? (
            <div className="new-pause">
              <p>Desafio pausado.</p>
              <button onClick={() => setPaused(false)}>Continuar</button>
            </div>
          ) : (
            <>
              <h2
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
                {q.prompt}
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
                    / 6
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
                <div
                  className="wordsearch-grid"
                  role="group"
                  aria-label="Grade de letras"
                >
                  {q.grid.map((x, i) => (
                    <button
                      key={i}
                      className={
                        marks.includes(i)
                          ? "found"
                          : start === i
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
                          onClick={() => answer(choice)}
                        >
                          {choice}
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
                <button className="primary" onClick={advance}>
                  Próxima rodada
                </button>
              )}
              {done && (
                <div className="quiz-result">
                  <h2>Sessão concluída</h2>
                  <p>{score} pontos</p>
                  <button
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
          <p className="clue-panel">{q.hint}</p>
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
