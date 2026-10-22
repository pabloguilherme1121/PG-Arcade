import { finalHelp } from '../games/finalCollection/instructions';
import type { GameId } from "./catalog";
import { newGameHelp } from "./newCatalogHelp";
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
  ...finalHelp,
  meteoros: "Defensor de Meteoros é um jogo original de reflexos e planejamento de escudo por turnos. A arena possui sete colunas e seis linhas. Meteoros aparecem em trajetórias determinadas pelo radar e descem uma linha a cada avanço de tempo. Você pode mover o escudo apenas uma coluna, uma vez antes de cada avanço; um meteoro que chega à linha inferior na mesma coluna do escudo é refletido de volta ao espaço, subindo até sair da arena e contabilizar o resgate. Um impacto sem escudo danifica a base. O objetivo é refletir todos os 4, 5 ou 6 meteoros conforme a dificuldade, preservando ao menos uma vida (3, 2 ou 1 vidas iniciais). Há três dificuldades, trajetórias reproduzíveis, vitória e derrota, desfazer qualquer ação, reiniciar, novos padrões, pontuação e recorde. Funciona por turnos offline, com toque e teclado, sem bot e sem limite de tempo real.",
  trem: "Trem Sem Freio é um desafio original de tráfego ferroviário por turnos. Dois trilhos paralelos possuem desvios nas colunas 2 e 4. Trens saem do depósito a cada dois turnos, caminham uma casa por avanço e precisam chegar à estação 1 ou 2 indicada no manifesto. Pressionar um desvio alterna entre seguir reto e cruzar os trilhos para qualquer trem que entrar na respectiva coluna; as mudanças são limitadas por um orçamento. A chegada não termina imediatamente: cada trem ocupa sua plataforma por três turnos, e dois trens simultâneos na mesma posição causam uma colisão e encerram a partida. Também há derrota por entrega na estação errada ou excesso de turnos. São 3, 4 ou 5 trens conforme a dificuldade, com itinerários reproduzíveis, vitória por entregar todas as cargas sem colisões, desfazer qualquer ação, reiniciar, novo roteiro, recorde e comandos por toque ou teclado. Funciona offline e não tem bot nem cronômetro real.",
  fortalezas: "Fortalezas de Turnos é um jogo original de defesa por rodadas. Você controla três linhas de uma fortaleza com recursos limitados; a cada turno pode recrutar e posicionar um defensor em uma linha ou aguardar, permitindo até duas unidades por linha. Arqueiros custam dois recursos e atiram à distância causando um dano por rodada, guardas custam dois e atacam com força dois quando a ameaça se aproxima da muralha, e canhões custam três e causam dois danos à distância em turnos alternados. Invasores de uma a três vidas surgem em ondas, avançam uma casa por turno e danificam a muralha se não forem eliminados antes de ultrapassar o campo. Vença ao derrotar todas as ondas preservando a muralha; perca se a vida acabar. São 6, 8 ou 10 ondas conforme a dificuldade, com geração determinística, pontos, recorde, desfazer, reinício e nova batalha. Jogo solo offline, sem robôs, sem cronômetro, com controles por toque e teclado.",
  reles: "Rede de Relés é um quebra-cabeça estratégico de conectividade. Instale até três, quatro ou cinco relés em pontos sinalizados de uma grade 5×5, 6×6 ou 7×7. Só transmite sinal um relé ao lado da estação-base ou ligado a outro relé que já recebe energia, pelas quatro direções. Cada relé ativo cobre dispositivos a uma casa de distância, na horizontal ou na vertical. Para vencer, ligue todos os dispositivos e elimine relés isolados sem ultrapassar o orçamento. O jogo oferece mapas rotacionados reproduzíveis, feedback de cobertura e isolamento, desfazer, reinício, novo mapa e recorde em pontos. Funciona offline por toque ou teclado, sem bot nem cronômetro.",
  irrigacao: "Zonas de Irrigação é um quebra-cabeça de fluxo de água. Conecte a nascente aos campos em uma grade de 4×4, 5×5 ou 6×6. Toque em uma casa e, em seguida, em uma casa vizinha horizontal ou verticalmente para instalar ou remover um canal. A rede transmite água pelas conexões ativas; cada campo consome uma ou duas unidades, conforme o mapa. Pontas de canos conectadas à nascente e sem campo vazam uma unidade de água, portanto você deve irrigar todos os campos sem vazamentos e sem ultrapassar a reserva ou o orçamento máximo de canais. Há três dificuldades, desfazer, recomeçar, novos terrenos, vitória e recorde. Jogo solo/offline, sem rede ou robôs, com toque e teclado.",
  cidade: "Cidade em Miniatura é um jogo solo de planejamento urbano. Monte um bairro em uma grade 3×3, 4×4 ou 5×5 usando moradias, parques, comércios e indústrias, cada um com custo real. A meta inclui uma quantidade mínima de cada zona, sempre respeitando o orçamento. Todas as moradias precisam ficar ao lado de parques ou comércios (somente nas quatro direções) e não podem ser vizinhas de indústrias; áreas protegidas do mapa não aceitam construções. Selecione o tipo de edifício e toque no lote para construir, substituir ou retirar, recebendo o dinheiro de volta na remoção. O jogo informa habitantes satisfeitos e poluição, tem desfazer, pontuação por eficiência, recorde e três dificuldades solucionáveis. Funciona com toque e teclado, sem bot nem rede.",
  alquimia: "Alquimia de Elementos é um desafio solo de crafting com estoques finitos. A bancada começa com Fogo, Água e Terra, que podem gerar Vapor, Argila e Metal; depois você combina esses produtos para criar Elixir, Cristal e, no nível difícil, uma Obra-prima. Cada receita consome dois elementos e gera um, com limite de combinações. Uma escolha errada pode consumir matéria-prima necessária para a receita-alvo, mas você pode desfazer a última jogada, reiniciar ou criar nova bancada. Três dificuldades com soluções comprovadas, recorde e controles por toque ou teclado. Não há compras reais, robôs ou conexão de rede.",
  climas: "Cartas de Climas é um duelo local de dois jogadores no mesmo aparelho. Cada pessoa recebe um baralho individual de seis cartas de Sol, Chuva e Vento, com forças de 1 a 6, e escolhe uma carta por rodada sem a mostrar ao adversário. A interface esconde as cartas durante a passagem de aparelho; somente depois da segunda escolha os valores são revelados. O clima combina com o terreno: Sol na Planície, Chuva na Floresta ou Vento na Costa dão bônus de três pontos de força. Quem vence a disputa ganha dois pontos; empate concede um ponto para cada. Vença pelo maior placar ao final das 3, 4 ou 5 rodadas. Partida reproduzível, recorde local e reinício; sem bots nem multiplayer remoto.",
  colheita: "Colheita das Estações é um desafio estratégico de manejo de fazenda. Escolha um entre quatro canteiros, depois a cultura: cereais dão mais produção, mas consomem duas unidades de fertilidade e água; raízes gastam uma unidade de fertilidade; leguminosas restauram uma unidade do solo e dão dois pontos. O clima varia a cada estação, mudando o rendimento e o custo de água dos cereais. Você também pode descansar uma estação para recuperar solo e água, desde que ainda haja turnos. A vitória exige alcançar a meta de produção antes do limite de estações, sem gastar recursos que não possui. O jogo tem três níveis, desfazer, reiniciar, recorde e controles por toque ou teclado; não usa bot ou rede.",
  resgate: "Barcos de Resgate é um jogo de planejamento naval. Seu barco parte da Base Costeira para salvar pessoas em duas a quatro ilhas, dependendo da dificuldade, e precisa levá-las à base para contar o resgate. A embarcação leva até duas pessoas. Navegar consome combustível conforme a distância e a maré; com maré alta, o custo cresce. Cada deslocamento, resgate, desembarque, espera ou reabastecimento consome um turno. O combustível pode ser reposto na base enquanto houver reserva. Para vencer, desembarque todas as pessoas antes do limite de turnos. Os desafios são gerados de modo reproduzível e solucionável, com três níveis, recorde, reinício e controles por toque ou teclado, sem bot ou rede.",
  farois: "Defesa de Faróis é um quebra-cabeça de cobertura estratégica. Nove locais possíveis aparecem no arquipélago. Escolha onde posicionar dois a quatro faróis, conforme a dificuldade, para iluminar todos os trechos marcados das rotas. Cada farol cobre os trechos localizados a até duas quadras de distância ortogonal. Faróis com áreas redundantes somam pontos de sobreposição, que não podem ultrapassar o limite informado na tela. Toda partida é produzida a partir de uma configuração solucionável. Você pode retirar faróis, desfazer, reiniciar e marcar pontos, com controles por toque e teclado. Sem bots, competição fictícia ou rede.",
  mercadores: "Mercadores de Rotas é um jogo de economia e navegação por turnos. Compre mercadorias em suas cidades de origem (grãos no Porto, cristais na Serra e ervas no Vale), planeje a rota até a Capital e venda com lucro. A capacidade é de três cargas; cada compra, movimento, venda ou reabastecimento consome um turno. Você começa com 22 moedas, combustível e uma meta de lucro que aumentam com a dificuldade. Toda estrada tem consumo fixo de combustível, e no Porto é possível reabastecer com custo. Ganhe quando seu lucro atingir a missão, antes de esgotar o limite de turnos. Preços reproduzíveis por semente, recorde, três níveis, controles por toque e teclado. Não há dinheiro real, bot ou modo online.",
  portas: "Portas Lógicas é um quebra-cabeça de circuitos booleanos. Monte um circuito de uma, duas ou três portas escolhendo E, OU, XOU (ou exclusivo) e NÃO-E; você também pode inverter a saída final. A primeira porta recebe A e B, as seguintes recebem a saída anterior com A ou B, alternadamente. A tabela-verdade mostra as quatro combinações de entrada, a saída esperada e a saída produzida. Gire os tipos de porta e o inversor até que todas as quatro linhas coincidam. As metas são geradas a partir de circuitos solucionáveis, com histórico para desfazer, pontuação e recorde. O jogo é solo e offline, com toque ou teclado.",
  coordenadas: "Coordenadas Perdidas desafia você a localizar um destino oculto usando distâncias em quadras dos faróis. Cada distância é a soma dos deslocamentos horizontais e verticais, sem diagonais. Escolha uma posição no mapa e compare suas distâncias com as pistas antes de confirmar. O jogo oferece até três palpites; os errados informam sua distância até o objetivo. Em dificuldades mais altas você começa com menos pistas e pode revelar as outras com penalidade de pontos. O motor gera faróis e destino com solução única quando as três pistas são exibidas. Tab, Enter e toque funcionam; em telas pequenas o mapa tem rolagem interna para preservar alvos acessíveis. Solo, sem tempo real, bot ou rede.",
  bordas: "Bordas Encantadas é um jogo de rotação de peças de mosaico. O objetivo é conectar todas as bordas internas com cores iguais, sem deixar uma borda colorida apontar para fora do tabuleiro. As bordas cinzentas são fechadas: elas precisam ficar na moldura externa e não podem substituir uma conexão interna. Cada toque ou Enter gira uma peça em 90 graus. O tabuleiro é gerado de uma composição que pode ser resolvida, e qualquer arranjo de rotações que satisfaça o encaixe vence. São três tamanhos, desfazer, reiniciar, pontuação e recorde; não há bot, cronômetro ou internet necessária.",
  cubos: "Cubos Ocultos é um quebra-cabeça de reconstrução de formas em três dimensões. A planta superior mostra quais posições da grade precisam estar ocupadas e quais devem ficar vazias. Os números vistos da frente dão a maior altura de cada coluna e os números laterais a maior altura de cada linha. Clique ou toque nas casas para empilhar cubos até o limite e voltar a zero. A solução será aceita sempre que a ocupação superior e as duas projeções laterais coincidirem, mesmo que existam diversas construções corretas. Desfaça, reinicie ou gere outra escultura; há três dificuldades, recorde e comandos por toque ou teclado, sem bot ou rede.",
  balancas: "Enigma das Balanças é um desafio de dedução. Entre quatro e oito moedas aparentemente iguais, exatamente uma é mais pesada ou mais leve. Escolha quantas moedas colocar em cada prato; os dois grupos devem conter a mesma quantidade. Cada clique alterna uma moeda entre fora, prato esquerdo e prato direito. Pressione Pesar para receber a comparação calculada pelos pesos reais das moedas daquela rodada. Você tem um número limitado de pesagens e duas tentativas para identificar a moeda falsa e dizer se ela é mais pesada ou mais leve. Faça deduções pela história das pesagens, vença e marque pontos. Jogo solo com teclado e toque, sem bot ou rede.",
  fios: "Fio Condutor é um quebra-cabeça solo de caminhos em grade. Comece tocando na origem de uma cor, depois siga tocando nas casas vizinhas para ligar seu fio ao destino. Fios de cores diferentes não podem compartilhar casas, e os blocos impedem a passagem. Para corrigir, volte à casa anterior ou use Desfazer. Depois de terminar um fio, comece pela origem do próximo par. A vitória exige todas as conexões concluídas, com recorde de pontos e três tamanhos de tabuleiro. Há sempre ao menos uma rota solucionável, sem bots nem rede.",
  runas: "Código de Runas é um jogo de decifração. Cada runa equivale a uma letra diferente do alfabeto português sem acentos. O mesmo símbolo representa sempre a mesma letra, e duas runas diferentes não podem ter a mesma letra. Use a pista semântica, escolha uma letra em cada seletor e observe o texto que vai aparecendo. Verifique suas associações, recebendo apenas a contagem de letras corretas. Você pode revelar até duas letras com penalidade na pontuação. Três dificuldades, reinício, nova mensagem, recorde local e controles por toque ou teclado. Não há online nem bot.",
  sombras: "Cofre de Sombras é um quebra-cabeça solo: gire de três a cinco venezianas, cada uma com uma forma própria. Cada toque gira a máscara selecionada por 90 graus. As sombras de camadas sobrepostas se anulam em um filtro óptico alternado, e a silhueta combinada aparece num quadro 4x4. Compare o desenho atual com o modelo de 16 casas e ajuste as orientações até coincidir exatamente. Os enigmas são gerados a partir de orientações válidas e sempre têm solução. Teclado ou toque, desfazer, reiniciar e recorde local.",
  ponteiros: "Ponteiros em Fase é um desafio de sincronização matemática. Cada relógio tem um ciclo distinto, entre 3 e 8 minutos. O tempo simulado avança de forma compartilhada, mas os ponteiros marcam fases diferentes. Descubra o primeiro instante em que todos os ponteiros apontam para o norte, ou seja, a fase zero de todos os ciclos. Avance 1, 5 ou 10 minutos, volte um minuto ou desfaça. São três dificuldades, sem limite de tempo real, bot ou online. Recorde local e controles por teclado ou toque.",
  trilhos: "Trilhos Cruzados desafia você a configurar os desvios de uma ferrovia para que três trens alcancem as saídas mostradas. Cada desvio pode deixar os trens seguirem reto, trocar os trilhos 1 e 2 ou trocar os trilhos 2 e 3. Os desvios são aplicados na ordem, sem colisões ou aleatoriedade oculta. Pressione Testar percurso para ver os resultados, altere os desvios até acertar e salve sua pontuação. São três dificuldades, partidas solo, teclado ou toque, sem timer, bot ou online.",
  arquipelago: "Pontes do Arquipélago é um desafio solo de lógica. Cada ilha mostra quantas pontes precisa receber. Toque em um par de ilhas alinhadas para construir uma, duas ou nenhuma ponte. Conecte todas as ilhas sem cruzamentos e respeite as quantidades. Três dificuldades usam 6, 8 ou 9 ilhas, sempre com uma solução garantida. Desfaça a última jogada, reinicie o mesmo desafio ou gere outro tabuleiro; use toque ou teclado. Seu recorde fica salvo no navegador.",
  engrenagens: "Alinhe todas as engrenagens para o norte. Girar uma engrenagem no sentido horário move as vizinhas no sentido contrário; também é possível girar para a esquerda e desfazer. Escolha de quatro a seis engrenagens em três dificuldades, sem limite de tempo. O quebra-cabeça nasce de giros reversíveis, sempre com solução. Toque ou use Tab, Enter e Espaço nos botões de giro e tente concluir com menos movimentos.",
  contrato: "Contrato das Cores é um jogo competitivo para 2 a 4 pessoas no mesmo aparelho. Cada participante escolhe uma das três peças do mercado compartilhado por turno. Conclua quatro escolhas para formar pares, trincas, quatro iguais ou quatro cores diferentes. As duas cores do contrato público rendem pontos extras a todos. Ganha a maior pontuação após quatro rodadas. Sem bot ou partidas online.",
  passagem: "Passagem Secreta é um jogo competitivo local para 2 a 4 pessoas no mesmo celular. Cada pessoa programa privadamente quatro passos de cima, baixo, esquerda, direita ou esperar. Passe o aparelho e oculte seu plano. Após todos confirmarem, as rotas avançam simultaneamente: quem tenta ocupar a mesma casa colide e permanece no lugar. Cristais concedem pontos, com bônus no centro. Escolha novo percurso para repetir. Não há servidor nem partidas online.",
  cofre: "Cofre em Equipe funciona com 2 a 4 participantes no mesmo aparelho. Cada pessoa lê em particular a posição e o valor de alguns dígitos da senha. Passe o dispositivo, oculte as pistas e converse com o grupo. Montem quatro dígitos distintos de 1 a 9 em até quatro tentativas. As dicas mostram quantos estão na posição certa e quantos pertencem ao código em outra posição. Não existe partida online.",
  frutas: "Solte frutas nas seis colunas usando os botões ou as teclas de 1 a 6. Frutas iguais que se encostam se fundem e fazem as outras cair, criando reações em cadeia. Alcance a fruta dourada antes de esgotar as jogadas. Três dificuldades, pausa automática e recorde local.",
  neon: "Sobreviva a quatro ondas de seis turnos em uma arena 9×9. Setas, WASD ou botões movem você. Ao carregar três cargas, use o pulso (espaço) para eliminar ameaças próximas. Entre ondas, escolha escudo extra ou alcance maior. Saia da aba para pausar.",
  leilao: "Dispute nove relíquias com 30 moedas. Só o vencedor paga seu lance. Pares dão +3; trios dão +8 no lugar do par. Empates de lance seguem a prioridade anunciada. Solo com três dificuldades ou 2–4 pessoas no mesmo aparelho; passe a tela pela cortina.",
  comum: "Associe palavras. Solo por pistas ou 2 a 4 pessoas no mesmo aparelho.",
  ...newGameHelp,
  ...expandedHelp,
  blocos: "Escolha uma das três peças e toque na casa de origem. Preencha linhas ou colunas para limpá-las. Setas movem o foco e Enter posiciona. Ao usar as três peças, outras aparecem. A partida termina quando nenhuma restante cabe.",
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
    "Escolha 6, 10 ou 16 minas. Abra todas as casas seguras. Marque suspeitas com Modo bandeira ou botão direito. Toque em um número aberto para revelar vizinhos se a contagem de bandeiras coincidir. Primeiro toque seguro.",
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
    "Jogue em dupla ou contra o bot com três dificuldades. Toque no número da coluna, pressione 1 a 7 diretamente ou use Tab e Enter. Quatro peças na horizontal, vertical ou diagonal vencem. Contra o bot, desfazer volta o turno completo.",
  puzzle:
    "Organize as peças de 1 a 8 e deixe o espaço vazio no canto inferior direito. Toque em uma peça vizinha ao espaço ou use as setas com o tabuleiro em foco.",
  "2048":
    "Junte números iguais usando setas, os botões de direção ou deslizando no tabuleiro. Você pode desfazer a última jogada; o recorde fica salvo neste navegador.",
  snake:
    "Coma frutas e evite paredes e o próprio corpo. Use setas, WASD, gestos ou controles de direção. Duas curvas rápidas entram na fila em ordem e reversões imediatas são bloqueadas. Espaço pausa. Escolha a velocidade antes de jogar.",
  memoria:
    "Vire duas cartas e encontre os pares. Use toque ou Tab e Enter. Você pode escolher o tempo para memorizar cartas diferentes; o recorde conta as tentativas.",
  xadrez:
    "Escolha uma peça e uma casa de destino. As casas válidas são indicadas. Use as setas para navegar no tabuleiro e Enter para selecionar. Configure bot ou partida local nas opções do jogo. Escolha rainha, torre, bispo ou cavalo para promover o peão. Pausar ou desfazer cancela a análise do bot.",
  damas:
    "Escolha uma peça e uma das casas indicadas. Toque ou use as setas e Enter no tabuleiro. As capturas disponíveis orientam a jogada; escolha bot ou duas pessoas nas opções do jogo.",
  domino:
    "Escolha a peça e o lado de encaixe disponível. Números e cores ajudam a reconhecer os valores. Abra as opções para escolher bot ou duas pessoas; no modo local revele sua mão na sua vez.",
  velha:
    "Escolha uma casa vazia para formar três marcas em linha. Toque ou use Tab e Enter. Jogue contra o bot ou escolha Dupla para dividir o aparelho.",
  futebol:
    "Escolha pênalti ou falta, ajuste mira, força e curva e toque em Chutar. A mira aceita toque e teclado; observe a trajetória e tente melhorar sua série de cinco cobranças.",
};
