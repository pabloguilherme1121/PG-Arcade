# PG Arcade

Uma pausa. Uma nova jogada. **100 jogos gratuitos no navegador**, com controles por teclado e toque, modos de partida, desafios e recordes locais.

Site: https://pabloguilherme1121.github.io/PG-Arcade/
Portfólio: https://pabloguilherme1121.github.io/PG-portfolio/?arcade=1

## Descoberta e partida

Comece por seis mecânicas diferentes, volte ao último jogo visitado ou explore seus favoritos. O catálogo completo combina busca por palavras sem acentos, categorias, modo solo/dupla local e ordenação. Voltar da arena recupera busca, filtros, ordem e posição da lista. A partida começa com título, objetivo e arena; compartilhar, favorito, tela cheia e conforto ficam em opções secundárias. Abrir novamente inicia uma nova sessão, sem confundir recordes com partidas salvas.

Direção, contratos e inventário individual: [PRODUCT.md](PRODUCT.md), [DESIGN.md](DESIGN.md) e [GAME-INVENTORY.md](docs/GAME-INVENTORY.md).

## Expansão para 100 jogos

A segunda expansão adiciona 28 jogos de tabuleiro e estratégia, 12 desafios de lógica e palavras e 10 jogos de ação. As regras são separadas da interface; os módulos são carregados sob demanda. Há controles de teclado e toque, pausa automática, reinício, dificuldade, recordes e ampliação de tabuleiro. Resta Um gera desafios por jogadas reversas, e os jogos de separar cores possuem soluções verificadas.

Os novos jogos incluem Cinco em Linha, Hex, Ataxx, Mancala, Chomp, Oito Rainhas, Resta Um, Quadrado Latino, Dupla Binária, Torres da Cidade, Desigualdades, Quadrado Mágico, Deslize 15, Rede de Tubos, Espelhos e Luz, Trilhas Numeradas, Desafio 24, Forca, Caça-palavras, Pulso Musical, Slalom Alpino, Sentinela e Ricochete Tático. A lista completa está em `src/lib/newCatalog.ts`.

## Catálogo

| Coleção | Jogos |
| --- | --- |
| Novos de lógica e estratégia (10) | Sudoku, Nonograma, Labirinto, Sokoban, Torres de Hanói, Código Secreto, Nim, Reversi, Batalha Naval, Pontos e Caixas |
| Novos de ação (10) | Quebra-blocos, Pong, Asteroides, Invasores, Corrida de Obstáculos, Voo entre Torres, Jetpack, Arena de Esquiva, Pouso Lunar, Circuito Drift |
| Novos de esportes e casuais (8) | Vinte e Um, Dados de Combinação, Boliche, Basquete, Minigolfe, Arco e Flecha, Pesca, Combina 3 |
| Segunda expansão: tabuleiro e estratégia (28) | Maré de Cores, Colapso de Cristais, Resta Um, Caminho do Cavalo, Oito Rainhas, Quadrado Latino, Dupla Binária, Torres da Cidade, Desigualdades, Quadrado Mágico, Deslize 15, Mosaico Giratório, Rede de Tubos, Espelhos e Luz, Circuito Único, Trilhas Numeradas, Pilhas de Cores, Laboratório de Líquidos, Saída Livre, Trilha de Memória, Cinco em Linha, Hex Conexões, Colônia Ataxx, Ilhas em Duelo, Linha de Avanço, Mancala, Chocolate Tático, Fronteiras |
| Segunda expansão: lógica e palavras (12) | Cálculo Relâmpago, Duelo de Frações, Detector de Primos, Incógnita, Desafio 24, Próximo Número, Oficina de Anagramas, Forca de Palavras, Caça-palavras, Cor em Conflito, Intruso Lógico, Olho de Águia |
| Segunda expansão: ação (10) | Pulso Musical, Balões em Fuga, Escudo Meteórico, Torre de Precisão, Equilíbrio Orbital, Slalom Alpino, Travessia Urbana, Salto no Pêndulo, Sentinela, Ricochete Tático |
| Jogos anteriores (22) | Sequência de Cores, Palavra Secreta, Rally de Checkpoints, Coleta na Estrada, Defesa Orbital, Campo Minado, Reflexo Rápido, Corrida Turbo, Estacionamento, Alvos Espaciais, Luzes Out, Caça-estrelas, Liga 4, Quebra-cabeça, 2048, Snake, Memória, Xadrez, Futebol, Dominó, Damas, Jogo da velha |

