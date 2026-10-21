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


## 113º título — Cofre de Sombras (a certificar)

Motor real com 3–5 máscaras, rotação de 90 graus, composição por paridade e silhueta 4×4, geração determinística com solução garantida, vitória por igualdade exata, desfazer, teclado/toque, reset, recorde e três dificuldades. Testes de 180 seeds, transições e solução; E2E mobile 320/390/844×390. Exigir gates em HEAD final.


## 114º título — Código de Runas (a certificar)

Substituição monoalfabética de 26 símbolos, dicionário de pistas por dificuldade, tradução parcialmente preenchida, mapeamento sem duplicação, dicas limitadas (máximo duas), tentativas e recorde. Geração determinística, provas de decifrabilidade com 240 combinações nos testes de regras; E2E mobile nos 3 viewports e sem overflow. Gate de qualidade + navegadores + bundle + deploy e Android físico separado.


## 115º título — Fio Condutor (a certificar)

Motor de caminhos ortogonais sem cruzamentos, 2–3 pares e tabuleiros 5×5/6×6/7×7 com caminhos de solução conhecidos; seleção de origem, bloqueio de células ocupadas/obstáculos, reversão de passo, verificação de conexão e vitória completa. Testes unitários de 150 cenários determinísticos e conclusão real, E2E mobile 320/390/844×390, registro lazy e recorde. Exigir gates e deploy do HEAD composto antes da integração.


## 116º título — Enigma das Balanças (a certificar)

Sistema de pesagens de 4/6/8 moedas com exatamente uma falsa mais pesada ou leve, comparações calculadas por massa, grupos obrigatoriamente de tamanho igual, limites 3/4/5, histórico, duas tentativas de acusação, vitória e derrota. Testes unitários de 180 gerações, resultados reais de pesagens, vitória/derrota e tentativas; E2E 320/390/844×390. Validar gates e deploy no HEAD final, Android físico separado.


## 117º título — Cubos Ocultos (a certificar)

Reconstrução 3D por vistas ortográficas reais: tabuleiros 3×3/4×4/5×5, altura máxima 2/3/4, alvo superior com ocupação e projeções frontal/lateral com máximos. Geração determinística a partir de construções solucionáveis, aceitação de qualquer reconstrução que satisfaça todas as vistas, desfazer, vitória e recorde. Testes de 300 sementes, conclusão e imutabilidade; E2E 320/390/844×390. Abertura em draft, sujeito a quality, 3 navegadores, validate, bundle, artifact/deploy e Android físico separado.


## 118º título — Bordas Encantadas (a certificar)

Motor independente de rotação de peças e encaixe ortogonal. Geração de 3×3, 4×4 e 5×5 com solução construtiva e embaralhamento de rotações; paredes fechadas externas, igualdade de cores internas, verificação de todas as conexões e condição de vitória exata. Testes 300 seeds, rotações, solução, undo, integridade; E2E de 320/390/844×390. Exigir gates em HEAD final, CodeQL, bundle, artefato, deploy e Android físico separado.


## 119º título — Coordenadas Perdidas (a certificar)

Motor matemático por distâncias de Manhattan a três pontos. Grades 5×5/7×7/9×9, seleção de casa, pistas de faróis, contagem de candidatos, dicas limitadas, três palpites, vitória e derrota. Gerador determina alvo sem posicioná-lo sobre faróis, com solução única após revelação total. Testes de 360 sementes, prova de unicidade, cálculos, dica e vitória/derrota; Playwright mobile 320/390/844×390 com área rolável acessível de 46 px. Exigir gates completos antes da integração, deploy e QA Android físico separados.


## 120º título — Portas Lógicas (a certificar)

Circuitos booleanos com 1/2/3 portas encadeadas, quatro operações implementadas, inversor de saída, avaliação de quatro entradas binárias e tabela-verdade alvo gerada por solução construtiva não trivial. Testes de 300 seeds, operações booleanas, circuito completo, undo, vitória e reset; E2E mobile 320/390/844×390. Exigir quality, Chromium, Firefox, WebKit, validate, CodeQL, bundle, artifact/deploy no HEAD final. Android físico permanece separado.


## 121º título — Mercadores de Rotas (a certificar)

Economia real de 3 produtos e 4 cidades, compras e vendas com preços e caixa finitos, capacidade máxima de três cargas, rotas de consumo fixo de combustível, reabastecimento, limites de turnos, meta de lucro, estados de vitória/derrota e registro de recordes. Provas de solução por jogadas legítimas em 120 cenários unitários e E2E 320/390/844×390 para negociar, viajar, vender e alterar dificuldade. Exigir quality, Chromium, Firefox, WebKit, validate, CodeQL e bundle raw <400 KiB / gzip <120 KiB antes de integrar.


## 122º título — Defesa de Faróis (a certificar)

Cobertura ortogonal de rotas a raio dois, nove locais possíveis, limite de dois a quatro faróis conforme nível e orçamento de redundância calculado de uma solução construtiva. Vencer apenas cobrindo todos os trechos e respeitando a sobreposição máxima. Testes unitários de 270 mapas com busca da solução real, distância, score, undo e restart; E2E 320/390/844×390 sem overflow, mapa rolável de casas tocáveis. Exigir quality, Chromium/Firefox/WebKit, validate, CodeQL e bundle 400/120 KiB no HEAD final; Android físico separado.


## 123º título — Barcos de Resgate (a certificar)

Planejamento naval com 4 ilhas, 2–4 resgates, capacidade de dois passageiros, 3 estados de maré que alteram custo, combustível finito, reabastecimento na base, limites de turno, vitória/derrota e recorde. Testes unitários de 180 seeds de geração, 150 rotas solucionáveis por movimentos reais, maré e validação de recursos; E2E em 320/390/844×390 testa navegar, resgatar, entregar e não estourar layout. CI completo e validação física Android separados.
