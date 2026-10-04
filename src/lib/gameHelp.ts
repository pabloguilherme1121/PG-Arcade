import type { GameId } from "./catalog";
import { expandedGames, type ExpandedId } from "./expandedCatalog";
const expandedHelp: Record<ExpandedId, string> = {
  sudoku:
    "Complete a grade sem repetir números nas linhas, colunas e blocos. Escolha dificuldade e modo; use os números e controles no tabuleiro.",
  nonograma:
    "As pistas indicam grupos de casas preenchidas em cada linha e coluna. Marque casas vazias, preencha as corretas e descubra o padrão.",
  labirinto:
    "Navegue pelos corredores usando setas ou os controles de direção. Encontre a saída; dificuldade altera o percurso e o modo orienta o desafio.",
  sokoban:
    "Empurre cada caixa até um destino. Você não pode puxá-las nem atravessar paredes. Desfaça quando necessário e planeje espaço para manobrar.",
  hanoi:
    "Transfira a torre para o pino de destino movendo um disco por vez. Um disco maior nunca pode ficar sobre um menor. Escolha origem e destino.",
  senha:
    "Escolha um código e confirme sua tentativa. As pistas indicam valores corretos e posições certas. Use a dedução para reduzir as possibilidades.",
  nim: "Retire peças de uma das pilhas por turno. Observe a regra de vitória do modo escolhido e planeje sua resposta ao adversário.",
  reversi:
    "Coloque peças para cercar linhas do adversário. Peças cercadas mudam de cor; vence quem domina mais casas quando não houver jogadas.",
  batalha:
    "Escolha coordenadas para procurar os navios escondidos. Acertos e água orientam os próximos disparos; afunde a frota para concluir.",
  pontes:
    "Ligue dois pontos vizinhos para desenhar uma borda. Complete a quarta borda de uma caixa para conquistá-la e ganhar outra jogada.",
  breakout:
    "Mova a raquete, mantenha a bola em jogo e destrua os blocos. Escolha dificuldade e modo; observe as vidas e avance pelas etapas.",
  pong: "Mova sua raquete para devolver a bola ao adversário. A física do contato muda a trajetória. Escolha modo e dificuldade antes de iniciar.",
  asteroides:
    "Gire sua nave, acelere e dispare nos asteroides. Controle a velocidade e evite colisões; a dificuldade ajusta o desafio do espaço.",
  invasores:
    "Mova sua nave e dispare nas formações. Evite tiros inimigos, proteja suas vidas e avance pelas ondas. Use teclado ou os controles.",
  runner:
    "Pule antes dos obstáculos e sobreviva ao percurso. O ritmo aumenta durante a partida. Escolha dificuldade e modo antes da largada.",
  voo: "Dê impulsos para controlar a altura e atravesse os espaços entre torres. Evite o chão, o teto e as barreiras usando teclado ou toque.",
  jetpack:
    "Use o propulsor para controlar a altura, desviar dos obstáculos e administrar combustível. Escolha o modo e mantenha o voo estável.",
  esquiva:
    "Mova-se pela arena com as direções e evite os perigos que se aproximam. Sobreviva e observe os limites do campo. Pausar preserva a partida.",
  pouso:
    "Controle o impulso e a velocidade para pousar suavemente na plataforma. Gerencie o combustível; aterrissar rápido demais causa colisão.",
  drift:
    "Dirija pelo circuito e alcance os checkpoints. Aceleração e direção alteram o movimento do carro; controle o ritmo para ficar na pista.",
  vinteum:
    "Peça cartas ou pare para chegar o mais perto possível de 21 sem ultrapassar. O adversário segue sua regra. Não há dinheiro nem apostas.",
  dados:
    "Role os dados, guarde os valores que deseja manter e forme combinações. Observe as rolagens restantes e escolha como pontuar a rodada.",
  boliche:
    "Ajuste o lançamento da bola e derrube os pinos. Direção e força influenciam a trajetória. Complete suas rodadas para registrar o resultado.",
  basquete:
    "Ajuste a força e o ângulo do arremesso para passar pela cesta. Observe a trajetória, corrija a próxima tentativa e complete a série.",
  golfe:
    "Escolha a direção e a força para levar a bola ao buraco. Evite obstáculos, leia o campo e conclua os percursos com menos tacadas.",
  arco: "Ajuste a mira e a força para atingir o alvo. Considere o vento e a distância do desafio. Complete a série e melhore sua precisão.",
  pesca:
    "Espere o momento certo para fisgar e controle a tensão da linha. Puxar demais pode perder o peixe; observe os indicadores da partida.",
  match3:
    "Troque duas peças vizinhas para formar linhas de três ou mais. Combinações desaparecem e novas peças caem, criando cascatas e pontos.",
};
export const gameHelp: Record<GameId, string> = {
  ...expandedHelp,
  sequencia:
    "Observe a sequência e repita com as teclas 1 a 4 no tabuleiro ou toque nos botões. Cada nível adiciona uma cor. Pausar e continuar repete o padrão sem penalidade.",
  palavra:
    "Descubra cinco letras com até seis tentativas. Verde ou ✓ marca posição certa; amarelo ou ↔ indica outra posição; cinza ou − significa letra ausente. Use palavras sem acentos.",
  rally:
    "Colete bandeiras usando setas, A/D ou os botões e evite carros. Cada bandeira vale 25 pontos. Escolha sprint de 30 segundos, expedição de 90 ou sobrevivência sem limite. Três dificuldades; espaço pausa.",
  coleta:
    "Troque de faixa com setas, A/D ou os botões. Colete moedas de dez pontos e evite carros. Escolha sprint, expedição de 90 segundos ou sobrevivência sem limite; dificuldade e ritmo mudam o trânsito. Espaço pausa.",
  orbital:
    "Mova sua nave com setas ou os botões e dispare com Enter ou Disparar. Cada invasor vale 20 pontos. São três vidas. Escolha sprint, expedição de 90 segundos ou sobrevivência sem limite e uma das três dificuldades. Espaço pausa.",
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
  ...Object.fromEntries(expandedGames.map((g) => [g.id, "pontos" as const])),
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
