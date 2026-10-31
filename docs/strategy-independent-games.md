# PG Estratégia — 150 jogos independentes

## Contagem verificável

**Meta:** 150 títulos estratégicos completos, distintos por motor de regras, não por mapa, capa, dificuldade ou missão.

**Implementado nos primeiros lotes (ainda sujeito à PR/CI):**
- **Frota Oculta** (`frota-oculta`): dedução naval num tabuleiro 6×6, frota inimiga variável, sonar por linhas, base com vida, reparo, ataques rivais, três dificuldades e vitória/derrota.
- **Hex Conexão** (`hex-conexao`): jogo de conexão hexagonal 7×7, um jogador contra IA com três modos de dificuldade, condição de vitória norte–sul e derrota leste–oeste, sem reocupação de casas.
- **Patrulha Tática** (`patrulha-tatica`): motor independente de tática em grade 5×5, dois objetivos (combate/extração), IA adversária, munição, cobertura, kits médicos, 3 dificuldades e vitória/derrota. Esta PR depende da #215.
- **Cartas de Cerco** (`cartas-de-cerco`): baralho com cartas de ataque, fortificação, curas, geração de energia e compra, reembaralhamento, ataques rivais, três dificuldades e vitória/derrota.

**Títulos independentes novos implementados nas PRs empilhadas:** 4 (2 na #213, Hex na #215 e Patrulha nesta PR), ainda sujeitos a validação integral e merge.  
**Títulos já classificados como Estratégia no PG Arcade:** 47 links herdados; preservados, mas requerem auditoria individual para garantir que todos satisfaçam o novo padrão de motor independente.  
**150 missões da campanha:** permanecem em seis regras compartilhadas; **não contam como 150 títulos independentes**.

## Regra de aceite para contar cada jogo

1. ID estável e motor próprio, não uma cópia superficial de outro título.
2. Desafio verificável: ações relevantes, regras, recursos ou adversário e condições de vitória **e** derrota.
3. Interface jogável com mouse, teclado e toque em 320 e 390px; controles com área de toque ≥44px, foco visível, sem overflow.
4. Dificuldades ou modos documentados com mudança concreta de regras ou orçamento; reinício e resultado coerentes.
5. Testes unitários de estados, ações inválidas, vitória, derrota, determinismo, controles e isolamento offline; E2E Chromium/Firefox/WebKit.
6. Código modular, cache PWA isolado e respeito ao orçamento de bundle inicial do Arcade (<400 KiB raw, <120 KiB gzip).
7. Nenhuma cobrança, conta, API externa obrigatória ou dados pessoais; melhor recorde apenas no navegador.

## Organização do catálogo até 150 títulos

Separar jogos em lotes pequenos, idealmente 2–5 por PR, até concluir 150 títulos que passem por auditoria individual. Áreas: tabuleiros competitivos, tática por turnos, defesa de torres, gestão urbana, economia, estratégia em tempo real simplificada, naval, cartas, sobrevivência e cooperação local. Missões, skins ou níveis extras ampliam um jogo, mas não aumentam a contagem de títulos.

## Dependências e publicação

Este lote é uma PR empilhada sobre a PR #211 do microsite (a #212 implementa retomada das missões de campanha separadamente). Integrar primeiro o microsite e resolver conflito da camada de retomada se necessário. Exigir `quality`, 12 shards E2E, `validate`, CodeQL e deploy GitHub Pages da `main`. Android físico e HTTP 200 externo são aceites independentes após publicação.

`public/estrategia/independentes/` permanece isolado do service worker da campanha e do Arcade, possuindo PWA e manifest próprios. Não afirmar publicação externa antes de evidência real.

## Lote experimental de 20º a 22º motor (PR empilhada sobre 19º)

Três candidatos novos, ainda não integrados à `main`:

- **Guardiões dos Biomas** (`guardioes-biomas`): gestão ambiental, previsão de ameaças, proteção de regiões e restauração. Dois objetivos e três dificuldades, vitória/derrota, PG Bot e recordes locais.
- **Rede de Frequências** (`rede-frequencias`): alocação de canais sobre um grafo com interferência entre pontos adjacentes. Dois objetivos, três dificuldades, dicas, desfazer e pontuação.
- **Central de Resgates** (`central-resgates`): distribuição de atendimentos por prioridade, duração e prazo. Dois objetivos e três dificuldades, planejamento de turnos e limite de tempo.

O conjunto totaliza **22 candidatos distintos** somente quando as PRs dos motores 17–19 e este lote forem integradas com todos os testes. Permanecem **16 motores na `main`** até a integração desses lotes. Não são 150 jogos independentes; as 150 missões continuam separadas. Não mesclar antes da matriz de CI completa, CodeQL e revisão, nem afirmar publicação/Android físico sem evidência.

## 23º candidato independente: Linha de Contenção

Linha de Contenção (ID linha-contencao): simulação espacial de propagação de incêndio, duas ações por rodada, faixas de proteção, água, localidades protegidas e fumaça. Dois objetivos (proteger e resistir), três dificuldades (grades 4×4, 5×5 e 6×6), geração determinística, vitória/derrota, pausa, desfazer, dicas, recordes locais, PG Bot e PWA com cache próprio. Difere de Guardiões dos Biomas por utilizar propagação espacial de incêndios e posicionamento de barreiras no mapa, não gestão de regiões e previsão de clima.

Contagem: 23 candidatos apenas se integrados os PRs 17–22 e este. A main permanece com 16 até revisão, CI, merge e verificação do HTTPS público. São 150 missões de campanha compartilhando seis regras, não 150 jogos. Após integrar os 23 títulos distintos, restariam 127.

## 24º candidato independente: Espelhos de Sinal

Espelhos de Sinal (ID espelhos-sinal): quebra-cabeça de óptica geométrica com feixes refletidos nos espelhos de duas orientações, emissor e receptor. Um ou dois circuitos (modos simples e duplo), três dificuldades (4×4, 5×5, 6×6), decoys, limites de jogadas, pausa, desfazer, dica, PG Bot, recordes locais, teclado e toque. PWA próprio isolado do catálogo e dos demais jogos. Diferente de Malha de Energia, que alterna células e vizinhos por paridade; a vitória depende do traçado espacial dos feixes.

Somente após integrar todas as PRs empilhadas serão 24 motores independentes, ainda faltando 126 para chegar à meta 150. Não contabilizar as 150 missões como jogos distintos. Integrar apenas após CI e validação real.

## 25º candidato independente: Armazém Tático

Armazém Tático (ID armazem-tatico) é um puzzle de empurrar caixas para destinos com paredes, regras Sokoban e planejamento de rotas. Dois modos (entrega e economia), três dificuldades (5x5 com uma carga, 6x6 com duas ou três cargas), sementes determinísticas orientando o mapa, movimentos limitados, vitória/derrota, pausa, desfazer, dicas por busca em largura (BFS) do estado real, recordes locais por modalidade, touch e teclado, PG Bot contextual offline, manifest e service worker próprio. É distinto de Pontes (grafo), Espelhos (ray tracing), Malha (paridade) e Torre (pilhas).

25 motores distintos somente após integração da #267 e desta PR; continuam faltando 125 até 150. As 150 missões existentes não contam como novos motores. Não mesclar sem CI integral, HTTPS público e testes físicos Android em etapa separada.

## 26º candidato independente: Nonograma Tático

Nonograma Tático (`nonograma-tatico`) utiliza pistas de blocos consecutivos por linha e coluna, com três dimensões (5×5, 6×6, 7×7), dois modos (Exploração e Precisão), limites de jogadas e erros, pausa, desfazer, dicas contextuais, navegação touch/teclado e PG Bot local. Regras distintas de empurrar caixas, óptica, grafos e paridade. A meta de 150 exige mais 124 motores após integrar todos os 26. Não contar o candidato como publicado sem CI integral e HTTPS real.
## 27º candidato independente: Moinhos de Pedra

Moinhos de Pedra (`moinhos-pedra`) implementa um tabuleiro de 24 posições e 16 alinhamentos, com fases de colocação, movimento por adjacência, formação de linhas de três, captura obrigatória, voo com três peças, adversário determinístico e estados de vitória, derrota e empate. Possui dois modos (Rápido, seis peças; Clássico, nove peças), três dificuldades, pausa, desfazer por jogada humana e resposta da IA, recordes locais por modo/dificuldade, suporte PG Bot local e service worker com cache isolado. Um novo jogo é contado somente após integração e certificação completa dos testes, não como nova missão. No HEAD desta branch há 26 candidatos; a main pode permanecer com menos.

Critérios ainda pendentes: matriz completa de CI, CodeQL, revisão, publicação pública HTTPS e teste no Android físico. São necessários mais 124 jogos originais após a integração dos 26, sem contabilizar 150 missões compartilhadas ou 47 atalhos antigos.


Nota de integração: há 27 motores independentes neste ramo, 123 ainda faltam para 150. As 150 missões existentes não contam. O texto histórico de PRs anteriores é preservado como histórico, não como estado atual.

## 28º candidato independente: Satélites Orbitais

Satélites Orbitais (satelites-orbitais) é um desafio de agendamento de observações em janelas de contato, com energia recarregável e intervalos de tempestade. Possui dois modos, três dificuldades, geração determinística, pistas BFS a partir das regras reais, vitória e derrota, pausa, desfazer, controles touch e teclado, PG Bot offline e SW isolado. É diferente de Fronteira Orbital: não possui colonização, pesquisa ou exploração 4X. Após integrar os 28 candidatos ainda faltarão 122 motores independentes para a meta 150. Não contar as missões da campanha como jogos diferentes. Esta branch depende da integração da PR #271 e não está publicada na main.

## 29º candidato independente: Travessia do Vale

Motor de logística com balsa, capacidade de 1 ou 2 passageiros, itens com incompatibilidades que não podem ficar juntos sem supervisão, três dificuldades e dois modos, vitória e derrota por prazo, desfazer, pausa e dica BFS calculada pelo motor. Diferente de Pontes do Arquipélago (redes) e Torre Logística (discos). Possui controles touch, responsividade 320–1200 px, recordes locais, PG Bot contextual offline e SW isolado. Após integração serão 29 jogos independentes, faltando 121 para chegar a 150. Esta branch depende das PRs #271 e #273; não conta missões de campanha como títulos.

## 30º candidato independente: Cofre de Códigos

Mecânica de dedução de sequência secreta com feedback de símbolos exatos e deslocados; não é cópia dos jogos de criptografia por substituição. São dois modos (com e sem símbolos repetidos), três dificuldades (4, 5 e 6 posições), feedback correto para multiconjuntos, limites de tentativas, desfazer, pausa, recordes locais, dicas de posição com penalidade de pontos, controles touch/teclado, PG Bot contextual e cache PWA isolado. Com 30 motores independentes candidatos, ainda faltam 120 para 150. Esta branch depende das PRs #271, #273 e #274. Não conta as 150 missões da campanha como títulos.

## 31º candidato independente: Relógios da Maré

Desafio modular de sincronização: um toque avança um mostrador e seus vizinhos. Linha costeira e Anel oceânico, com 4, 5 ou 6 relógios. O estado é gerado por embaralhamento reversível, e as dicas BFS calculam passos reais até zerar os mostradores. Possui 48 movimentos máximos, pausa, desfazer, recordes por modo/dificuldade, teclado/touch, PG Bot local e PWA isolado. É distinto de Cofre de Códigos, rede elétrica e óptica. Com 31 candidatos restam 119 jogos independentes para a meta. Branch empilhada sobre #275, sem publicação na main.
