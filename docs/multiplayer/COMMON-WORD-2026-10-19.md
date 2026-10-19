# Palavra em Comum — primeiro jogo da expansão

Escopo confirmado: solo e dupla local primeiro; online depois. Custo financeiro obrigatório R$ 0. Esta branch adiciona um jogo, não cinquenta; o catálogo em desenvolvimento passa a 102 títulos. Publicação depende dos gates e da integração.

## Experiência entregue

Treino solo com bot aleatório identificado ou grupo presencial de 2–4 participantes. Cada pessoa escolhe uma associação; coincidências rendem 100 pontos por outro participante. Vinte temas curados, partidas de 5/10/20 rodadas sem tema repetido dentro da mesma partida. Duração não é anunciada como dificuldade.

No grupo, uma cortina esconde a resposta anterior antes de passar o aparelho. Revelação conjunta, placar acumulado, resultado e nova partida/configuração. As escolhas permanecem no estado do navegador: a cortina oferece privacidade visual, não segurança contra inspeção do aparelho. O bot decide independentemente da escolha humana; não é descrito como inteligência estratégica. Não há cronômetro nem ranking artificial entre sessões de tamanhos distintos.

Pausa manual e por perda de atividade, preservando escolhas; retomada sem pontuação duplicada. Botões nativos, foco de título nas transições, seletores com nomes acessíveis e alvos de pelo menos 44×44 px. Arte SVG original local, sem downloads de terceiros.

## Integração e estrutura

Rota `#/jogar/comum`, catálogo, busca, ajuda, capas e capacidades locais/bot. Metadados públicos e asserts de contagem passam a 102. Os cinco duelos de estratégia anteriores continuam os mesmos; o sexto jogo local é casual, portanto os filtros por categoria preservam cinco resultados em Estratégia e incluem o novo jogo em Casuais.

Jogo e CSS são lazy-loaded. Unidades de recordes foram separadas das instruções; texto de ajuda e apresentação de recordes carregam na tela da partida, com alternativas úteis em falha de chunk. Essa separação evita ultrapassar o orçamento inicial. Os dados de progresso anteriores não são migrados nem reclassificados. Resultados do novo jogo são somente da partida.

## Verificação

- 441 testes unitários em 61 arquivos aprovados, incluindo regras, privacidade da visão por participante, comandos repetidos/atrasados e 100 sementes de baralho.
- TypeScript/build e orçamento aprovados: 399,8 KiB raw / 117,8 KiB gzip; limites 400/120 inalterados.
- Seis testes completos por toque em Chromium/Firefox: 320×740, 390×740 e 844×390; cada teste conclui uma partida de quatro pessoas e uma solo, verifica pausa e nova partida. Total de doze partidas completas nos seis testes.
- Dois testes finais de teclado, alvos mínimos, axe no componente, pausa por evento de atividade, preservação de placar e indicação de resultados locais, em Chromium/Firefox.
- 41 aprovações de regressão/partida na execução ampla, incluindo filtros, bots, recordes legados e offline; houve 3 skips preexistentes de service worker em Firefox. Dois testes de acessibilidade inicialmente falharam por comparar innerText com textContent. A comparação foi corrigida para usar itens de lista de forma consistente; os oito testes finais de jogo/acessibilidade passaram sem retries.
- O novo jogo também carregou e permitiu jogar após reload offline em Chromium, depois de visita e cache confirmados. Isso não promete disponibilidade offline de todos os jogos no primeiro acesso.
- A primeira rodada encontrou seletores de configuração sem rótulo exato identificável. Foram acrescentados nomes acessíveis explícitos e mantidos os timeouts. As partidas finais passaram sem skips, retries ou cliques forçados.
- Captura de 320 px revisada visualmente. Android físico e WebKit local não certificados. Gate WebKit oficial continua obrigatório no HEAD final.

## Dependências de integração

A PR #145 depende da #144. O CI da #144 revelou um teste antigo ainda procurando “Copiar link do jogo”, embora o botão agora se chame “Compartilhar jogo”. A base recebeu a correção no commit f717ed7, preservando a verificação de teclado; o cenário passou em Chromium e Firefox e foi incorporado nesta branch. Os novos gates ainda são necessários; não integrar a expansão sobre gate vermelho. Nenhum fornecedor, pagamento, analytics ou biblioteca de rede foi acrescentado.

Os demais 49 candidatos permanecem no roadmap; não são jogos prontos. Próxima prioridade: prototipar Leilão de Relíquias com solo/local após validar esta entrega. A qualidade de mercado e o interesse dos consumidores precisam de playtests humanos; contagem de testes não comprova diversão ou viralidade.

Verificação após incorporar f717ed7: 441 unitários e 11 cenários E2E integrados aprovados; um skip previsto do service worker em Firefox. Inclui as partidas completas por toque, teclado/axe/pausa, reload offline e a regressão de abertura das utilidades por teclado. Sem retries. Build, orçamento e npm audit aprovados no estado integrado.
