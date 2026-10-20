# Leilão de Relíquias

Segundo jogo do primeiro lote aprovado da expansão de 50. Solo contra bot, três dificuldades de decisão, ou 2–4 pessoas no mesmo aparelho. Sem rede, contratação ou dependência nova. O catálogo desta branch contém 103 jogos; isso não significa publicação na main.

## Regras

Nove lotes, três de cada família (Solar, Lunar e Marinha), sorteados de 18 peças originais. Cada participante começa com 30 moedas da partida e oferece de zero a dez por lote, limitado ao saldo disponível. Zero é passar. Só o maior lance paga e recebe a peça; se todos passarem, ninguém paga e a peça é descartada. Empates seguem a prioridade anunciada antes do lance, que gira a cada lote a partir da semente.

A coleção soma os valores das peças. Cada trio da mesma família dá oito pontos de bônus. Se sobram duas peças daquela família, dão três; uma peça restante não dá bônus. As peças nunca pertencem a grupos sobrepostos. Depois do nono lote, maior pontuação vence e pontuações iguais empatam. Moedas não usadas não dão pontos. A ordem completa dos lotes restantes é pública e pode ser consultada para planejar orçamento.

## Dificuldades e privacidade

Fácil prioriza o valor básico com lances pequenos; Normal considera ganho de coleção e distribuição do saldo; Difícil também considera a peça que completaria a coleção do oponente. Todos têm as mesmas 30 moedas e limite de dez por lance. O bot calcula seu lance antes da escolha humana; a política usa somente coleções, saldo e lote público, sem ler o lance secreto atual. Não é anunciado como IA infalível nem adversário de nível profissional.

No grupo, a ordem de passagem segue a prioridade. Uma cortina esconde os controles e o lance anterior antes de entregar o aparelho. Os lances são públicos somente na revelação. Isso é privacidade visual, não proteção contra inspeção técnica do aparelho. Não há chat ou dados pessoais livres.

## Estrutura e recuperação

- rules.ts: baralho determinístico, pontuação, comandos imutáveis, resolução, prioridade e políticas do bot.
- savedSession.ts: snapshot de configuração/semente/comandos em chave própria. Expira em sete dias e limita leitura a 16.000 caracteres. Recalcula saldo/coleções pelas regras e rejeita lances ilegais, parciais do bot ou forjados. Não confia em scores, moedas ou peças injetadas no JSON. Não é autenticação ou antifraude online.
- RelicAuction.tsx: interface DOM, alvos de 48 px, foco nas transições, pausa manual/por perda de atividade, passagem de aparelho, resultado e repetição da mesma semente. Salvamento antes do paint; retomada explícita pausada e coberta quando há lance pendente. Armazenamento bloqueado mantém o jogo utilizável e mostra a limitação.
- relicAuction.css e public/covers/leilao.svg: estilos carregados com o jogo e arte local original. Sem loop de animação, timers de dificuldade ou áudio obrigatório.

Resultados são somente da partida, sem misturar recordes de formatos diferentes. Sessões genéricas Sprint/Maratona ficam desativadas neste jogo; os 101 jogos anteriores preservam seus modos. As capacidades reais alimentam filtros e rótulos de solo/dupla/grupo/bot.

## Limites de verificação

Regras e recuperação têm testes unitários, incluindo 100 sementes de baralho e simulações completas. Playwright percorre partidas solo e de quatro pessoas por toque em 320/390/844 px, teclado, axe, pausa, repetição, reload e storage bloqueado. Offline é verificado em Chromium após visita/cache; não se promete todo o catálogo offline no primeiro acesso. Android físico permanece indisponível. Interesse, retenção e qualidade de mercado exigem playtests humanos; não são inferidos de testes automatizados.

Em telas horizontais baixas, o lote, saldo e controles de lance usam duas colunas. O foco anuncia a nova etapa com rolagem imediata previsível; o teste exige que lote, seletor e confirmação permaneçam no viewport em 844×390. A partida completa de quatro pessoas tem 81 toques e 36 seleções nos nove lotes, além de configuração/reinício: seu cenário recebe 60 s no total, com prazo de 2 s por interação e transição. Os demais cenários mantêm o timeout padrão.