## Modos, dificuldade e duração

Os controles compartilhados usam alvos de pelo menos 44×48 px; direções e controles de movimento usam 56 px, preservando o tamanho das casas dos tabuleiros. Campos em celulares usam texto de 16 px. O foco de teclado permanece visível, os botões respondem ao pressionar e as ações principais têm destaque verde. Nos jogos de movimento, toques rápidos são guardados até a próxima etapa da física; cancelar o ponteiro libera a direção, e soltar Ação não produz uma segunda ativação por clique.

- Todos os 100 jogos oferecem sessões Livre, Sprint e Maratona. Livre preserva as regras e os limites próprios do jogo. Sprint dura 3, 2 ou 1 minuto; Maratona dura 10, 5 ou 3 minutos, conforme a pressão de tempo Fácil, Normal ou Difícil. Iniciar um desafio abre uma nova partida. Ao expirar, a sessão bloqueia os controles; pausar a sessão ou sair da janela congela o relógio e pausa o jogo. Retome a sessão e, quando necessário, use Continuar no jogo. Esses níveis alteram o tempo da sessão; a dificuldade das regras continua nos controles específicos de cada jogo.
- Snake tem Clássico e Portal: no Portal, atravessar a borda leva ao lado oposto, mas tocar o próprio corpo continua encerrando a partida. As três velocidades valem para ambos.
- 2048 tem Fácil (98% de peças 2), Normal (90%) e Difícil (70%, sem desfazer). Reflexo Rápido muda a janela de pontuação entre 1,4, 1 e 0,6 segundo. Quebra-cabeça oferece embaralhamentos por 12, 40 ou 100 movimentos legais; todos são solucionáveis, e a distância mínima da solução varia entre partidas.
- Memória oferece 4, 8 ou 12 pares. Pausar ou sair da janela mantém as cartas abertas e o tempo restante de observação; Continuar retoma esse tempo. Trocar a dificuldade inicia uma partida nova. O recorde continua geral por jogo, sem separar tamanhos de tabuleiro.
- Os 28 jogos da primeira expansão têm Fácil, Normal e Difícil. Lógica combina desafios livres com séries de cinco; Nim também oferece a regra em que retirar a última peça perde.
- Ação tem Missão com objetivo e até 180 segundos, ou Resistência sem limite de tempo. A física e os controles mudam entre modalidades: rebotes, giro e impulso, salto, voo, combustível, pouso e checkpoints.
- Esportes e casuais têm sessões de 5, 10 ou 15 rodadas; cada dificuldade altera parâmetros próprios, como vento, tolerância, obstáculos, tentativas ou ritmo.
- Rally, Coleta e Defesa Orbital têm Sprint de 30 segundos, Expedição de 90 e Sobrevivência sem limite, três dificuldades e aumento de ritmo a cada etapa. Encerrar e salvar permite concluir uma sessão longa.
- Liga 4 oferece duelo local e bot com três níveis; Normal prioriza vitórias e bloqueios, Difícil usa busca de cinco jogadas. Desfazer contra o bot devolve o turno inteiro.
- Campo Minado oferece 6, 10 ou 16 minas e abertura de vizinhos de números com bandeiras suficientes; marcar errado mantém o risco de perder.
- Xadrez permite promover a rainha, torre, bispo ou cavalo; a análise do bot ocorre em um worker e pode ser cancelada por pausa, desfazer ou reinício.
- Os clássicos conservam suas opções específicas: velocidades, desafios, bots, modos locais, dicas e desfazer conforme o jogo.

