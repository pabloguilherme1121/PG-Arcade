# PG Arcade

Uma pausa. Uma nova jogada. **50 jogos gratuitos no navegador**, com controles por teclado e toque, modos de partida, desafios e recordes locais.

Site: https://pabloguilherme1121.github.io/PG-Arcade/
Portfólio: https://pabloguilherme1121.github.io/PG-portfolio/?arcade=1

## Catálogo

| Coleção | Jogos |
| --- | --- |
| Novos de lógica e estratégia (10) | Sudoku, Nonograma, Labirinto, Sokoban, Torres de Hanói, Código Secreto, Nim, Reversi, Batalha Naval, Pontos e Caixas |
| Novos de ação (10) | Quebra-blocos, Pong, Asteroides, Invasores, Corrida de Obstáculos, Voo entre Torres, Jetpack, Arena de Esquiva, Pouso Lunar, Circuito Drift |
| Novos de esportes e casuais (8) | Vinte e Um, Dados de Combinação, Boliche, Basquete, Minigolfe, Arco e Flecha, Pesca, Combina 3 |
| Jogos anteriores (22) | Sequência de Cores, Palavra Secreta, Rally de Checkpoints, Coleta na Estrada, Defesa Orbital, Campo Minado, Reflexo Rápido, Corrida Turbo, Estacionamento, Alvos Espaciais, Luzes Out, Caça-estrelas, Liga 4, Quebra-cabeça, 2048, Snake, Memória, Xadrez, Futebol, Dominó, Damas, Jogo da velha |

## Modos, dificuldade e duração

- Os 28 novos jogos têm Fácil, Normal e Difícil. Lógica combina desafios livres com séries de cinco; Nim também oferece a regra em que retirar a última peça perde.
- Ação tem Missão com objetivo e até 180 segundos, ou Resistência sem limite de tempo. A física e os controles mudam entre modalidades: rebotes, giro e impulso, salto, voo, combustível, pouso e checkpoints.
- Esportes e casuais têm sessões de 5, 10 ou 15 rodadas; cada dificuldade altera parâmetros próprios, como vento, tolerância, obstáculos, tentativas ou ritmo.
- Rally, Coleta e Defesa Orbital têm Sprint de 30 segundos, Expedição de 90 e Sobrevivência sem limite, três dificuldades e aumento de ritmo a cada etapa. Encerrar e salvar permite concluir uma sessão longa.
- Os clássicos conservam suas opções específicas: velocidades, desafios, bots, modos locais, dicas e desfazer conforme o jogo.

## Recursos

Busca sem acentos, categorias visíveis nos cartões, favoritos, ordenação, jogo surpresa, links diretos, ajuda específica, modo foco, tela cheia quando suportada e reinício com confirmação. As partidas em tempo real pausam ao sair da janela ou trocar de aba.

Há recordes em 44 jogos. Memória e Quebra-cabeça usam menos jogadas como melhor resultado; os demais usam pontos. Os recordes são gerais por jogo e podem variar com modo e dificuldade: não são uma classificação competitiva entre jogadores.

Em **Meu progresso**, salve uma cópia JSON de favoritos, visitas e recordes. Restaurar combina os dados e preserva os melhores resultados. Os arquivos são processados localmente; não há sincronização automática entre dispositivos.

## Visual e limites

Arte original local para carros, nave, asfalto e espaço; jogos em DOM, SVG e Canvas 2D, com profundidade visual e física simplificada. Não são simulações 3D ou fotorealistas. Os novos esportes usam modelos compactos; Minigolfe tem percurso horizontal, e Vinte e Um sorteia cartas com reposição, sem apostas ou dinheiro.

Sem conta, publicidade ou envio de dados das partidas a servidores. Progresso é salvo neste navegador. Limpar os dados do navegador remove o progresso; guarde sua cópia. Trocar de jogo inicia outra partida, sem restaurar automaticamente a partida em andamento.

## Desenvolvimento e validação

Node.js 24: `npm ci`, `npm run dev`, `npm test`, `npm run build`, `npm run test:e2e`.

Carregamento sob demanda por jogo/coleção. GitHub Actions valida regras e partidas em Chromium, Firefox e WebKit antes de publicar no GitHub Pages. Rotas com hash funcionam em hospedagem estática.

## Origem e licença

Os cinco jogos originais foram adaptados de [PG-portfolio](https://github.com/pabloguilherme1121/PG-portfolio), sob licença MIT. Os outros 45 jogos e o catálogo foram desenvolvidos para este projeto. Ilustrações foram criadas com auxílio de geração de imagem.

Licença MIT.
