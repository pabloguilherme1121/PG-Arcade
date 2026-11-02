# PG Bot dos nove jogos clássicos independentes

O PG Bot local acompanha Frota Oculta, Cartas de Cerco, Hex Conexão, Damas Táticas, Patrulha Tática, Muralha das Torres, Fronteira Orbital, Refúgio do Inverno e Mercado de Sombras.

## Mudanças verificáveis

- Painel da arena conserva os três assuntos existentes: Objetivo, Controles e Situação. Acrescenta **Dica de estratégia** com texto próprio para cada uma das nove mecânicas, sem prometer vitória ou acessar informações ocultas.
- Campo de pergunta em português reconhece objetivo, estratégia, controles, situação e funcionamento offline, com normalização de acentos e entrada limitada a 240 caracteres.
- No caso de vitória, derrota e pausa, a resposta prioriza o estado da partida. Se o turno está disponível, é exibido sem inventar valores. Mudar de jogo limpa a pergunta anterior e restaura o assunto inicial.
- O texto da resposta usa `textContent`. O bot não envia perguntas para redes externas, nem grava as perguntas, nem se apresenta como IA generativa. Os recordes continuam usando o mecanismo local preexistente.
- O layout é adaptado para telas estreitas, com botões de área mínima de toque e visibilidade de foco. O service worker tem cache versionado para revalidar os arquivos do bot.

## Testes

O novo teste `scripts/pg-bot-independent-questions.test.mjs` valida dicas distintas nos nove jogos, interpretação de perguntas, contexto de dificuldade, interrupções de partida, entradas inválidas e ausência de HTML. Os testes E2E `e2e/pg-bot-independent-questions.spec.ts` cobrem 320/390px, toque, roteamento, troca de respostas e navegação offline em Chromium, Firefox e WebKit. A validação completa depende de `npm test`, `npm run build`, `npm run check:bundle`, Playwright e gates GitHub Actions.

## Limites

Este módulo é do catálogo clássico de nove jogos e não substitui os PG Bots locais próprios dos outros jogos independentes. Não houve teste em Android físico, nem auditoria de todos os jogos individuais no dispositivo. Nenhuma informação sobre usuários ou placares é enviada ao serviço de chatbot.
