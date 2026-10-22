# Medição de carregamento, DOM e resposta do PG Arcade

## Diagnóstico de E2E no Firefox

A suíte mantém ações, rede, screenshots e fontes nos traces de falha do Firefox,
além do `error-context.md` gerado na falha. Cópias completas do DOM ficam
desativadas nesse navegador: capturar repetidamente as 132 capas SVG pode
dominar o prazo da própria automação. Os testes e suas verificações permanecem
iguais. Para investigar uma falha com snapshots completos em Linux CI:

```bash
CI=1 E2E_FULL_DOM_TRACE=1 npx playwright test e2e/arcade.spec.ts --project=firefox --workers=1
```

Esta instrumentação é **opt-in** e não altera o bundle ou o comportamento dos jogos. Ela usa Chromium automatizado com CPU limitada para gerar **baseline emulada**, não equivalendo a um celular Android intermediário físico.

## Executar

Com dependências e Playwright instalados:

```bash
npm ci
npx playwright install chromium
npm run build
npm run preview -- --port 5173 --strictPort
# Em outro terminal:
node scripts/benchmark-arcade.mjs --base-url=http://127.0.0.1:5173/ --samples=5 --cpu=4 --output=artifacts/arcade-performance.json
```

Os seis jogos de referência são o conjunto padrão: `snake`, `2048`, `memoria`, `xadrez`, `corrida` e `futebol`. Para o catálogo inteiro, use `--all --samples=5`. Para reduzir escopo: `--games=snake,2048`. A página precisa estar servida com o base path correto; ajuste `--base-url` conforme seu `vite.config`.

## Dados coletados

- Quantidade de cards, nós DOM e SVG na abertura do catálogo publicado.
- Por jogo: tempo da navegação até arena e controle presentes (campo visível para as seis referências), quantidade de nós DOM/SVG, recursos carregados, transferência JS/CSS, long tasks observadas, uso estimado do heap quando exposto e overflow horizontal. Isso não comprova interação funcional ou gameplay. Erros de execução invalidam a coleta e encerram o comando sem gravar um novo relatório.
- Percentis p50/p95 e máximos, junto com medições individuais em JSON.
- Contexto novo e Service Worker bloqueado por amostra para isolar carga **fria**. Isso **não** testa cache quente nem comportamento offline; esses têm suites próprias.

## Baseline comparável

Registre SHA do código servido e do instrumento, versão Node/Playwright, sistema e hardware do host, versão Chromium (incluída no JSON), viewport, CPU, URL/base path e condições de rede. Refaça o build e use uma porta exclusiva com `--strictPort`. Execute sem outros testes ou tarefas pesadas, com os mesmos parâmetros e a mesma ordem de jogos. Repita lotes de cinco amostras em arquivos distintos; examine os valores individuais e a variação entre lotes antes de consolidar. Com cinco amostras o p95 é o máximo observado, não uma estimativa estável da cauda.

O catálogo é uma fotografia dos IDs únicos publicados, DOM e SVG na abertura, coletada uma vez por execução e sem CPU limitada; repita os lotes para verificar esses contadores. Não há percentis de carregamento do catálogo, nem garantia de que todas as capas lazy foram carregadas. `--all` mede também a entrada de todas as rotas publicadas, não o carregamento integral das capas.

`routeReadyMs` inclui espera/polling da automação; bytes JS/CSS e long tasks cobrem apenas o intervalo até essa captura, e heap é estimado, não memória isolada de cada motor. O Chromium compartilha o processo entre amostras e a rede não é limitada: contexto frio não significa host/servidor frio. Não compare preview local com produção ou execução em aparelho físico na mesma série. Overflow é apenas horizontal do documento na captura; ausência dele não certifica campo sem recortes. Separe resultados de entrada, gameplay, cache quente e offline.

## Protocolo do aparelho intermediário real

Grave modelo, chipset, RAM, versão Android/Chrome, condição térmica, rede, bateria, modo de energia, commit SHA e número de amostras. Use Chrome DevTools Performance + Performance Monitor via USB ou coleta equivalente para medir INP real, quadros perdidos, memória e consumo durante 2 minutos de gameplay, não somente a entrada na arena. Repita pelo menos cinco vezes por jogo após limpar caches e cinco vezes com cache aquecido. Compare em condições idênticas; a emulação por CPU **não mede temperatura, GPU ou toque físico**.

## Gates de qualidade

Acompanhe evolução por família no inventário `docs/GAME-INVENTORY.md`. Primeiro obtenha uma mediana e p95 estáveis por dispositivo, depois defina limites regressivos; não invente metas de FPS ou tempo sem baseline. Faça sessões completas de iniciar → controlar → pausar → continuar → reiniciar → concluir → persistir recorde → voltar com filtros intactos, além de acessibilidade, modo de movimento reduzido, orientação 320/390/844×390 e PWA offline/reconexão. Smoketests das rotas não certificam regras de todos os jogos.

Não registrar identificadores privados, dados pessoais, conteúdo de localStorage nem rastreamento de usuário no JSON.
