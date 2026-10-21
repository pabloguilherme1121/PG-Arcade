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

## Aceite da expansão local 106–107 (20/10/2026)

A base de 105 jogos foi integrada à main após sucesso dos cinco gates na PR #167. A PR #169 acrescenta Cofre em Equipe (#106) e Passagem Secreta (#107) como jogos realmente locais, sem servidor ou matchmaking:

- Cofre em Equipe: passagem privada de pistas para 2–4 pessoas; senha de quatro dígitos distintos, quatro tentativas, feedback por posição, vitória/derrota e recorde. Verificar que a pista anterior desapareça ao ocultar, filtro de grupo verídico e nenhum modo solo/bot inventado.
- Passagem Secreta: quatro comandos escondidos por participante, decisão simultânea, tabuleiro 5×5 e bloqueio justo de colisões, inclusive cadeias; cristais, empate, reinício e controles acionáveis. Verificar que nunca haja posições ocupadas por mais de um participante.
- Cobertura E2E: 320/390/844×390, navegação, seleção dos participantes, privacidade do passe e ausência de overflow.

A composição anterior passou em quality (497 testes unitários) e mediu 388,7 KiB raw / 113,5 KiB gzip de bundle inicial. **Esse resultado não substitui a verificação do HEAD reconciliado:** exigir quality, Chromium, Firefox, WebKit, validate, CodeQL no mesmo SHA, seguido de pages-artifact e deploy na main. Android físico continua pendente. Os 44 títulos ainda ausentes até 151 são backlog, não cartões implementados.

## Aceite adicional — Contrato das Cores, 108º título

PR nova empilhada sobre #169. Regras de turno 2–4, mercado com três alternativas, contratos públicos iguais para todos, bônus por coleção, quatro escolhas por participante, vencedor/empate, recorde e nova partida; UI responsiva 320/390/844×390 com E2E. Sem multiplayer online. Exigir testes unitários, três navegadores, validate, CodeQL, bundle abaixo 400 KiB raw e 120 KiB gzip no mesmo HEAD, além de deploy e aceite físico por separado. A existência do registro não comprova o aceite até os gates terminarem.

## Aceite adicional — Engrenagens do Tempo, 109º título (draft)

Branch dependente da PR #170. Verificar puzzles determinísticos e solucionáveis nas três dificuldades, 4–6 engrenagens, inversão/desfazer, recorde, modo solo sem prazo ou bot, controles nativos e ausência de overflow em 320/390/844×390. Exigir quality, Chromium, Firefox, WebKit, validate, CodeQL e bundle raw <400 KiB/gzip <120 KiB no mesmo HEAD antes de integrar. O aceite Android físico permanece pendente.


## 110º título — Pontes do Arquipélago (a certificar)

Motor independente: 6, 8 ou 9 ilhas, até duas pontes, detecção de cruzamento, conectividade global, somas por ilha, solução garantida, desfazer, vitória, recorde e teclado/toque. Exigir CI quality, Chromium, Firefox, WebKit, validate, CodeQL, bundle <400 KiB raw / 120 KiB gzip, deploy e QA físico separado. O registro em uma branch não implica aceite nem publicação.


## 111º título — Trilhos Cruzados (a certificar)

Motor real de rota por permutações de três trens, 3/4/5 desvios, alvo gerado por uma sequência solucionável, validação de destino para cada trem, pontuação, feedback, reinício, três dificuldades, toque e teclado. Testes unitários de 180 instâncias de geração e busca de solução; E2E em 320/390/844×390. Publicação requer gates no mesmo HEAD e aceite físico separado.


## 112º título — Ponteiros em Fase (a certificar)

Motor aritmético de relógios com períodos diferentes, solução única até o horizonte do jogo, três dificuldades, avanço e retorno do tempo simulado, desfazer, vitória, recorde, comandos por toque e teclado. Provar por unidade 180 instâncias determinísticas, congruências e solução; E2E 320/390/844×390. Requer gates e publicação no HEAD final da cadeia para confirmar aceite.
