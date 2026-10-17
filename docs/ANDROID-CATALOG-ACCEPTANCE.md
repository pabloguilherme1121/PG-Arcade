# Protocolo de performance e jogabilidade — 101 jogos

Este documento define o aceite; não afirma que Android físico foi testado. O benchmark automatizado é uma aproximação em Chromium com CPU simulada, não substitui hardware real.

## Catálogo: 101 cartões

Executar `npm run perf:benchmark -- --base-url=http://127.0.0.1:5173/ --samples=5 --frames=120 --output=artifacts/arcade-performance.json` após iniciar o preview. O relatório inclui `catalogViewportSamples` e `catalogViewportSummary` para **320 × 740** e **390 × 844**, com contextos novos, Service Worker desabilitado e o mesmo perfil de CPU usado no benchmark dos jogos.

- Para cada amostra: número de cartões, nós DOM, SVGs, bytes JS/CSS transferidos, long tasks e heap quando disponível.
- Nove posições de rolagem de ida e volta: duração de dois frames após cada deslocamento, p50/p95/máximo e quantidade acima de 50 ms. Isto é um indicador de custo de rolagem, **não** INP, FPS sustentado ou tempo de pintura da GPU.
- O benchmark deve falhar se a quantidade de cartões mudar durante a amostra ou se `documentElement.scrollWidth > innerWidth + 1` em qualquer posição.
- Comparar as medianas e p95 com a `main` usando exatamente o mesmo runner, versão do navegador, flags e amostras. Não impor um limiar temporal inventado antes de capturar uma linha de base reproduzível.

## Android físico — verificação obrigatória e ainda pendente

Registrar aparelho, versão do Android/Chrome, taxa de atualização, nível de bateria, modo de economia de energia, resolução CSS, versão/commit do site, temperatura inicial/final e rede.

1. Usar ao menos um Android intermediário real; executar catálogo com 320 e 390 CSS px, com zoom padrão e tamanho de fonte aumentado. Não simular como se fosse um aparelho físico.
2. Fazer cinco entradas frias e cinco quentes, alternando rolagem, busca, categoria, modo, favorito e abertura/retorno. Registrar latência percebida, long tasks, memória quando disponível, enganos de toque e overflow horizontal.
3. Jogar **dois minutos** em cada um dos seis jogos de referência: Snake, 2048, Memória, Xadrez, Corrida e Futebol. Medir frames/segundo efetivos ou intervalos de frames, atraso de toque e falhas, além de temperatura e consumo observável; anotar ferramenta e limitações.
4. Testar orientação retrato/paisagem, tela cheia nativa e fallback, botão de sair, `Escape` quando houver teclado, volta pelo navegador, foco restaurado, acessibilidade e controles posicionados sem bloquear o tabuleiro.
5. Repetir um roteiro de gesto com dedo real (não `click()` sintético) em 320/390 px, incluindo toque cancelado e retorno ao catálogo com filtros preservados.

## Contrato de estados por jogo

Para cada família, preencher uma matriz com **início → jogando → pausado → retomado → vitória/derrota → reinício**; marcar `não aplicável` apenas com justificativa ligada à regra real. Testar separadamente derrota, vitória, término de tempo e abandono: abandonar não deve contar como vitória nem apagar recordes.

| Estado/transição | Verificação mínima |
| --- | --- |
| Pronto → Jogando | Controles touch/teclado visíveis e ativos, feedback de início, nenhum toque perdido |
| Jogando → Pausado | Física/contador e gestos bloqueados quando pausado; status e foco identificáveis |
| Pausado → Retomado | Continuidade correta, sem movimento fantasma nem dupla contagem |
| Jogando → Vitória | Resultado derivado da regra, anúncio acessível, sessão e recorde coerentes |
| Jogando → Derrota | Causa clara, controles de reinício/retorno acessíveis, sem vitória falsa |
| Final → Reinício | Novo estado limpo sem apagar histórico/recorde, controles funcionais novamente |
| Qualquer estado → Catálogo | Fullscreen e bloqueio de rolagem desativados, posição e filtros restaurados |

Começar pelos seis jogos de referência; expandir para as famílias e depois para todos os IDs em `docs/GAME-INVENTORY.md`. Abertura de rota automatizada **não** equivale a validação de partida completa.

## Critério para declarar a entrega completa

- `quality`, `e2e (chromium)`, `e2e (firefox)`, `e2e (webkit)` e `validate` aprovados **no mesmo HEAD**.
- Zero perda de controles críticos em touch/teclado, fullscreen nativo/fallback e retorno ao catálogo.
- Zero overflow horizontal nos 320/390 CSS px, confirmado em automação **e no Android real**.
- Relatório bruto de benchmark preservado com a versão do código; medições reais de partidas em Android e matriz de estados com evidências.
- Sem regressão no orçamento do shell de 400 KiB raw / 120 KiB gzip, persistência, offline/PWA, foco e `prefers-reduced-motion`.

Não fechar a auditoria enquanto os itens físicos e as partidas completas não tiverem evidência.