## Recursos

Busca sem acentos, categorias visíveis nos cartões, favoritos, ordenação, jogo surpresa, links diretos, ajuda específica, modo foco, tela cheia quando suportada e reinício com confirmação. As partidas em tempo real pausam ao sair da janela ou trocar de aba.

Tela cheia usa a API do navegador ou ocupa a janela em aparelhos sem suporte. O player isola o foco do restante da página, mantém os controles acessíveis e restaura o foco na saída. Escape encerra a alternativa em janela; voltar ao catálogo também encerra a ampliação. Navegadores sem a API ainda podem mostrar a barra de endereço.

Conforto visual oferece alto contraste e redução de efeitos para todo o catálogo, respeitando a preferência do aparelho. As opções persistem localmente; com armazenamento bloqueado, funcionam durante a sessão. Movimento necessário à jogabilidade é preservado.

Há recordes em 94 jogos. Memória e Quebra-cabeça usam menos jogadas como melhor resultado; os demais usam pontos. Os recordes são gerais por jogo e podem variar com modo e dificuldade: não são uma classificação competitiva entre jogadores.

Em **Meu progresso**, salve uma cópia JSON de favoritos, visitas e recordes. Restaurar combina os dados e preserva os melhores resultados. Os arquivos são processados localmente; não há sincronização automática entre dispositivos.

## Visual e limites

Arte original local para carros, nave, asfalto e espaço; jogos em DOM, SVG e Canvas 2D, com profundidade visual e física simplificada. Não são simulações 3D ou fotorealistas. Os novos esportes usam modelos compactos; Minigolfe tem percurso horizontal, e Vinte e Um sorteia cartas com reposição, sem apostas ou dinheiro.

Os 20 jogos em Canvas ajustam o buffer à largura visível e à densidade de pixels, com teto de 2560 pixels e densidade 3 para limitar memória. Ampliar ou girar a tela mantém as coordenadas e a física da partida. Materiais vetoriais adicionam iluminação, relevo e atmosfera sem downloads de texturas adicionais.

Em tela cheia horizontal, com largura de pelo menos 568 px e altura de até 540 px, Snake e os jogos em Canvas posicionam os controles ao lado da arena. Iniciar ou continuar a partida traz essa área para baixo da barra de navegação, mantendo pausa e reinício próximos aos controles. Configurações, placar e instruções continuam acessíveis pela rolagem. A suíte verifica arenas e comandos em 844×390 e 568×320, além da rotação de uma partida pausada.

Sem conta, publicidade ou envio de dados das partidas a servidores. Progresso é salvo neste navegador. Limpar os dados do navegador remove o progresso; guarde sua cópia. Trocar de jogo inicia outra partida, sem restaurar automaticamente a partida em andamento.

## Desenvolvimento e validação

Node.js 24: `npm ci`, `npm run dev`, `npm run audit`, `npm test`, `npm run build`, `npm run check:bundle`, `npm run test:e2e`.

Instalável como PWA, com fallback offline da navegação e cache local de assets já usados. Carregamento sob demanda por jogo/coleção. GitHub Actions valida regras e partidas em Chromium, Firefox e WebKit contra o build de produção servido por `npm run preview`, incluindo o prefixo `/PG-Arcade/`, antes de publicar no GitHub Pages. Falhas preservam traces e capturas para diagnóstico. `npm run test:e2e` reconstrói a aplicação antes da execução, evitando testar artefatos antigos. A suíte inclui auditoria automatizada WCAG com axe-core nos 100 jogos. Rotas com hash funcionam em hospedagem estática.

## Origem e licença

Os cinco jogos originais foram adaptados de [PG-portfolio](https://github.com/pabloguilherme1121/PG-portfolio), sob licença MIT. Os outros 95 jogos e o catálogo foram desenvolvidos para este projeto. Ilustrações foram criadas com auxílio de geração de imagem.

Licença MIT.
