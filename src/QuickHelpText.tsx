export default function QuickHelpText({help}:{help:string}) {
 return <><p>{help}</p><p>Atalhos globais: Alt + Shift + B leva ao tabuleiro; Alt + Shift + H abre a ajuda; Alt + Shift + R pede confirmação para reiniciar. Eles ficam inativos enquanto você edita um campo.</p><p>Favoritos e recordes ficam neste navegador. Trocar de jogo inicia outra partida.</p></>;
}
