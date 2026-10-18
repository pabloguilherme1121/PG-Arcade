# Pilhas de Cores e Laboratório de Líquidos — 18/10/2026

## Problemas e mudanças

Os três níveis começavam com a mesma configuração de quatro cores e seis recipientes. A pontuação mudava, mas o desafio não. Agora cada nível tem uma abertura própria:

| Nível | Cores | Recipientes | Espaços de manobra |
|---|---:|---:|---|
| Iniciante | 2 | 4 | 2 recipientes vazios |
| Normal | 3 | 5 | 2 recipientes vazios |
| Avançado | 4 | 6 | 2 recipientes vazios |

Cada cor conserva quatro unidades. Pilhas de Cores move uma peça; Laboratório de Líquidos move o bloco de mesma cor do topo, limitado pelo espaço disponível. Não foi introduzido limite de tempo ou de jogadas que penalize quem está aprendendo. A descrição do nível explica a mecânica.

Um solucionador independente por busca em largura encontrou trajetórias mínimas de 8/12/15 transferências para peças e 7/10/13 para líquidos na semente 1. Esses números medem comprimento da solução, não comprovam dificuldade percebida. As sementes permutam a paleta do mesmo padrão por nível: não são fases estruturalmente inéditas. Ampliação da variedade e avaliação com jogadores continuam pendentes.

## Controles e recuperação

- Enter deixa de ser interceptado pelo manipulador de grade e ativa a pilha focada; Espaço e Tab mantêm comportamento nativo.
- `aria-pressed` anuncia a origem selecionada; o grupo identifica que os valores são lidos da base ao topo.
- Um destino cheio ou de cor incompatível mantém a origem selecionada e não consome jogada. A mensagem explica como continuar.
- Tocar na própria origem cancela a seleção, com mensagem explícita.
- Desfazer registra transferências, não seleções ou tentativas rejeitadas. A pausa preserva a seleção; reiniciar restaura a abertura do nível.
- No horizontal de até 480 px de altura, as duas fileiras ficam compactas sem reduzir o alvo de toque de cada recipiente abaixo de 44 px. A área de feedback tem altura mínima reservada no mobile e mensagens mais curtas, evitando saltos do tabuleiro entre seleções. Antes da correção, o tabuleiro excedia a altura útil e uma seleção aumentava a mensagem em 72 px.
- Contagem de recipientes e verificação de vitória usam o tamanho real do estado. Miniaturas estáticas refletem a nova abertura Normal, sem carregar o motor no catálogo inicial.

## Validação

Testes unitários verificam quantidades, conservação de cores, espaços vazios e rejeição sem perda da seleção. Soluções independentes são aplicadas pelo motor real nos três níveis e em quatro sementes para cada jogo. Não se aceitou apenas comparação da pontuação.

Os testes de navegador jogam até a vitória por toque nos três níveis em 320×740 e 390×844, e no Avançado em 844×390, em Chromium, Firefox e WebKit. Também verificam teclado, pausa, seleção após rejeição, Desfazer, reinício, recordes e ausência de overflow horizontal da página. A regressão de Desfazer falhou nos dois jogos antes da correção. Resultados finais são registrados nos artefatos da rodada e na PR.

Não houve avaliação em Android físico. A mudança não certifica os demais jogos nem elimina a necessidade de testes com consumidores. Circuito Único, Trilhas Numeradas e Saída Livre continuam com diferenciação de níveis pendente na auditoria geral. Integração depende dos cinco gates do CI no HEAD final.
