# Auditoria de Firefox e controles mobile

## Estado e diagnóstico

As PRs #130/#131 estão integradas na base `a2c82c779d24b50812ceea6e20c310c89476b5dc`, com deploy concluído no run 39077102915. A #132 foi revisada e integrada somente após os cinco gates aprovados no HEAD `acc2f35c197bdf0f8d31d857d4aea5d424daaa83`: Chromium 521, Firefox 400 e WebKit 409 cenários aprovados nas respectivas suítes completas; 121/112 skips explícitos em Firefox/WebKit. O merge é `cd112c774a44dfd588be44821cef94a07a4e791c`.

A #133 aumentou o alvo de orientação para pelo menos 44 px, mas seu run 39081374044 falhou em três testes de catálogo no Firefox: capas em 320/390 px e favoritos em 320 px. A suíte terminou com 395 aprovados e 121 skips; Chromium e WebKit passaram. Não se classificou esse resultado como sucesso.

Os traces mostram operações simples de protocolo consumindo aproximadamente 2,4–2,8 segundos cada, inclusive contagem, leitura de atributos e foco. O teste das capas combinava resolução de locator e avaliação dentro de `expect.poll` com prazo de 5 segundos: chamadas intermediárias podiam esgotar o orçamento antes de uma observação útil. Isso não demonstra que o SVG esteja quebrado. No teste de favoritos, as asserções registradas avançaram até a volta ao catálogo, mas o cenário excedeu o prazo total de 90 segundos. O tamanho do catálogo continua relevante; não se afirma ganho de desempenho do produto por mudar o teste.

## Mudança preservando o contrato

A leitura de `naturalWidth > 0` passa a ser repetida dentro do navegador, com `waitForFunction` e os mesmos 5 segundos. Contagem, identidade das capas, fingerprints, gradientes, visibilidade, navegação, controles ampliados e ausência de overflow continuam exigidos.

O cenário de favoritos agrupa prioridades de imagens, apresentação dos metadados, modos e geometria em uma leitura do DOM. Foco real por teclado, clique de favorito, persistência após reload, abertura do jogo e retorno ao catálogo permanecem ações reais. Os valores exigidos e os prazos existentes foram preservados; não foram adicionados retries ou skips.

A composição inclui a #132, evitando certificar a #133 contra uma main antiga. O alvo de orientação mantém a verificação de 44×44 px e overflow em 320/390 px. A correção de safe areas mantém os insets esquerdo/direito independentes e os testes de hit testing da saída.

## Limites da conclusão

Build, orçamento e testes locais não substituem o CI completo no HEAD final. O deploy da composição precisa ser verificado separadamente. Android físico segue indisponível. A presença de modos nos 101 títulos não certifica equilíbrio humano, partidas completas ou ausência absoluta de falhas. O custo dos 101 cartões continua uma pendência medida de desempenho, sem introduzir virtualização que possa prejudicar foco e restauração de rolagem nesta correção.
