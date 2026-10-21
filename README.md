# PG Arcade

Uma pausa. Uma nova jogada. **122 jogos gratuitos no navegador**, com controles por teclado e toque, modos de partida, desafios e recordes locais.

Site: https://pabloguilherme1121.github.io/PG-Arcade/
Portfólio: https://pabloguilherme1121.github.io/PG-portfolio/?arcade=1

## Descoberta e partida

Comece por seis mecânicas diferentes, volte ao último jogo visitado ou explore seus favoritos. O catálogo completo combina busca por palavras sem acentos, categorias, modo solo/dupla local e ordenação. Voltar da arena recupera busca, filtros, ordem e posição da lista. A partida começa com título, objetivo e arena; compartilhar, favorito, tela cheia e conforto ficam em opções secundárias. Abrir novamente inicia uma nova sessão, sem confundir recordes com partidas salvas.

Direção, contratos e inventário individual: [PRODUCT.md](PRODUCT.md), [DESIGN.md](DESIGN.md) e [GAME-INVENTORY.md](docs/GAME-INVENTORY.md).

## Expansão para 101 jogos

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
| Novo puzzle (1) | Blocos Infinito — linhas, combos e três peças por rodada |
| Jogos anteriores (22) | Sequência de Cores, Palavra Secreta, Rally de Checkpoints, Coleta na Estrada, Defesa Orbital, Campo Minado, Reflexo Rápido, Corrida Turbo, Estacionamento, Alvos Espaciais, Luzes Out, Caça-estrelas, Liga 4, Quebra-cabeça, 2048, Snake, Memória, Xadrez, Futebol, Dominó, Damas, Jogo da velha |

## Modos, dificuldade e duração

Os controles compartilhados usam alvos de pelo menos 44×48 px; direções e controles de movimento usam 56 px, preservando o tamanho das casas dos tabuleiros. Campos em celulares usam texto de 16 px. O foco de teclado permanece visível, os botões respondem ao pressionar e as ações principais têm destaque verde. Nos jogos de movimento, toques rápidos são guardados até a próxima etapa da física; cancelar o ponteiro libera a direção, e soltar Ação não produz uma segunda ativação por clique.

- Os jogos oferecem sessões Livre, Sprint e Maratona. Livre preserva as regras e os limites próprios do jogo. Sprint dura 3, 2 ou 1 minuto; Maratona dura 10, 5 ou 3 minutos, conforme a pressão de tempo Fácil, Normal ou Difícil. Iniciar um desafio abre uma nova partida. Ao expirar, a sessão bloqueia os controles; pausar a sessão ou sair da janela congela o relógio e pausa o jogo. Retome a sessão e, quando necessário, use Continuar no jogo. Esses níveis alteram o tempo da sessão; a dificuldade das regras continua nos controles específicos de cada jogo.
- Snake tem Clássico e Portal: no Portal, atravessar a borda leva ao lado oposto, mas tocar o próprio corpo continua encerrando a partida. As três velocidades valem para ambos.
- 2048 tem Fácil (98% de peças 2), Normal (90%) e Difícil (70%, sem desfazer). Reflexo Rápido muda a janela de pontuação entre 1,4, 1 e 0,6 segundo. Quebra-cabeça oferece embaralhamentos por 12, 40 ou 100 movimentos legais; todos são solucionáveis, e a distância mínima da solução varia entre partidas.
- Memória oferece 4, 8 ou 12 pares. Pausar ou sair da janela mantém as cartas abertas e o tempo restante de observação; Continuar retoma esse tempo. Trocar a dificuldade inicia uma partida nova. Novos recordes separam tamanho do tabuleiro, tempo de observação e modo de sessão. O tempo de observação é escolhido antes da primeira carta.
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

Há recordes em 95 jogos. Memória e Quebra-cabeça usam menos jogadas como melhor resultado; os demais usam pontos. 2048, Memória, Snake e Blocos Infinito também guardam recordes por dificuldade/configuração e sessão (Livre, Sprint ou Maratona com sua pressão de tempo). A cópia JSON inclui esses dados em `recordsV2`; importar preserva os melhores resultados em cada categoria. Marcas gerais anteriores permanecem disponíveis, sem atribuir modos desconhecidos ao histórico. Os outros jogos ainda usam recordes gerais: não são uma classificação competitiva entre jogadores.

