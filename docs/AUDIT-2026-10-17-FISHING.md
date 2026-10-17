# Auditoria de pausa e retomada — Pesca

Esta correção parte do HEAD `e71b813dd04ec3f99706cf22013eced94554b289` da PR #127 e deve ser integrada depois dela. Não modifica recordes, filtros ou os parâmetros da física.

## Defeito reproduzido

**P1 — retomar alterava a tensão sem avanço do relógio.** O efeito da física dependia de `tick` e `phase`. A mudança de `paused` para `reel` executava novamente `fishingTensionTick` com o tick anterior. Um passo já aplicado era repetido.

Dois E2E falharam antes da correção: depois de um tick real, tensão de 15% e distância de 100%, pausar/retomar fazia a tensão cair para 10% com o relógio congelado. O mesmo ocorreu com pausa manual e com evento sintético `pagehide`. Nos ticks que incluem puxão do peixe, repetir a aplicação também pode penalizar o jogador.

## Correção

Uma referência local registra o último tick de tensão aplicado. O efeito continua observando fase, tick e dificuldade, mas ignora uma repetição do mesmo tick. Um tick novo continua usando a função de física existente. Cada rodada monta uma nova instância de `Fishing`, reinicializando a referência junto com o restante do estado.

Não foram alterados intervalo de 150 ms, recuperação, puxões, dificuldade, duração da mordida, distância, recompensas ou controles. Não há alteração no schema de armazenamento nem nova dependência.

## Evidência

- 400 testes unitários em 52 arquivos aprovados; TypeScript e build Pages aprovados.
- Bundle inicial: 398,9 KiB raw / 117,5 KiB gzip; orçamento 400/120 respeitado.
- 14 cenários Chromium da família casual aprovados, incluindo captura completa e progresso para a rodada seguinte.
- Revisão final: nove E2E aprovados, três por navegador (Chromium, Firefox e WebKit), sem retries. Incluem captura completa e os dois novos roteiros de pausa.
- Três ciclos de pausa/retomada sem avanço da física; nove segundos virtuais pausados não alteram tensão nem distância. O próximo tick efetivo é aplicado uma vez, e o comando de recolher continua funcionando.
- Em 320 px, modo fácil: tensão 15% antes/depois das retomadas e 10% após o próximo tick. Em 390 px, modo difícil: tensão 7% preservada no tick de puxão e 4% após o próximo tick.
- Screenshots finais dos dois tamanhos nos três navegadores preservadas e inspeção visual do HUD efetuada. Ausência de overflow horizontal verificada.

O WebKit local utilizou bibliotecas extraídas e dispensa da validação de requisitos do host; a certificação de integração depende do runner oficial. O evento de ciclo de vida é sintético e o toque é emulado. Android físico permanece indisponível. Estes testes não certificam todas as partidas dos 101 títulos.

## Limites da entrega

A aprovação desta correção exige cinco gates verdes no seu próprio HEAD, além da integração prévia da #127. O teste de pausa em espera já existente não cobria retomada durante o recolhimento: a nova regressão cobre essa transição diretamente. Os estados dos demais motores continuam sujeitos ao protocolo de aceitação por jogo; não se declara ausência absoluta de falhas.
