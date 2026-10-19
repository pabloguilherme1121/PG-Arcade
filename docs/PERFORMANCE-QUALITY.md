# Observabilidade de desempenho e próximos gates

## O que foi adicionado

- O workflow de publicação mantém sem relaxamento os gates \`quality\`, Chromium, Firefox, WebKit, \`validate\` e o orçamento de 400 KiB raw / 120 KiB gzip para o shell.
- O benchmark existente publica um resumo da rolagem dos **101 cartões** no GitHub Actions; qualquer contagem incorreta ou overflow continua sendo uma falha.
- A comparação com \`docs/performance/catalog-2026-10-17.json\` só estima variação quando versão de Chromium, perfil de CPU e número de amostras são idênticos. Diferenças superiores a 25% são avisos **diagnósticos**, nunca prova de regressão.
- Lighthouse CI mede catálogo e Snake em produção servida localmente pelo Vite com o prefixo \`/PG-Arcade/\`. Salva JSON/HTML em artefato privado da execução do GitHub Actions; não envia relatórios para armazenamento público. As pontuações são avisos iniciais, não checks obrigatórios.

## Comandos

Após \`npm ci\` e \`npm run build\`:

\`\`\`bash
node --test scripts/summarize-performance.test.mjs
npm run preview -- --port 5191 --strictPort
# Em outro terminal:
npm run perf:benchmark -- --base-url=http://127.0.0.1:5191/ --samples=3 --frames=120 --output=artifacts/arcade-performance.json
node scripts/summarize-performance.mjs artifacts/arcade-performance.json docs/performance/catalog-2026-10-17.json
\`\`\`

No GitHub Actions, o preview usa o prefixo \`/PG-Arcade/\`. Os resultados de Lighthouse estão no artefato \`arcade-lighthouse-reports\`, quando gerado. O benchmark JSON fica em \`arcade-reference-performance\`.

## Critério de decisão

1. Confirmar os cinco gates e o orçamento de bundle no **HEAD exato** da PR.
2. Confirmar que os relatórios foram produzidos e que o benchmark ainda mede 101 cartões, sem overflow em 320/390 CSS px.
3. Repetir o benchmark na base e na PR no **mesmo runner, navegador, flags e amostras** antes de afirmar ganho de desempenho.
4. Só então propor mudanças em SVG, CSS ou render incremental — e incluir regressões de foco, scroll restoration, filtros, toque e acessibilidade em 320/360/390/430/844x390.
5. Executar o protocolo de Android físico em \`docs/ANDROID-CATALOG-ACCEPTANCE.md\`, com sessões e partidas reais. Chrome emulado não é validação de hardware.

## Integrações opcionais

PostHog, Sentry e sincronização Supabase **não estão instalados neste PR**. Para não mudar silenciosamente a promessa de ausência de envio de dados das partidas, qualquer telemetria deve ser proposta em PR independente, incluindo:
- finalidade e inventário dos eventos; coleta mínima e sem conteúdo das partidas;
- escolha e informação de privacidade do usuário; retenção, consentimento e desligamento;
- chave pública e host configurados por ambiente, nenhum segredo no repositório;
- carregamento opcional e assíncrono, sem afetar funcionamento offline;
- testes para indisponibilidade da rede e regressões do bundle.

A proteção de \`main\` e required check \`validate\` seguem a issue #24, pois exigem alteração administrativa do repositório.
