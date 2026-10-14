import { useRef, useState, type KeyboardEvent } from "react";
import {
  newBlockPuzzle, canPlaceBlock, placeBlock,
  type BlockDifficulty, type BlockPuzzleState, type BlockShape,
} from "../lib/blockPuzzle";
import "./BlockPuzzle.css";

const levels = [
  { value: 0, label: "Fácil · peças menores" },
  { value: 1, label: "Normal · equilíbrio" },
  { value: 2, label: "Difícil · peças maiores" },
] as const;

export default function BlockPuzzle({ record, onRecord }: {
  record: number; onRecord: (score: number) => void;
}) {
  const [difficulty, setDifficulty] = useState<BlockDifficulty>(1);
  const [game, setGame] = useState<BlockPuzzleState>(() => newBlockPuzzle(1, Date.now()));
  const [selected, setSelected] = useState(0);
  const [previous, setPrevious] = useState<BlockPuzzleState | null>(null);
  const [message, setMessage] = useState("Selecione uma peça e uma casa inicial livre.");
  const boardRef = useRef<HTMLDivElement>(null);

  function restart(level: BlockDifficulty) {
    setDifficulty(level);
    setGame(newBlockPuzzle(level, Date.now()));
    setPrevious(null);
    setSelected(0);
    setMessage("Nova partida. Posicione as peças para formar linhas e colunas.");
  }
  function place(anchor: number) {
    if (game.status === "lost") return;
    const piece = game.pieces[selected];
    if (!piece || !canPlaceBlock(game.board, piece, anchor)) {
      setMessage("Essa peça não cabe nessa posição. Escolha outra casa.");
      return;
    }
    const next = placeBlock(game, selected, anchor);
    if (next === game) return;
    setPrevious(game);
    setGame(next);
    setSelected(Math.max(0, next.pieces.findIndex(Boolean)));
    setMessage(next.status === "lost"
      ? "Fim de jogo: nenhuma peça restante cabe no tabuleiro. Recomece para tentar outra estratégia."
      : next.combo > game.combo
        ? "Linha completa! Combinação e bônus registrados."
        : "Peça posicionada. Continue montando linhas e colunas.");
    if (next.score > record) onRecord(next.score);
  }
  function moveFocus(event: KeyboardEvent<HTMLDivElement>) {
    const index = Number((event.target as HTMLElement).dataset.cell);
    if (!Number.isInteger(index) || index < 0 || index > 63) return;
    const row = Math.floor(index / 8), col = index % 8;
    const offsets: Record<string, readonly [number, number]> = {
      ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1],
    };
    const direction = offsets[event.key];
    if (!direction) return;
    event.preventDefault();
    const r = Math.max(0, Math.min(7, row + direction[0]));
    const c = Math.max(0, Math.min(7, col + direction[1]));
    boardRef.current?.querySelector<HTMLButtonElement>(`[data-cell="${r * 8 + c}"]`)?.focus();
  }
  function pieceCells(shape: BlockShape | null) {
    if (!shape) return null;
    const occupied = new Set(shape.map(([r, c]) => `${r}-${c}`));
    return <span className="blocks-piece-grid" aria-hidden="true">
      {Array.from({ length: 16 }, (_, i) =>
        <span key={i} className={occupied.has(`${Math.floor(i / 4)}-${i % 4}`) ? "is-filled" : ""} />)}
    </span>;
  }
  return (
    <div className="blocks-layout" data-blocks-game>
      <div className="blocks-main">
        <div className="session-options">
          <label>Dificuldade dos blocos
            <select aria-label="Dificuldade dos blocos" value={difficulty}
              onChange={event => restart(Number(event.target.value) as BlockDifficulty)}>
              {levels.map(level => <option value={level.value} key={level.value}>{level.label}</option>)}
            </select>
          </label>
        </div>
        <div className="scores">
          <div>Pontos<strong data-blocks-score>{game.score}</strong></div>
          <div>Recorde<strong>{record}</strong></div>
          <div>Jogadas<strong>{game.moves}</strong></div>
        </div>
        <p className="blocks-intro">Complete uma linha ou coluna. Posicione todas as três peças para receber novas.</p>
        <div className="blocks-board" data-blocks-board role="group" aria-label="Tabuleiro de blocos 8 por 8"
          ref={boardRef} onKeyDown={moveFocus}>
          {game.board.map((occupied, index) =>
            <button type="button" key={index} data-cell={index}
              className={occupied ? "is-filled" : ""}
              aria-label={`Linha ${Math.floor(index / 8) + 1}, coluna ${index % 8 + 1}, ${occupied ? "ocupada" : "livre"}`}
              disabled={game.status === "lost"} onClick={() => place(index)} />)}
        </div>
        <div className="blocks-tray" role="group" aria-label="Escolha uma peça">
          {game.pieces.map((shape, i) =>
            <button type="button" key={i} aria-label={`Peça ${i + 1}${shape ? ` com ${shape.length} casas` : " já utilizada"}`}
              aria-pressed={shape !== null && selected === i}
              disabled={!shape || game.status === "lost"} onClick={() => setSelected(i)}>
              {pieceCells(shape)}
              <span>Peça {i + 1}</span>
            </button>)}
        </div>
        <p className="game-status" role="status" aria-live="polite">{message}</p>
        <div className="game-actions">
          <button type="button" disabled={!previous} onClick={() => {
            if (!previous) return;
            setGame(previous);
            setSelected(Math.max(0, previous.pieces.findIndex(Boolean)));
            setPrevious(null);
            setMessage("Última jogada desfeita. O recorde já conquistado permanece.");
          }}>Desfazer</button>
          <button type="button" className="primary" onClick={() => restart(difficulty)}>Nova partida</button>
        </div>
      </div>
      <aside className="instructions">
        <h2>Como jogar</h2>
        <p>Escolha uma peça, depois toque na casa onde fica seu canto superior esquerdo. Preencha linhas ou colunas para removê-las.</p>
        <p>Use Tab e Enter no teclado. As setas navegam entre as casas. No celular, toque na peça e no tabuleiro.</p>
        <p>Combos seguidos multiplicam o bônus de linhas. A partida acaba quando não houver espaço para nenhuma peça restante.</p>
        <p className="small">Tudo funciona no aparelho, sem conta, publicidade ou compras.</p>
      </aside>
    </div>
  );
}
