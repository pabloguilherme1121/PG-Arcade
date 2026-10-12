# Medição de carregamento, DOM e resposta do PG Arcade

Esta instrumentação é **opt-in** e não altera o bundle ou o comportamento dos jogos. Ela usa Chromium automatizado com CPU limitada para gerar **baseline emulada**, não equivalendo a um celular Android intermediário físico.

## Executar

Com dependências e Playwright instalados:

```bash
npm ci
npx playwright install chromium
npm run build
npm run preview -- --port 5173
# Em outro terminal:
node scripts/benchmark-arcade.mjs --base-url=http://127.0.0.1:5173/ --samples=5 --cpu=4 --output=artifacts/arcade-performance.json
```

Os seis jogos de referência são o conjunto padrão: `snake`, `2048`, `memoria`, `xadrez`, `corrida` e `futebol`. Para o catálogo inteiro, use `--all --samples=5`. Para reduzir escopo: `--games=snake,2048`. A página precisa estar servida com o base path correto; ajuste `--base-url` conforme seu `vite.config`.

## Dados coletados

- Quantidade de cards, nós DOM e SVG na abertura do catálogo dos 100 jogos.
- Por jogo: tempo da navegação até arena funcional, quantidade de nós DOM/SVG, recursos carregados, transferência JS/CSS, long tasks observadas, uso estimado do heap quando exposto e overflow horizontal.
- Percentis p50/p95 e máximos, junto com medições individuais em JSON.
- Contexto novo e Service Worker bloqueado por amostra para isolar carga **fria**. Isso **não** testa cache quente nem comportamento offline; esses têm suites próprias.

## Protocolo do aparelho intermediário real

Grave modelo, chipset, RAM, versão Android/Chrome, condição térmica, rede, bateria, modo de energia, commit SHA e número de amostras. Use Chrome DevTools Performance + Performance Monitor via USB ou coleta equivalente para medir INP real, quadros perdidos, memória e consumo durante 2 minutos de gameplay, não somente a entrada na arena. Repita pelo menos cinco vezes por jogo após limpar caches e cinco vezes com cache aquecido. Compare em condições idênticas; a emulação por CPU **não mede temperatura, GPU ou toque físico**.

## Gates de qualidade

Acompanhe evolução por família no inventário `docs/GAME-INVENTORY.md`. Primeiro obtenha uma mediana e p95 estáveis por dispositivo, depois defina limites regressivos; não invente metas de FPS ou tempo sem baseline. Faça sessões completas de iniciar → controlar → pausar → continuar → reiniciar → concluir → persistir recorde → voltar com filtros intactos, além de acessibilidade, modo de movimento reduzido, orientação 320/390/844×390 e PWA offline/reconexão. Smoketests das rotas não certificam regras dos 100 jogos.

Não registrar identificadores privados, dados pessoais, conteúdo de localStorage nem rastreamento de usuário no JSON.
