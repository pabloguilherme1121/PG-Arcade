import { useState } from "react";
import { words, evaluateWord } from "../lib/wordGame";
import { wordKeyboardFeedback } from "../lib/wordKeyboardFeedback";
import "./SecretWord.css";
const names = {
  correct: "posição certa",
  present: "outra posição",
  absent: "não está na palavra",
};
const pick = () => words[Math.floor(Math.random() * words.length)];
const keyboardRows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
export default function SecretWord({
  record,
  onRecord,
}: {
  record: number;
  onRecord: (n: number) => void;
}) {
  const [answer, setAnswer] = useState(pick),
    [guesses, setGuesses] = useState<string[]>([]),
    [entry, setEntry] = useState(""),
    [message, setMessage] = useState(""),
    [limit, setLimit] = useState(6);
  const won = guesses.includes(answer),
    done = won || guesses.length >= limit;
  const remaining = Math.max(0, limit - guesses.length);
  const keyboard = wordKeyboardFeedback(guesses, answer);
  function submitGuess() {
    if (done) return;
    const guess = entry.trim().toUpperCase();
    if (!/^[A-Z]{5}$/.test(guess)) {
      setMessage("Digite cinco letras de A a Z, sem acentos.");
      return;
    }
    if (guesses.includes(guess)) {
      setMessage("Você já tentou essa palavra. Experimente outra.");
      return;
    }
    const next = [...guesses, guess];
    if (guess === answer) onRecord((limit - next.length + 1) * 100);
    setGuesses(next);
    setEntry("");
    setMessage("");
  }
  function reset(nextLimit = limit) {
    setLimit(nextLimit);
    setAnswer(pick());
    setGuesses([]);
    setEntry("");
    setMessage("");
  }
  return (
    <div className="game-layout word-game">
      <div className="board-column">
        <div className="scores">
          <div>
            Tentativas
            <strong>
              {guesses.length}/{limit}
            </strong>
          </div>
          <div>
            Recorde<strong>{record || "—"}</strong>
          </div>
        </div>
        <div className="word-game-hud" aria-label="Progresso da palavra">
          <span>Tentativas restantes</span><strong data-word-remaining>{remaining}</strong>
          <span className="word-game-hint">{done ? "Rodada encerrada" : `Palavra de 5 letras · ${limit} chances`}</span>
        </div>
        <div className="word-game-progress" role="progressbar" aria-label="Tentativas usadas"
          aria-valuemin={0} aria-valuemax={limit} aria-valuenow={guesses.length}
          aria-valuetext={`${guesses.length} de ${limit} tentativas usadas`}>
          <span style={{width:`${guesses.length / limit * 100}%`}} />
        </div>
        <div className="word-board" role="group" aria-label="Tentativas de palavra">
          <ol>
            {guesses.map((guess, row) => (
              <li key={row} data-word-row aria-label={`Tentativa ${row + 1}: ${guess}`}>
                {evaluateWord(guess, answer).map((state, i) => (
                  <span
                    key={i}
                    className={`letter-${state}`}
                    role="img"
                    aria-label={`${guess[i]}: ${names[state]}`}
                  >
                    {guess[i]}
                    <small aria-hidden="true">
                      {state === "correct"
                        ? "✓"
                        : state === "present"
                          ? "↔"
                          : "−"}
                    </small>
                  </span>
                ))}
              </li>
            ))}
            {!done && (
              <li className="word-draft" data-word-row aria-label={`Tentativa ${guesses.length + 1}: edição`}>
                {Array.from({length:5},(_,i)=><span key={i} aria-hidden="true" className={entry[i] ? "word-draft-filled" : ""}>{entry[i] || "·"}</span>)}
              </li>
            )}
            {Array.from({length:Math.max(0,remaining-(done ? 0 : 1))},(_,row)=>(
              <li key={`empty-${row}`} className="word-placeholder" data-word-row aria-hidden="true">
                {Array.from({length:5},(_,i)=><span key={i}>·</span>)}
              </li>
            ))}
          </ol>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); submitGuess(); }}
        >
          <label htmlFor="secret-word">Sua palavra</label>
          <input
            id="secret-word"
            className="word-input"
            value={entry}
            onChange={(e) => setEntry(e.target.value.toUpperCase())}
            maxLength={5}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            disabled={done}
            aria-describedby="word-feedback"
          />
          <button className="primary" disabled={done}>
            Testar palavra
          </button>
        </form>
        <div className="word-touch-keyboard" role="group" aria-label="Teclado de letras na tela">
          {keyboardRows.map((row)=>(
            <div className="word-keyboard-row" key={row}>
              {Array.from(row,(letter)=>(
                <button key={letter} type="button" data-word-key={letter} data-state={keyboard[letter]}
                  className="word-key" aria-label={`Letra ${letter}`} disabled={done}
                  onClick={()=>setEntry(value=>value.length>=5 ? value : value+letter)}>
                  {letter}
                </button>
              ))}
            </div>
          ))}
          <div className="word-keyboard-actions">
            <button type="button" disabled={done||!entry.length} aria-label="Apagar letra" onClick={()=>setEntry(value=>value.slice(0,-1))}>Apagar letra</button>
            <button type="button" disabled={done||entry.length!==5} onClick={submitGuess}>Enviar tentativa</button>
          </div>
        </div>
        <p id="word-feedback" className="game-status" role="status">
          {won
            ? `Acertou! A palavra é ${answer}.`
            : done
              ? `A palavra era ${answer}. Tente uma nova partida!`
              : message ||
                "Verde: posição certa. Amarelo: outra posição. Cinza: letra ausente."}
        </p>
        <button
          onClick={() => reset()}
        >
          Nova palavra
        </button>
      </div>
      <aside className="instructions">
        <h2>Leia as pistas</h2>
        <p>
          Descubra uma palavra de cinco letras. Você pode testar qualquer
          combinação de A a Z. As marcas também indicam o resultado sem depender
          da cor.
        </p>
        <label>
          Desafio
          <select
            aria-label="Desafio da palavra"
            value={limit}
            disabled={guesses.length > 0 && !done}
            onChange={(e) => reset(Number(e.target.value))}
          >
            <option value={6}>6 tentativas</option>
            <option value={4}>4 tentativas</option>
          </select>
        </label>
        <p>
          Toque no teclado virtual ou digite diretamente no campo. As letras são
          marcadas conforme as pistas já descobertas: certo na posição, presente
          em outra posição ou ausente. O teclado não revela letras não testadas.
        </p>
        <p>
          Cada tentativa restante, incluindo a vencedora, vale 100 pontos. Sem
          cronômetro: jogue no seu ritmo.
        </p>
      </aside>
    </div>
  );
}
