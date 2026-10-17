# Auditoria de modos, níveis e dificuldade

Base: `73f1dd25bd8f49f0ca62f56467a29152ed2623a2` (PR #128, dependente da #127). Esta rodada melhora a apresentação e a comparação das configurações dos dez jogos de ação, com parâmetros de física preservados.

## Escopo dos 101 jogos

Todos os jogos recebem Livre, Sprint e Maratona pelo `SessionChallenge`. A pressão de tempo é independente da dificuldade interna do motor: Sprint usa 180/120/60 segundos; Maratona usa 600/300/180 segundos. Alterar o relógio não implica alterar adversários, regras ou física.

| Família | Títulos | Configurações internas e estado da revisão |
| --- | ---: | --- |
| Entradas independentes | 23 | Configurações próprias por jogo; recordes específicos já existem em oito títulos. Os demais exigem revisão individual |
| Tabuleiros da primeira expansão | 28 | Três níveis; puzzles gerados e oito adversários estratégicos. A mudança de dificuldade deve ser avaliada por regra, pistas, geração ou decisões do bot, além do tamanho inicial |
| Quizzes | 12 | Três níveis, geração de questões e rodadas; complexidade e diversidade precisam de avaliação por tipo de pergunta |
| Movimento | 10 | Três perfis compartilhados de ritmo, recuperação e precisão; já têm explicação dos parâmetros. Desempenho real ainda requer hardware |
| Lógica | 10 | Três níveis, livre/série e reverso no Nim; a #127 separa recordes por configuração |
| Ação | 10 | Cinco níveis e dois modos internos; perfis centralizados, descrição e recordes específicos nesta rodada |
| Casuais | 8 | Três níveis e formatos de 5/10/15 rodadas; a #128 corrige a retomada da física da Pesca. Comparação entre formatos ainda requer recordes específicos |

O inventário estrutural cobre todos os IDs. A existência de um seletor não prova, sozinha, uma progressão bem calibrada. Não foram atribuídas notas subjetivas nem certificadas partidas completas dos 101 títulos.

## Melhorias nos dez jogos de ação

Quebra-blocos, Pong, Asteroides, Invasores, Runner, Voo, Jetpack, Esquiva, Pouso e Drift usam uma fonte única para vidas, proteção após impacto, pressão inicial, crescimento e abertura dos corredores.

| Nível | Vidas | Proteção após impacto | Pressão inicial | Pressão aos 120 s |
| --- | ---: | ---: | ---: | ---: |
| Fácil | 5 | 1,35 s | 70% | 70% |
| Normal | 3 | 1,10 s | 100% | 112% |
| Difícil | 3 | 0,90 s | 140% | 168% |
| Mestre | 2 | 0,75 s | 158% | 192,76% |
| Especialista | 2 | 0,65 s | 172% | 215% |

A interface explica esses parâmetros e mantém os seletores bloqueados durante a partida e a pausa. Missão mantém objetivo e limite de 180 segundos; Resistência continua sem limite de tempo. As descrições estão associadas aos seletores por `aria-describedby`.

Recordes passam a usar dificuldade, modo interno e sessão na chave versionada. A marca de Missão não compete com Resistência nem com outro nível. O histórico geral permanece intacto. O HUD mostra a marca salva da configuração, evitando apresentar pontos da partida anterior como recorde de outra configuração.

## Decisão de equilíbrio baseada em teste

A leitura inicial da largura dos corredores sugeriu inversão nos níveis superiores. A tentativa de estreitá-los foi rejeitada pelo teste existente de percurso completo de 60 segundos. A geometria anterior foi preservada: 150/125/105/125/125 unidades. Velocidade, vidas e proteção também determinam a dificuldade; avaliar apenas uma dimensão levou a uma conclusão incompleta.

A refatoração final foi comparada diretamente com o motor da base em 100 combinações de jogo, nível e modo. Foram comparados 41.764 passos, com entrada determinística e até 600 frames por combinação: os estados foram idênticos. A suíte também preserva o percurso de 60 segundos do Jetpack nos cinco níveis. Isso demonstra regressão controlada da física, sem certificar equilíbrio humano ou partidas completas das 100 configurações.

## Estrutura e carregamento

A validação e atualização dos recordes permanecem em `scopedRecords.ts`. A formatação dos rótulos foi separada em `scopedRecordLabels.ts`, carregada pela página de progresso. A classificação das famílias continua compartilhada; não foram duplicadas listas de jogos no formatador.

No mesmo ambiente e build Pages, a extração reduziu o bundle inicial da revisão intermediária de 399,3 para **398,5 KiB raw / 117,3 KiB gzip**, abaixo dos limites 400/120. Os rótulos continuam disponíveis ao abrir Progresso. Não se afirma ganho de FPS.

## Verificação e limites

404 testes unitários em 52 arquivos, TypeScript/build e orçamento aprovados; npm audit sem vulnerabilidades reportadas. Os três novos E2E falharam na base: faltavam as descrições e o HUD misturava o histórico com a configuração selecionada. Uma regressão unitária também demonstrou a ausência de suporte aos novos recordes.

Nove execuções dos novos E2E passaram nos três navegadores, sem retries. Cobrem os cinco níveis em 320/390 px, proteção das configurações durante a pausa, reinício, término real de uma partida do Runner, separação de recordes e recarregamento com histórico preservado. A família de ação inteira também passou no roteiro Chromium de início/pausa, junto de controles, combustível e backup.

Um teste inicial congelava o relógio durante o recarregamento e impedia o agendador de concluir o carregamento tardio. O roteiro passou a retomar o relógio antes do reload, depois de encerrar a partida; nenhum timeout ou asserção foi ampliado. As screenshots finais usam a viewport e movimento reduzido para evitar artefatos de captura de elementos fixos fora da área visível.

WebKit local usa bibliotecas extraídas; o runner oficial continua obrigatório. Android físico está indisponível. A integração depende dos cinco gates no HEAD final e da integração prévia das #127/#128. Dificuldades e formatos das demais famílias continuam no roteiro de auditoria; não se declara que todos os níveis estejam calibrados ou que o projeto esteja sem falhas.
