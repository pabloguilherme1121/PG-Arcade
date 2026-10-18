# Progressão dos puzzles — 18/10/2026

## Problema para quem joga

Oito Rainhas, Quadrado Mágico e Caminho do Cavalo apresentavam Normal/Avançado sem diferença mecânica relevante. Trocar somente a pontuação não cria progressão. Nesta rodada, os níveis alteram a ajuda ou o tamanho do desafio, sem substituir os motores.

| Jogo | Iniciante | Normal | Avançado |
|---|---|---|---|
| Oito Rainhas | 3 rainhas corretas fixas | 1 rainha correta fixa | 8 rainhas a posicionar |
| Quadrado Mágico | 4 números corretos fixos | 2 números corretos fixos | Sem pistas fixas |
| Caminho do Cavalo | 5×5, percurso inicial de 5 casas | 5×5, 25 casas | 6×6, 36 casas |

As pistas respeitam soluções válidas. Simetrias variam a apresentação por semente, preservando regras; não representam níveis ilimitados inéditos. As soluções alternativas de rainhas e quadrado mágico continuam aceitas. No cavalo, trajetórias legais completas garantem continuação dos prefixos iniciais; os testes procuram suas próprias soluções.

## Controles e compreensão

- Rainhas em ataque recebem mensagem explicativa, símbolo e cor; leitores de tela anunciam o conflito. Desfazer recalcula a indicação.
- O seletor numérico do Quadrado Mágico fica junto ao tabuleiro. As dez teclas mantêm ativação nativa pelo teclado e ficam desabilitadas na pausa/finalização.
- No cavalo, o foco ao trocar de nível começa na última casa do percurso inicial.
- O tabuleiro compacto de rainhas/cavalo é limitado a 290 px no horizontal. Durante a validação, o protótipo sem largura explícita encolheu para 121 px e perdeu precisão dos toques. A largura explícita corrige essa regressão; há verificação de geometria e vitória por toque. A opção de ampliar continua disponível: as casas compactas de rainhas em 320 px não têm 44 px.

## Recordes e dados

Os 28 jogos de BoardExpansion passam a registrar resultados V2 por sessão e dificuldade. O recorde geral antigo continua preservado. Importação/exportação valida as novas chaves; não se atribui retroativamente uma dificuldade aos dados antigos. Esta mudança de registro não significa revisão das mecânicas dos outros 25 jogos.

## Validação e limites

Testes unitários verificam a conclusão legal dos três jogos nos três níveis e em 16 sementes por nível. Rainhas e cavalo procuram soluções; o quadrado mágico verifica as pistas contra a solução válida gerada. Testes de navegador usam solucionadores independentes da implementação e executam partidas completas por toque em 320×844 e 390×844 nos três níveis, e em 844×390 no Avançado. Incluem conflitos/desfazer, pausa do seletor, teclado, persistência e separação de recordes e ausência de overflow da página.

Os resultados finais desta rodada estão registrados nos artefatos de auditoria. O CI completo continua obrigatório antes de integração. Não houve teste em Android físico; emulação de toque não certifica latência, ergonomia ou desempenho do aparelho. O equilíbrio de dificuldade exige avaliação com jogadores. Os cinco puzzles ainda sem diferenciação confirmada e os demais motores continuam listados na auditoria geral.
