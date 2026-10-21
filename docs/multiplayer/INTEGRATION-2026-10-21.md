# Integração local e próximos jogos — 21/10/2026

Esta entrega integra localmente a composição da PR #192 (os vinte jogos #109–128) e a PR #184 (correções de capas e acessibilidade), preservando o histórico das branches. Isso não fecha nem faz merge das PRs no GitHub. A API do GitHub recusou consultas REST e GraphQL com `Forbidden`; a leitura Git e a página pública de PRs funcionaram.

## Catálogo disponível nesta composição

128 IDs únicos: os 108 da base, Engrenagens do Tempo, Pontes do Arquipélago, Trilhos Cruzados, Ponteiros em Fase, Cofre de Sombras, Código de Runas, Fio Condutor, Enigma das Balanças, Cubos Ocultos, Bordas Encantadas, Coordenadas Perdidas, Portas Lógicas, Mercadores de Rotas, Defesa de Faróis, Barcos de Resgate, Colheita das Estações, Cartas de Climas, Alquimia de Elementos, Cidade em Miniatura e Zonas de Irrigação. Os novos módulos permanecem carregados sob demanda, com regras e testes próprios.

Melhorias desta integração: busca por nomes populares e IDs, filtro persistente para grupos locais de 3–4 pessoas, painel de ações/resultados mais legível, proteção contra repetição da barra de espaço e atalhos do navegador no Snake, consultas de ocupação do tabuleiro por conjunto e listeners de pausa estáveis durante renderizações. A pausa continua usando o callback da renderização mais recente.

## O plano de cinquenta continua distinto

O roteiro de referência é `ROADMAP-2026-10-19.md`. Seus cinco primeiros candidatos (Palavra em Comum, Leilão de Relíquias, Cofre em Equipe, Passagem Secreta e Contrato das Cores) estão no catálogo. Os 45 candidatos restantes desse roteiro não foram implementados por esta integração. Os vinte jogos acima não devem ser apresentados como conclusão daqueles cinquenta: são títulos diferentes.

A próxima sequência prevista no roteiro é Mercado de Trocas, Ilha dos Recursos, Distrito Compartilhado, Conselho dos Robôs e Constelações em Disputa. Cada entrega precisa de regras próprias, partida concluível, controles acessíveis, testes de resultados/recursos e validação no navegador. Manter custo financeiro zero, solo/local antes de online e o orçamento atual de bundle. Nenhum serviço pago, conta obrigatória ou backend foi contratado.

O roteiro é uma hipótese de jogos originais compartilháveis, não uma pesquisa de popularidade atual. Não há evidência nesta entrega para anunciar “os 50 melhores da atualidade”, viralidade, testes em Android físico ou multiplayer online.

## Evidências locais

- 623 testes unitários em 116 arquivos aprovados após integrar os vinte jogos.
- TypeScript/build e orçamento de bundle aprovados: 396,9 KiB raw / 116,2 KiB gzip na medição da composição.
- 60 testes Chromium dos vinte jogos novos aprovados, em 320, 390 e 844 px, cobrindo interações e layouts.
- Mais 43 testes Chromium de catálogo, ciclo de vida e acessibilidade aprovados após a composição, incluindo duas varreduras de abertura das 128 arenas em 320 px, filtros persistentes, teclado, controles de toque e pausa. Ao todo, 103 testes de navegador aprovados no catálogo integrado.
- Mais 11 testes dos scripts de diagnóstico aprovados; auditoria npm sem vulnerabilidades reportadas.
- Chromium instalado no sistema foi usado com a configuração local ignorada `work/playwright.cloud.config.ts`. As versões oficiais WebKit/Firefox não foram validadas nesta máquina; os gates de CI continuam necessários antes de integrar no GitHub.

Comandos usuais: `npm test`, `npm run build`, `npm run check:bundle` e `npm run test:e2e`. Não aumentar os limites nem remover testes para aprovar a expansão. Abertura das 128 arenas não certifica partidas completas em todos os jogos.
