# Aceite de qualidade por jogo

Aplicar ao inventário versionado no HEAD em revisão. Os 101 IDs de c93b817 são a base auditada; a PR #145 acrescenta `comum`, sem remover nenhum ID. Custo R$ 0, solo/local primeiro. Este documento define o trabalho, não certifica testes humanos não realizados.

| Dimensão | O que demonstrar |
|---|---|
| Entendimento | Uma pessoa identifica objetivo e primeira ação sem explicação do autor |
| Controle | Toque, teclado, foco e alternativas não perdem ações essenciais |
| Justiça | Regras consistentes, derrota explicável e estados recuperáveis |
| Profundidade | Decisões aprendidas alteram o resultado; dificuldade não é só multiplicador de pontos |
| Variedade | Novas situações jogáveis e reproduzíveis; trocar cor/tema não conta como novo jogo |
| Encerramento | Vitória/derrota/empate, pausa, retomada, reinício e nova partida funcionam |
| Acessibilidade | Nome/estado acessível, contraste, movimento reduzido e alvos críticos de 44 px |
| Desempenho | Medição por cenário/engine/aparelho; sem overflow ou travamento dos controles |

Registrar cada dimensão como aprovado, falhou ou não testado, com SHA, rota, modo, viewport, entrada, passos e evidência. Não calcular nota geral quando houver dimensões não testadas. Uma falha crítica de controle reprova o jogo independentemente de médias. Puzzles sem derrota devem registrar isso explicitamente, sem inventar um estado de game over.

## Primeiras referências

| Jogo | Cobertura automatizada existente | Avaliação humana pendente |
|---|---|---|
| Snake | Regras, reversão, pausa/reinício e layout | Ritmo, leitura de colisão e sessões prolongadas |
| 2048 | Regras, movimentos, desfazer e persistência | Clareza dos movimentos e comparação justa dos modos |
| Memória | Regras, pares e conclusão automatizada | Legibilidade, animações e equilíbrio por tamanho |
| Xadrez | Legalidade, bot e teclado/layout | Força estratégica por nível e entendimento do feedback |
| Corrida | Motor e controle/layout | Física percebida, antecipação e dificuldade justa |
| Futebol | Motor e controle/layout | Trajetória percebida, defesa e resposta ao chute |

A suíte unitária aprovada cobre regras; uma visita à rota não é uma partida completa. A varredura de 102 rotas em 320/390/1280 px detecta regressões de montagem e largura, sem certificar diversão ou física. Testes em horizontal complementam essas verificações. As medições de cinco amostras e CPU emulada são uma referência do runner; não representam Android físico, INP de campo ou FPS sustentado.

Antes de abrir nova onda de jogos, observar 8–12 pessoas como amostra qualitativa inicial e registrar onde não entendem, erram por controle ou abandonam. Não inferir retenção populacional dessa amostra. Android físico está indisponível nesta sessão; esses campos permanecem não testados.

## Política de expansão

Cada novo jogo precisa de regras próprias, controle mobile confortável, tutorial curto, sessão completa e repetição com propósito. No modo solo de Palavra em Comum, pistas substituem a adivinhação de um bot aleatório. Duração 5/10/20 é formato da sessão, não dificuldade de raciocínio. Multiplayer presencial continua por associações livres, com cortina visual e sem alegação de segurança contra inspeção do aparelho.

Não contratar analytics, banco, chat ou multiplayer online. Diagnósticos locais e exportação voluntária não enviam dados e não medem audiência global. Integração somente com quality, Chromium, Firefox, WebKit e validate aprovados no mesmo HEAD. Proteção da main e descrição pública permanecem condicionadas a acesso administrativo, já negado com HTTP 403.
