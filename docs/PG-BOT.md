# PG Bot

Mascote dos projetos de Pablo Guilherme: robô compacto de carcaça clara, detalhes azuis e olhos ciano, inspirado na estética do Codex.

## Arquivo e uso

- Arquivo local: `public/brand/pg-bot/mascot.webp`.
- Versão estática, 96 × 112 px, transparente e sem serviços externos.
- Exibir como assinatura discreta com dimensões explícitas e carregamento lazy.
- Quando o nome aparece ao lado, usar `alt=""` para evitar repetição.
- Não substituir o nome, o ícone PWA ou a identidade própria do projeto.
- Não usar animação automática nem sobrepor controles, formulários ou jogos.
- A imagem não representa um serviço de IA. Respostas prontas continuam identificadas como automáticas.

A cartela completa de animações fica no kit do mascote; não é carregada pelo site. Para manter consistência, reutilize o mesmo arquivo em vez de gerar uma nova versão por projeto.


## Suporte integrado nos sites

O PG Arcade e o microsite PG Estratégia incluem o componente estático
`public/brand/pg-bot/support.mjs`, com visual em `support.css` e a imagem
do mascote existente. É um guia por respostas prontas, não um chat com IA nem
um atendimento humano. Não faz requisições externas, não coleta informações,
não altera o progresso e não exige conta ou pagamento.

- No PG Arcade, use "Ajuda do PG Bot" no cabeçalho. O conteúdo fica após a aplicação e não cobre jogos.
- No PG Estratégia, use "Ajuda do PG Bot" no início da página. A dica da partida considera o identificador da missão atual, sem revelar uma solução automática.
- Controles são clicáveis e operáveis por teclado, com foco visível e respostas anunciadas por leitores de tela.
- O service worker do Arcade descobre e protege os assets estáticos. O service worker isolado de Estratégia armazena também os arquivos do bot.
- Verificação: `npm test` e `e2e/pg-bot-support.spec.ts` em Chromium, Firefox e WebKit. Validação Android físico e HTTPS publicado devem ser feitas após merge e deploy.

Não contar as 150 missões da campanha como 150 jogos independentes.
