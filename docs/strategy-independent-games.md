# PG Estratégia — 150 jogos independentes

## Contagem verificável

**Meta:** 150 títulos estratégicos completos, distintos por motor de regras, não por mapa, capa, dificuldade ou missão.

**Implementado nos primeiros lotes (ainda sujeito à PR/CI):**
- **Frota Oculta** (`frota-oculta`): dedução naval num tabuleiro 6×6, frota inimiga variável, sonar por linhas, base com vida, reparo, ataques rivais, três dificuldades e vitória/derrota.
- **Hex Conexão** (`hex-conexao`): jogo de conexão hexagonal 7×7, um jogador contra IA com três modos de dificuldade, condição de vitória norte–sul e derrota leste–oeste, sem reocupação de casas.
- **Cartas de Cerco** (`cartas-de-cerco`): baralho com cartas de ataque, fortificação, curas, geração de energia e compra, reembaralhamento, ataques rivais, três dificuldades e vitória/derrota.

**Títulos independentes novos implementados nos dois lotes:** 3.  
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
