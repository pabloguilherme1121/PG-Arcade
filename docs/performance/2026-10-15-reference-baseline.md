# Referência mobile simulada — 15/10/2026

Fonte: artefato `arcade-reference-performance`, workflow 38719468926, commit `9dcb62c988d6f61471ef55dd622b3255c943e04a` (PR #110).

Chromium 156.0.8078.4, viewport 390×844, CPU simulada 4×, três contextos frios por jogo, service worker bloqueado. Após uma ação definida, coleta de 120 intervalos de requestAnimationFrame.

| Jogo | Carregamento p50 (ms) | Maior carregamento (ms) | DOM | Pior p95 de intervalo RAF (ms) | Frames acima de 50 ms |
|---|---:|---:|---:|---:|---:|
| Snake | 679,9 | 681,9 | 496 | 16,7 | 0 |
| 2048 | 622,3 | 623,8 | 248 | 16,8 | 0 |
| Memória | 613,6 | 633,6 | 283 | 16,7 | 0 |
| Xadrez | 618,4 | 629,7 | 387 | 16,7 | 0 |
| Corrida | 615,0 | 617,0 | 221 | 16,8 | 0 |
| Futebol | 614,4 | 633,6 | 282 | 16,8 | 0 |

Nenhuma das 18 amostras apresentou overflow horizontal. Os cenários e o script estão em `scripts/benchmark-arcade.mjs`; o artefato original inclui métricas de carregamento, tarefas longas e linhas individuais.

Estes números descrevem somente esta execução no runner. Três amostras não estabelecem distribuição populacional ou orçamento de desempenho de produção. RAF após uma ação não mede tempo de GPU, FPS sustentado em partida, bateria ou temperatura; jogos discretos podem estar ociosos e Snake pode encerrar durante a coleta. Os resultados não substituem 60 segundos de jogo, rotação e pausa/retomada em aparelho físico. Ainda falta essa medição em hardware real.
