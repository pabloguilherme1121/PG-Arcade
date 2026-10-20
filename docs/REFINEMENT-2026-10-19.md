# Refinamento após a avaliação crítica

Custo obrigatório: R$ 0. Solo/dupla local primeiro; nenhum serviço, SDK de rede ou dependência acrescentado. A main continua com 101 jogos até integrar a expansão, que tem 102 na branch da PR #145.

## Correções e integrações locais

- Palavra em Comum solo: descrições curadas para cada associação tornam a escolha interpretável. A resposta é definida antes da escolha humana. Um misturador dos bits da semente substitui os dois bits baixos do LCG, que produziam somente quatro sequências. Testes cobrem mais de 90 sequências distintas em 100 sementes e pistas para todas as opções do baralho. Isso não é prova de aleatoriedade criptográfica nem equilíbrio humano.
- Dupla/grupo presencial mantém associações livres. O solo não interfere nas respostas locais. Não há cronômetro próprio nem dificuldade por multiplicador de pontos.
- “Repetir os mesmos temas” reinicia o desafio usando a mesma semente, com pontuação zerada. “Jogar novamente” solicita uma nova semente. Resultados permanecem separados das comparações entre formatos, somente na sessão.
- Web Audio fornece um feedback curto opcional, desligado por padrão. Só é criado após ação explícita; pausa/perda de atividade encerra o contexto. API indisponível ou erro de áudio não bloqueia o jogo. Não há arquivos ou requisições de áudio.
- Progresso oferece diagnóstico JSON voluntário. A coleta de tarefas longas começa somente por pedido e pode ser interrompida. Mantém até 128 durações recentes em memória e informa contagem/total; p95 refere-se apenas à amostra recente. Exclui URL, progresso pessoal, identidade e textos de erro. Não há envio ou persistência. Sem suporte à API, o diagnóstico básico continua disponível.
- A busca reutiliza as palavras normalizadas de uma consulta entre os jogos, preservando as regras de acentos, palavras e filtros. O cache de consulta tem uma entrada, não cresce a cada pesquisa.
- Tailwind passa a examinar somente fontes do produto e index.html, excluindo testes. Documentos de auditoria não podem gerar CSS de produção. O bundle inicial passou de aproximadamente 399,8 para 399,6 KiB raw; 117,8 KiB gzip, com limites 400/120 inalterados. A margem continua pequena e exige mais trabalho antes de expansão em massa.
- README atualizado para 102 na branch de expansão. O aceite da PR #146 foi alinhado no commit d853a44: 101 é o baseline de c93b817; novas PRs preservam todos os IDs, URLs e dados e acrescentam evidência para seu novo inventário.
- docs/GAME-QUALITY-ACCEPTANCE.md define a rubrica e o primeiro grupo de referência. Itens humanos/Android não testados ficam explícitos, sem nota inventada.

## Verificação da rodada

444 testes unitários em 62 arquivos aprovados; TypeScript/build e npm audit aprovados, sem vulnerabilidades reportadas. O orçamento inicial passa sem elevar limites.

A varredura Chromium abriu os 102 jogos em 320/390/1280 px sem erro de montagem ou overflow. Os cenários de referência em horizontal também passaram em Chromium/Firefox. Isso não equivale a 102 partidas completas.

A execução final focada aprovou 31 casos E2E em Chromium/Firefox, com um skip previsto de service worker no Firefox. Inclui partidas completas por toque em 320/390/844 px, pistas com pontuação esperada, repetição da semente, teclado/axe/pausa, offline após visita, som opt-in e falha de áudio, exportação sem dados pessoais, coleta controlada, filtros e busca rápida. Sem retries, cliques forçados ou aumento de timeout.

O primeiro teste da coleta tentou produzir uma tarefa longa via avaliação DevTools; o navegador não a registrou como tarefa da página. O teste foi corrigido para executar uma tarefa sintética através de um clique real e aguardar a notificação da API. Esse exercício verifica a integração; não é um resultado de desempenho do produto.

## Medição de desempenho

O benchmark usa cinco amostras por padrão, catálogo em 320/360/390/430 px e seis referências (Snake, 2048, Memória, Xadrez, Corrida, Futebol). A descrição do relatório usa o tamanho real do catálogo. A rodada local coletou vinte amostras de catálogo e trinta de jogos, com 102 cartões e sem overflow do catálogo.

JSON e logs são preservados em /workspace/pg-audit-artifacts/refinement-2026-10-19/. Cada medição deve ser identificada por SHA/estado e hashes de assets. A referência sintética usa Chromium, CPU emulada 4× e cache isolado, sem service worker. Não mede FPS sustentado, INP de campo, consumo ou Android físico. Não atribuir melhora estatística a comparações com relatórios antigos de outros builds e amostras.

## Pendências reais

Integração condicionada aos cinco gates no HEAD final; PR #145 depende da #144. Acesso administrativo à proteção da main e à descrição pública continua bloqueado por HTTP 403 observado anteriormente. Android físico e playtests humanos não foram realizados. Os outros 49 novos candidatos continuam no roadmap: esta entrega refina o primeiro jogo e a base, sem afirmar que cinquenta jogos estão prontos ou que são líderes de mercado.
