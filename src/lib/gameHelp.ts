import type { GameId } from "./catalog";
export const gameHelp: Record<GameId, string> = {
  sequencia:
    "Observe a sequência e repita com as teclas 1 a 4 no tabuleiro ou toque nos botões. Cada nível adiciona uma cor. Pausar e continuar repete o padrão sem penalidade.",
  palavra:
    "Descubra cinco letras com até seis tentativas. Verde ou ✓ marca posição certa; amarelo ou ↔ indica outra posição; cinza ou − significa letra ausente. Use palavras sem acentos.",
  rally:
    "Colete bandeiras usando setas, A/D ou os botões e evite carros. Cada bandeira vale 25 pontos. São 30 segundos e três vidas; espaço pausa.",
  coleta:
    "Troque de faixa com setas, A/D ou os botões. Colete moedas de dez pontos e evite carros. A rodada dura 30 segundos e espaço pausa.",
  orbital:
    "Mova sua nave com setas ou os botões e dispare com Enter ou Disparar. Cada invasor vale 20 pontos. São três vidas e 30 segundos; espaço pausa.",
  minas:
    "Abra as 54 casas seguras. Os números contam as dez minas nas casas vizinhas. Use Modo bandeira ou o botão direito para marcar suspeitas. Primeiro toque seguro.",
  reflexo:
    "Comece uma rodada, espere o painel ficar verde e toque ou use Enter. Antecipar custa a rodada. Complete cinco rodadas para salvar o recorde; pausa não penaliza.",
  corrida:
    "Desvie dos carros usando as setas esquerda e direita, A/D ou os botões abaixo da pista. Espaço pausa. Escolha Passeio para começar devagar.",
  estacionamento:
    "Leve o carro à vaga P com setas, WASD ou os controles. Os blocos são obstáculos. Escolha um dos três estacionamentos; menos movimentos rendem mais pontos.",
  tiro: "Toque nos alvos com mira ou use os números 1 a 9 na ordem do tabuleiro. Acertos seguidos dão bônus. A rodada dura 30 segundos e pode ser pausada.",
  luzes:
    "Toque em uma luz para alternar ela e as quatro vizinhas. O objetivo é apagar todas. Tab e Enter também funcionam; desfazer ajuda a experimentar.",
  estrelas:
    "Toque na estrela antes que ela mude de lugar ou use a tecla de 1 a 9 correspondente. Cada estrela vale um ponto. Você pode pausar a rodada de 20 segundos.",
  liga4:
    "Duas pessoas alternam as colunas. Toque no número da coluna ou use Tab e Enter. Quatro peças na horizontal, vertical ou diagonal vencem. Use desfazer para voltar uma jogada.",
  puzzle:
    "Organize as peças de 1 a 8 e deixe o espaço vazio no canto inferior direito. Toque em uma peça vizinha ao espaço ou use as setas com o tabuleiro em foco.",
  "2048":
    "Junte números iguais usando setas, os botões de direção ou deslizando no tabuleiro. Você pode desfazer a última jogada; o recorde fica salvo neste navegador.",
  snake:
    "Coma frutas e evite paredes e o próprio corpo. Use setas, gestos ou controles de direção. Espaço pausa. Escolha a velocidade antes de jogar.",
  memoria:
    "Vire duas cartas e encontre os pares. Use toque ou Tab e Enter. Você pode escolher o tempo para memorizar cartas diferentes; o recorde conta as tentativas.",
  xadrez:
    "Escolha uma peça e uma casa de destino. As casas válidas são indicadas. Use as setas para navegar no tabuleiro e Enter para selecionar. Configure bot ou partida local nas opções do jogo.",
  damas:
    "Escolha uma peça e uma das casas indicadas. Toque ou use as setas e Enter no tabuleiro. As capturas disponíveis orientam a jogada; escolha bot ou duas pessoas nas opções do jogo.",
  domino:
    "Escolha a peça e o lado de encaixe disponível. Números e cores ajudam a reconhecer os valores. Abra as opções para escolher bot ou duas pessoas; no modo local revele sua mão na sua vez.",
  velha:
    "Escolha uma casa vazia para formar três marcas em linha. Toque ou use Tab e Enter. Jogue contra o bot ou escolha Dupla para dividir o aparelho.",
  futebol:
    "Escolha pênalti ou falta, ajuste mira, força e curva e toque em Chutar. A mira aceita toque e teclado; observe a trajetória e tente melhorar sua série de cinco cobranças.",
};
export const recordUnits: Partial<Record<GameId, "pontos" | "jogadas">> = {
  sequencia: "pontos",
  palavra: "pontos",
  rally: "pontos",
  coleta: "pontos",
  orbital: "pontos",
  minas: "pontos",
  reflexo: "pontos",
  corrida: "pontos",
  estacionamento: "pontos",
  tiro: "pontos",
  luzes: "pontos",
  estrelas: "pontos",
  "2048": "pontos",
  snake: "pontos",
  memoria: "jogadas",
  puzzle: "jogadas",
};
