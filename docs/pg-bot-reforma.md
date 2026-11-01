# PG Bot: Arcade e Estratégia (reforma, 2026-11-01)

## Propósito e limites

O PG Bot é uma **ajuda local determinística**, sem API de chatbot, conta, requisição ao servidor ou armazenamento das perguntas. Não promete acesso a estado interno do jogo, não oferece conselhos com garantia de vitória e não se apresenta como IA conectada. O texto é escrito como nós DOM de texto, nunca como HTML recebido do usuário. Entradas são limitadas a 240 caracteres.

## Três pontos de entrada

1. **Arcade, catálogo:** painel recolhível com mascote, perguntas em português, assuntos rápidos e indicação de até três jogos cujos IDs existem no catálogo. Filtra os jogos para dupla pela capacidade real `Dupla local`. Não usa ranking fictício nem popularidade inventada. Carregado sob demanda e com CSS separado; links internos funcionam sem backend.
2. **Arcade, partida:** ajuda existente preservada, inclusive o atalho `Alt+Shift+H`. Mostra orientações do título atual derivadas do registro de instruções por jogo e responde dúvidas sobre objetivo, controles, pausa, progresso, offline e acessibilidade. Trocar de jogo reinicia a resposta do painel para não herdar informações da partida anterior.
3. **Estratégia, 150 missões:** modal existente preservado, incluindo volta do foco ao botão disparador, auxílio sem interromper a arena e 5 assuntos anteriores. Novo assunto `Situação atual` acessa título, turno e progresso **visíveis** na missão aberta. Campo de pergunta usa intents explícitas com tratamento de acentos; dica depende do sistema de regras da missão. Em ausência de missão aberta, responde honestamente que não conhece o turno.

Os jogos independentes possuem seus próprios PG Bots locais e não foram reescritos nesta alteração; a migração de todos para um núcleo único requer revisar regras específicas e testes de cada jogo individualmente.

## Acessibilidade e privacidade

* Botões e campos >=44px onde aplicável, labels visíveis, `role=status` e `aria-live=polite` para respostas, `aria-pressed` nos temas ativos, foco visível e adaptação a 320/390px.
* O modal Estratégia conserva Escape, foco de retorno e a jogada em andamento; o painel do Arcade permanece navegável por teclado e toque.
* Não usa IA generativa ou rede para respostas; `localStorage` do progresso existente permanece intacto.
* Se o chunk do assistente não existir em cache na primeira visita offline, há fallback orientativo e a busca principal continua disponível.

## Qualidade

TDD para parser de perguntas do Estratégia, orientações por jogo e recomendação do catálogo. Casos adversos incluem HTML malicioso, acentos, perguntas sem correspondência, modo dupla, informação contextual ausente e troca de rota. Testes E2E percorrem os três navegadores, larguras 320/390px, teclado, foco de retorno e navegação pelas indicações. `npm test`, `npm run build`, `npm run check:bundle` e CI são gates antes de publicação. Testar Android físico e medir INP/rolagem ainda são pendências separadas.
