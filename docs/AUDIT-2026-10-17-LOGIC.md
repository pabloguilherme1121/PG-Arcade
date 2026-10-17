# Auditoria de recordes e descoberta dos jogos de lógica

Base: `13e5c1935497d1593922a713029e03a891e1ae88`, versão publicada e aprovada nos cinco gates. Esta rodada preserva os controles, os motores e os dados anteriores. Não representa certificação de partidas completas dos 101 títulos nem de Android físico.

## Defeitos confirmados

| Prioridade | Reprodução na base | Consequência | Correção |
| --- | --- | --- | --- |
| P1 | Um recorde histórico de 999 no Hanói aparecia ao abrir qualquer dificuldade ou modo | Resultados não comparáveis apresentados como recorde da configuração | Dez jogos da família lógica passam a usar a camada existente `recordsV2`, com dificuldade, modo e sessão na chave |
| P2 | “Contra o bot” devolvia cinco títulos e omitia Nim, Reversi, Pontes e oito jogos estratégicos de tabuleiro | Jogos com adversários implementados ficavam ocultos na descoberta | Separar capacidade de adversário automático da capacidade de dupla local; 16 bots e as mesmas cinco duplas locais |

Os dois cenários E2E falharam antes das correções, pelos valores incorretos de recorde e de quantidade. Três regressões unitárias também falharam na base; a extensão para os oito tabuleiros omitidos teve uma regressão própria reproduzida. Os testes não aumentam timeouts, retries ou skips.

## Compatibilidade e estrutura

- `LogicCollection` reutiliza `useScopedRecord`, já usado por outros motores, evitando outra implementação de persistência.
- Esquema explícito para Sudoku, Nonograma, Labirinto, Sokoban, Hanói, Código Secreto, Nim, Reversi, Batalha Naval e Pontes. Dificuldades 0/1/2; modos livre/série; reverso somente no Nim.
- Chaves e valores antigos continuam preservados e exportados. Nenhum recorde histórico é atribuído retroativamente a uma dificuldade desconhecida.
- Novo recorde compara pontuação somente dentro da mesma chave; importação preserva a melhor marca. Modos ou variantes inexistentes continuam rejeitados antes da importação.
- O progresso mostra dificuldade e modo em português; a interface informa o alcance do recorde.
- Metadados de bots são independentes dos de dupla local. Os oito jogos adicionais são Gomoku, Hex, Ataxx, Isolamento, Breakthrough, Território, Mancala e Chomp; a inspeção do motor e os testes de partidas estratégicas confirmam respostas automáticas do adversário. Contagens, busca e chips de descoberta compartilham `modeTags`; não há uma lista alternativa de resultados na interface.

## Evidência e cobertura

400 testes unitários aprovados em 52 arquivos; TypeScript/build Pages aprovados; `npm audit` sem vulnerabilidades reportadas. Bundle inicial de 398,9 KiB raw / 117,5 KiB gzip, dentro dos limites 400/120, mas com margem pequena.

Na primeira validação Chromium, 17 cenários aprovados: regras dos dez jogos de lógica, filtros em 320/390 px, vitória e troca de configuração, recarregamento, preservação do histórico, exportação/importação e descoberta de bots. O roteiro novo conclui duas partidas reais de Hanói em sete movimentos cada. A imagem do tabuleiro foi inspecionada em 390 px. A certificação de integração exige os cinco gates no HEAD da PR; resultados da base não substituem essa validação.

## Avaliação crítica e próximos limites

| Aspecto | Avaliação sustentada | Limite da evidência |
| --- | --- | --- |
| Regras da família lógica | Há testes de vitória, jogadas inválidas e resultados terminais, além dos novos contratos de recordes | Isto não mede diversão, profundidade de cada nível ou balanceamento por milhares de partidas |
| Adversários | Nim tem estratégia baseada em XOR; Reversi favorece cantos/capturas; Pontes prioriza fechamento e evita terceiras arestas | São heurísticas distintas; dificuldade não equivale a força estratégica certificada |
| Progressão | Dificuldade e série de cinco existem; recordes agora deixam de misturar esses contextos | Outros motores ainda precisam de revisão específica de variantes e conclusões de sessão |
| Descoberta | Bots e dupla local agora representam capacidades diferentes, com interseções e contagens testadas | Não há multiplayer online; não sugerir essa capacidade |
| Estrutura | Persistência, validação e rótulos continuam centralizados; não foi introduzida outra camada de armazenamento | Os grandes módulos por família ainda exigem alterações pequenas, acompanhadas de testes de cada motor |
| Desempenho | Orçamento da build respeitado; linha de base anterior dos 101 cartões preservada | Não se afirma melhoria de FPS nem redução de rolagem por esta alteração |
| Qualidade geral | A cobertura automatizada reduz riscos de regressão | Android físico, partidas completas de todos os IDs e proteção administrativa da main continuam pendentes |

Novos gêneros e mais animações devem aguardar margem maior no shell e validação de controles e estados. A análise dos demais títulos permanece no inventário da auditoria anterior; não foram atribuídas notas de jogabilidade a títulos não jogados nesta rodada. Nenhum resultado justifica declarar o projeto “sem falhas”.
