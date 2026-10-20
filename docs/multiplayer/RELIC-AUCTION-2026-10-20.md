# Expansão local — Leilão de Relíquias, 20/10/2026

Escopo confirmado: R$ 0, solo/local primeiro, online depois. Ordem aprovada: Palavra em Comum, Leilão de Relíquias, Cofre em Equipe, Passagem Secreta, Contrato das Cores. Esta entrega adiciona somente o segundo jogo. Dois dos 50 estão implementados em branches de expansão; os outros 48 continuam no backlog. A main consultada ainda tem 101 jogos, enquanto a #158 contém o primeiro e esta branch empilha o segundo, totalizando 103 na composição. Não confundir contagem em desenvolvimento com publicação.

## Experiência e decisões

Jogo original de nove lances secretos com orçamento igual, pares/trios de coleções, possibilidade de passar e prioridade de desempate pública/rotativa. Solo contra bot com três políticas distintas ou grupo de 2–4 pessoas no mesmo aparelho. Dificuldade altera decisões do bot, sem mudar saldo ou exigir reflexos mais rápidos. A política é calculada antes da escolha humana e um teste impede dependência do lance secreto. A lista dos lotes restantes é pública para todos.

Regras, interface e salvamento separados. Comandos repetidos ou atrasados não cobram duas vezes nem avançam lotes. Recuperação reconstrói a partida por comandos válidos, em chave própria e versionada, sem alterar progresso/recordes antigos. Pausa, cortina de privacidade, resultado e revanche pela mesma semente. Áudio/conta/serviço de rede não são requisitos. Arte SVG autoral e CSS sob demanda, sem dependências novas.

## Organização do catálogo

A constante CATALOG_SIZE em src/lib/catalogRelease.ts fixa o contrato da release em 103. Testes e relatório Node 24 importam a mesma expectativa; a renderização continua baseada nos jogos realmente registrados e falha se faltar/duplicar título. O assert não deriva o esperado do próprio DOM. Isso elimina dezenas de contagens duplicadas para as próximas ondas, preservando a exigência de atualizar metadados públicos estáticos e os contratos de capacidades.

Há sete jogos com grupo/dupla local; cinco continuam em Estratégia. O leilão é casual e tem bot efetivo; Palavra em Comum não é anunciado como adversário estratégico. Na interseção de bots e dupla, há seis. Os dois jogos novos não anunciam Sprint/Maratona incompatíveis com seus resultados locais. Os 101 IDs anteriores, motores, rotas e chaves de progresso foram preservados.

## Verificação e achados

- 468 testes unitários em 67 arquivos, incluindo 11 de regras/recuperação do leilão.
- 11 verificações Node do relatório/orçamento; TypeScript/build aprovados.
- Bundle inicial 397,9 KiB raw / 117,9 KiB gzip, teto 400/120 mantido. CSS específico permanece lazy; sem SDK no caminho inicial.
- Seis testes de toque (Chromium/Firefox × 320/390/844) concluem uma partida solo e outra de quatro pessoas cada: doze partidas completas nessas seis execuções.
- Testes de teclado, pausa, alvos mínimos, axe, repetição, retomada sem cobrança duplicada, storage bloqueado e offline com CSS carregado.
- A primeira execução teve oito aprovações e duas falhas de comparação de texto no teste de retomada: innerText versus textContent. A comparação final usa o mesmo método por participante e verifica também o reset da repetição.
- Uma regressão mais ampla teve 28 aprovações, um skip previsto do service worker no Firefox e um timeout em um teste antigo que encadeava dois fluxos de filtro. O trace consumiu cerca de 28 segundos em seleção/reescrita do catálogo antes do próximo fluxo. As jornadas foram separadas mantendo as verificações, teclado/toque reais, traces e timeouts existentes.
- A execução final de jogo e desses dois fluxos passou em 17 E2E, com um skip previsto do service worker/Firefox, sem retries. Captura de 320 px revisada: resultado, preço, lance, saldo e próximo lote legíveis, sem overflow.

A revisão de regras não é uma certificação de diversão, balanceamento por consumidores ou Android físico. O bot é heurístico e não lê decisões privadas; não foi medido contra uma amostra de jogadores reais. A PWA precisa ter armazenado os arquivos antes de ficar offline.

## Integração

Depende da #158 no HEAD 1a0a6dd. Não alterar o HEAD da #158 apenas para acrescentar este jogo: cada entrega recebe sua certificação. Exigir quality, Chromium, Firefox, WebKit, validate e CodeQL no HEAD final da nova PR. Depois da integração validada da base, incorporar a main, retargetar e verificar novamente a composição antes de merge/publicação. Não fechar PRs equivalentes nem integrar branches antigas antes de a composição correspondente estar validada.

O orçamento deixa cerca de 2,1 KiB raw de folga. As próximas ondas exigirão continuar retirando CSS específico da entrada inicial ou reduzir o custo de metadados; não aumentar o limite para anunciar 50 jogos. Nenhum backend, fornecedor pago ou rastreamento foi adicionado. Main sem proteção e Android físico indisponível continuam limitações externas documentadas.

Revisão adicional concluída: 29 E2E de catálogo/regressões aprovados em Chromium/Firefox, um skip previsto do service worker no Firefox, zero retries. Inclui filtros ativos/removíveis, facetas e reload, backups/progresso, estilos de gameplay sob demanda, orçamento de DOM das capas, destaque por modos/visitas, movimento reduzido e o novo leilão offline com CSS confirmado. São execuções parcialmente sobrepostas às anteriores; não somar como casos únicos. Android físico e os gates oficiais do HEAD final permanecem necessários conforme o escopo declarado.
