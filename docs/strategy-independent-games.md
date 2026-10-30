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
