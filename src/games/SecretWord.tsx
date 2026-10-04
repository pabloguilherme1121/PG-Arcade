import { useState } from "react";
import { words, evaluateWord } from "../lib/wordGame";
const names = {
  correct: "posição certa",
  present: "outra posição",
  absent: "não está na palavra",
};
const pick = () => words[Math.floor(Math.random() * words.length)];
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
  return (
    <div className="game-layout">
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
        <div className="word-board" aria-label="Tentativas de palavra">
          <ol>
            {guesses.map((guess, row) => (
              <li key={row} aria-label={`Tentativa ${row + 1}: ${guess}`}>
                {evaluateWord(guess, answer).map((state, i) => (
                  <span
                    key={i}
                    className={`letter-${state}`}
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
          </ol>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
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
          }}
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
        <p id="word-feedback" className="game-status" role="status">
          {won
            ? `Acertou! A palavra é ${answer}.`
            : done
              ? `A palavra era ${answer}. Tente uma nova partida!`
              : message ||
                "Verde: posição certa. Amarelo: outra posição. Cinza: letra ausente."}
        </p>
        <button
          onClick={() => {
            setAnswer(pick());
            setGuesses([]);
            setEntry("");
            setMessage("");
          }}
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
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setAnswer(pick());
              setGuesses([]);
              setEntry("");
              setMessage("");
            }}
          >
            <option value={6}>6 tentativas</option>
            <option value={4}>4 tentativas</option>
          </select>
        </label>
        <p>
          Cada tentativa restante, incluindo a vencedora, vale 100 pontos. Sem
          cronômetro: jogue no seu ritmo.
        </p>
      </aside>
    </div>
  );
}