Em **Meu progresso**, salve uma cópia JSON de favoritos, visitas e recordes. Restaurar combina os dados e preserva os melhores resultados. Os arquivos são processados localmente; não há sincronização automática entre dispositivos.

## Visual e limites

Arte original local para carros, nave, asfalto e espaço; jogos em DOM, SVG e Canvas 2D, com profundidade visual e física simplificada. Não são simulações 3D ou fotorealistas. Os novos esportes usam modelos compactos; Minigolfe tem percurso horizontal, e Vinte e Um sorteia cartas com reposição, sem apostas ou dinheiro.

Os 20 jogos em Canvas ajustam o buffer à largura visível e à densidade de pixels, com teto de 2560 pixels e densidade 3 para limitar memória. Ampliar ou girar a tela mantém as coordenadas e a física da partida. Materiais vetoriais adicionam iluminação, relevo e atmosfera sem downloads de texturas adicionais.

Em tela cheia horizontal, com largura de pelo menos 568 px e altura de até 540 px, Snake e os jogos em Canvas posicionam os controles ao lado da arena. Iniciar ou continuar a partida traz essa área para baixo da barra de navegação, mantendo pausa e reinício próximos aos controles. Configurações, placar e instruções continuam acessíveis pela rolagem. A suíte verifica arenas e comandos em 844×390 e 568×320, além da rotação de uma partida pausada.

Sem conta, publicidade ou envio de dados das partidas a servidores. Progresso é salvo neste navegador. Limpar os dados do navegador remove o progresso; guarde sua cópia. Trocar de jogo inicia outra partida, sem restaurar automaticamente a partida em andamento.

## Desenvolvimento e validação

Node.js 24: `npm ci`, `npm run dev`, `npm run audit`, `npm test`, `npm run build`, `npm run check:bundle`, `npm run test:e2e`.

Instalável como PWA, com fallback offline da navegação e cache local de assets já usados. Carregamento sob demanda por jogo/coleção. GitHub Actions valida regras e partidas em Chromium, Firefox e WebKit contra o build de produção servido por `npm run preview`, incluindo o prefixo `/PG-Arcade/`, antes de publicar no GitHub Pages. Falhas preservam traces e capturas para diagnóstico. `npm run test:e2e` reconstrói a aplicação antes da execução, evitando testar artefatos antigos. A suíte inclui auditorias automatizadas com axe-core; isso não substitui avaliação manual de acessibilidade. Rotas com hash funcionam em hospedagem estática.

## Origem e licença

