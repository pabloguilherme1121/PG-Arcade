# Aceite da auditoria #79

## Escopo e evidência de referência — 19/10/2026

Base: `c93b8179d1bfb1e6822b4a577c75d8ee1d1196b3`.
O [run 39163561353](https://github.com/pabloguilherme1121/PG-Arcade/actions/runs/39163561353)
passou quality, Chromium, Firefox, WebKit, validate, pages-artifact e deploy.
Essa evidência vale para a base, não certifica alterações posteriores.

O inventário de referência contém 101 IDs únicos no SHA acima, incluindo
Blocos Infinito (`blocos`). Esse número identifica a base auditada, não um teto
permanente do produto. A expansão autorizada do catálogo adiciona novos jogos
em PRs próprias, preservando todos os IDs, URLs e dados locais da base.

Para integrar a PR #145, atualizar explicitamente o inventário de aceite para
102 IDs únicos, acrescentando `comum`, sem remover os 101 anteriores. As
asserções de contagem, metadados e documentação devem concordar com o HEAD a
integrar. Manter separadas as evidências de QA dos 101 jogos de referência e as
do novo jogo: CI da base não certifica o novo título. Expansões futuras seguem
a mesma regra de inventário versionado e validação no HEAD final.

## Ordem de execução

1. Executar `npm ci`, `npm run audit`, `npm test`, `npm run build` e
   `npm run check:bundle`. Registrar SHA e valores raw/gzip. Preservar limite de
   400 KiB raw / 120 KiB gzip, imports lazy e base path `/PG-Arcade/`.
2. Rodar `mobile-filter-navigation`, `mobile-fullscreen-lifecycle`,
   `mobile-functional` e `catalog-touch-readability` nos três projetos Playwright.
   Cobrir 320/360/390/430 px; manter testes de paisagem em 844×390.
3. Executar `spotlight-touch-discovery` (WebKit 320 px, oito repetições,
   sem retries), `lazy-loading` e `reference-landscape`. Depois executar
   `offline`, `offline-six-references` e `cover-cache-regression` em Chromium;
   respeitar limitações de inspeção de SW dos outros engines.
4. Executar a suíte completa nos três navegadores e confirmar os cinco gates
   no mesmo HEAD. Corrigir a primeira falha reproduzível, sem remover asserções,
   aumentar timeouts ou modificar regras para satisfazer o teste.
5. Coletar baseline nova: `npm run perf:benchmark -- --base-url=<preview>/PG-Arcade/`
   usa cinco amostras por padrão e mede catálogo nas quatro larguras.
   O relatório separa viewport dos jogos e larguras do catálogo; CPU emulada,
   cache frio isolado e intervalos de requestAnimationFrame são diagnósticos,
   não FPS sustentado, INP ou medição de hardware Android. Não inventar limite
   de regressão: definir sobre baseline comparável antes de otimizar.
6. Validar fisicamente Snake, 2048, Memória, Corrida, Xadrez e Futebol; depois
   ampliar por família até cada ID do inventário. Registrar início, interação,
   pausa/retomada quando aplicável, reinício, resultado, recorde e retorno.

## Critérios e registro

Para cada teste guardar: SHA, data, jogo/rota, engine/versão, largura/altura,
entrada, passos, resultado esperado/observado e link de trace ou gravação.
Aprovar somente sem overflow horizontal, perda de controles críticos, mudança
indevida de regra ou persistência, foco perdido no retorno e falha de acesso ao
conteúdo previamente armazenado offline. Manter alternativas de teclado/gesto,
contraste e reduced-motion. Recursos nunca armazenados não são prometidos offline.

Android físico exige modelo, versão Android/Chrome, método, rede, estado térmico,
cinco sessões frias/quentes e dois minutos por referência. Medir tempo até arena
interativa, bytes, long tasks >50 ms, resposta de input e frames; indisponibilidade
de uma métrica deve ser registrada, nunca substituída por estimativa inventada.
Reutilizar a planilha de protocolo Android existente. E2E e emulação não assinam
esse aceite. Pausa/vitória/derrota não aplicáveis devem trazer justificativa.

Governança é tratada na [issue #24](https://github.com/pabloguilherme1121/PG-Arcade/issues/24).
A #79 permanece aberta enquanto faltarem evidências
por jogo/dispositivo; CI verde comprova somente a parte automatizada executada.
