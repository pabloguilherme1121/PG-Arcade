import type { GameId } from "./lib/catalog";
import { gameHelp } from "./lib/gameHelp";

/** Help text and its long catalog descriptions are not part of the initial shell. */
export default function QuickHelpText({ id, leadOnly = false }: { id: GameId; leadOnly?: boolean }) {
  const help = gameHelp[id];
  if (leadOnly) return <span>{help.split(". ")[0]}</span>;
  return <>
    <p>{help}</p>
    <p>Atalhos globais: Alt + Shift + B leva ao tabuleiro; Alt + Shift + H abre a ajuda; Alt + Shift + R pede confirmação para reiniciar. Eles ficam inativos enquanto você edita um campo.</p>
    <p>Favoritos e recordes ficam neste navegador. Trocar de jogo inicia outra partida.</p>
  </>;
}