Os cinco jogos originais foram adaptados de [PG-portfolio](https://github.com/pabloguilherme1121/PG-portfolio), sob licença MIT. Os outros 95 jogos e o catálogo foram desenvolvidos para este projeto. Ilustrações foram criadas com auxílio de geração de imagem.

Licença MIT.

### Medição dos jogos de referência
O job Chromium publica `arcade-reference-performance` com três amostras frias de Snake, 2048, Memória, Xadrez, Corrida e Futebol, viewport 390×844 e CPU simulada em 4×. O JSON inclui carregamento, DOM, tarefas longas e intervalos de 120 frames após uma ação definida. Intervalo de `requestAnimationFrame` não é tempo de renderização da GPU nem prova de FPS sustentado em partida; cenários discretos podem ficar ociosos após a ação.

Para repetir localmente com Chromium instalado e o preview iniciado: `npm run perf:benchmark -- --base-url=http://127.0.0.1:5173/ --samples=3 --frames=120`. Em aparelho físico, repetir início, 60 segundos de jogo, pausa/retomada e rotação nos seis jogos, anotando modelo, navegador, aquecimento e falhas de controle. Os resultados simulados não substituem essa verificação.

## Palavra em Comum e diagnóstico local

Palavra em Comum oferece solo por pistas e 2–4 participantes no mesmo aparelho. No solo, leia a descrição e escolha a associação correspondente; no grupo, passe a tela entre escolhas. Sons são opcionais e desligados por padrão. Resultados pertencem à partida, sem ranking entre formatos.

Em Progresso, “Iniciar coleta local” permite medir tarefas longas enquanto você testa o catálogo, quando o navegador oferece a API. Volte para interromper e exportar o diagnóstico JSON. A coleta mantém até 128 durações recentes em memória; não registra URL, favoritos ou recordes, não persiste em storage e não envia dados. Medições do navegador não certificam FPS sustentado ou Android físico.


## Sobrevivência Neon (104º título)

Novo jogo original e carregado sob demanda: quatro ondas táticas em grade 9×9, hordas perseguidoras limitadas, pulso que carrega a cada movimento, melhorias de escudo/alcance e três dificuldades reais. Teclado, botões mobile, pausa automática, vitória/derrota e recordes locais. Testes automatizados não substituem o aceite em Android físico.


## Frutas em Fusão — 105º título

Quebra-cabeça de fusões por gravidade em tabuleiro 6×7, com reações em cadeia, três dificuldades, modo por turnos, teclado numérico e toque nas colunas. Salva recordes sem modificar o progresso legado. O desafio é vencer criando a fruta dourada antes do limite de jogadas. A validação física Android é separada dos testes automáticos.


### Cofre em Equipe (106º título)

Jogo cooperativo local para 2–4 pessoas no mesmo aparelho: repasse privado de pistas, dedução de senha em quatro tentativas, feedback posicional, dificuldade por cooperação, reinício e recordes. Não anuncia multiplayer online, salas ou dados no servidor.


### Passagem Secreta (107º título)

Competição no mesmo aparelho para 2–4 pessoas. Cada explorador registra em segredo quatro passos, as rotas são executadas simultaneamente em tabuleiro 5×5, colisões impedem movimentos e cristais concedem pontos. Sem cadastro, anúncios, servidor ou suporte online alegado. Inclui regras determinísticas e testes de tabuleiro/controles.


### Contrato das Cores (108º título)

Draft competitivo presencial de 2–4 pessoas em um único aparelho: mercado de três cores, objetivos públicos, quatro rodadas, pares e trincas, diversidade de cores, placar e vencedor por pontos. Módulo carregado sob demanda, sem backend, bot fictício ou anúncios.

### Engrenagens do Tempo (109º título)

Quebra-cabeça solo, offline, com quatro a seis engrenagens conectadas. Cada giro afeta a escolhida e as vizinhas em sentidos opostos. Três dificuldades, desafios gerados por giros reversíveis, desfazer, reiniciar, nova partida, recorde e controles acessíveis por toque/teclado. Sem bot, temporizador ou multiplayer fictício. A integração depende da certificação das PRs #169 e #170.


### Pontes do Arquipélago (110º título — expansão em PR)

Quebra-cabeça de 6, 8 ou 9 ilhas numeradas conectadas por até duas pontes entre vizinhas. A vitória exige que todas as ilhas estejam conectadas, que a quantidade de pontes coincida com os números e que nenhuma ponte cruze outra. Geração determinística com solução verificada em testes, movimentos reversíveis, recorde, toque e teclado. Motor sob demanda, sem bot ou rede fictícios. A integração depende dos gates e da certificação das PRs anteriores.


### Trilhos Cruzados (111º jogo — expansão em PR)

Configure três, quatro ou cinco desvios entre três trilhos para que os trens A/B/C alcancem as saídas corretas. Trocas de vias preservam a ausência de colisões; os desafios são gerados por rotas alcançáveis. O motor verifica cada percurso, dá feedback individual, registra pontuação e reinicia sem custo, bot ou serviço externo. Teclado, toque e mobile 320/390/844×390 são cobertos por testes. A PR permanece draft até os gates e merge seguro da base.


### Ponteiros em Fase (112º jogo — expansão em PR)

Sincronize três a cinco relógios de ciclos diferentes com um relógio global de tempo simulado. O desafio tem uma solução matematicamente verificável por congruências, avanço de 1/5/10 minutos, retorno, desfazer, reinício, recorde, teclado e toque. Motor lazy e sem dependências externas, bots ou modos online. Precisa de CI e integração segura da cadeia anterior.


### Cofre de Sombras (113º jogo — expansão em PR)

Quebra-cabeça solo de camadas de máscaras giratórias e 16 células em grade 4×4: alcance a silhueta-alvo sobrepondo três a cinco máscaras de filtros ópticos alternados, com rotação de 90° a cada toque. Os enigmas são gerados a partir de uma solução, com desfazer, reiniciar, recorde e controles por toque/teclado. Módulo lazy e capa SVG, sem bots ou rede fictícios. Exige CI e integração da base.


### Código de Runas (114º título — PR de expansão)

Decifração de frases por substituição monoalfabética. Cada símbolo rúnico corresponde a exatamente uma letra; o painel mostra o texto cifrado e a tradução parcial, com feedback de contagem de acertos, até duas dicas penalizadas e três dificuldades. O motor garante desafio decodificável com regras de correspondência, reinício e pontuação. UI acessível com seletores e E2E 320/390/844×390; sem conta, bots, servidor ou custos. A integração depende dos gates no HEAD final da cadeia.


### Fio Condutor (115º título — PR de expansão)

Quebra-cabeça de caminhos disjuntos: toque na origem de cada cor e construa um caminho ortogonal até seu destino, sem atravessar obstáculos ou outros fios. O motor valida a adjacência, bloqueios, conexões e vitória global, com desfazer, reinício, três dificuldades, recorde e tabuleiros gerados com solução garantida. Módulo lazy, capa SVG e E2E 320/390/844×390; não promete online ou bot.


### Enigma das Balanças (116º título — PR de expansão)

Dedução de uma moeda falsa mais pesada ou leve por pesagens reais, calculadas com grupos de tamanho igual. Até 3/4/5 pesagens nas dificuldades Fácil/Normal/Difícil e duas acusações permitidas. Motor determinístico, histórico de resultados, pontuação, reinício, capa SVG e E2E em 320/390/844×390; sem backend, bot ou compras. Aceite condicionado ao CI completo, merge sequencial e Android físico.


### Cubos Ocultos (117º título — PR de expansão)

Reconstrução em 3D a partir das vistas frontal, lateral e superior em tabuleiros 3×3 a 5×5. Cada casa permite 0–4 alturas; as projeções definem as metas e toda escultura é gerada a partir de uma solução válida. Inclui toque, teclado, desfazer, reiniciar, novo desafio, recorde e testes de 300 cenários de geração, conclusão real e E2E mobile. Módulo lazy e sem rede ou bots. A PR precisa ser certificada antes da integração.


### Bordas Encantadas (118º título — PR de expansão)

Mosaicos rotativos 3×3, 4×4 e 5×5 gerados de arestas coincidentes com ao menos uma solução garantida. Toque/teclado gira cada peça por 90°; a vitória exige cores internas correspondentes e paredes cinzentas voltadas à borda externa. Inclui desfazer, pontuação, recorde, capa SVG, lazy load e testes de 300 gerações/soluções e E2E 320/390/844×390. Sem bot, internet ou cronômetro; aguarda os gates de integração da cadeia.


### Coordenadas Perdidas (119º título — PR de expansão)

Encontre um destino escondido por distância de Manhattan a faróis fixos. Três dificuldades com grades 5×5/7×7/9×9, pistas iniciais progressivamente menores, revelação de pistas com penalidade, marcação e comparação de distâncias, três palpites e recorde. A geração garante que os três faróis identificam uma única coordenada; testes de 360 mapas comprovam unicidade. Mobile com rolagem interna e casas de 46 px, ARIA, teclado, lazy import e E2E 320/390/844×390. Ainda precisa de certificação de CI e merge seguro.


### Portas Lógicas (120º título — PR de expansão)

Circuitos booleanos editáveis com uma a três portas lógicas, inversor opcional, tabela-verdade de quatro combinações e metas sempre alcançáveis. O jogador altera E, OU, XOU e NÃO-E e a saída final até reproduzir o resultado esperado. Jogadas, desfazer, vitória, recorde, três dificuldades, capa SVG, motor lazy, toque e teclado. Testes de 300 desafios e E2E 320/390/844×390. Não inclui bots nem online e aguarda CI da cadeia antes da publicação.


### Mercadores de Rotas (121º título — PR de expansão)

Negocie mercadorias entre Porto, Serra, Vale e Capital em turnos limitados. Transporte três tipos de produtos com cargas e caixa finitos, pague combustível por estradas, reabasteça e venda em mercados para atingir lucro positivo em três dificuldades. Soluções construtivas verificadas em múltiplas sementes, 100% solo/offline com recordes, controles touch/teclado, capa SVG e import lazy. A PR deve passar gates E2E e integração antes da publicação.


### Defesa de Faróis (122º título — PR de expansão)

Planeje a cobertura de rotas colocando 2 a 4 faróis em até 9 locais com alcance ortogonal de duas casas e limite de sobreposições. A geração cria uma missão solucionável; as decisões permitem colocar, remover e desfazer sem bot ou rede. Vitória pela cobertura completa dentro do orçamento de redundância, pontuação, três dificuldades, SVG próprio e E2E mobile 320/390/844×390; exige CI completo antes da integração.
