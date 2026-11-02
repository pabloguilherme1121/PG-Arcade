# PG Bot dos 27 jogos independentes com página própria

Este complemento mantém o bot original de cada um dos 27 jogos. Adiciona uma pergunta de texto aos três comandos existentes, sem substituir as regras, o estado da partida nem a orientação por jogo.

## Respostas

O campo aceita até 240 caracteres e reconhece perguntas em português sobre **situação da partida**, **estratégia**, **objetivo**, **controles** e **uso offline**. Após identificar o assunto, aciona o botão de ajuda que o jogo já oferece. A resposta vem diretamente do mecanismo original do jogo, inclusive quando o título utiliza nomes de atributos diferentes. Se o assunto não for reconhecido, o bot indica os temas suportados, sem inventar resultados. A pergunta digitada não aparece na resposta.

Não há IA generativa, API paga, transmissão de mensagens, telemetria, nem armazenamento das perguntas. O jogo continua funcionando com os botões antigos, mesmo que a nova interface não seja usada.

## Por que a interface é embutida no HTML

Esses 27 títulos registram **service workers independentes**, limitados a caminhos específicos do próprio jogo. O adaptador pequeno é gerado em cada `index.html` por `node scripts/sync-pg-bot-27.mjs`, a partir de `scripts/pg-bot-inline-bridge.js`. Assim, uma página anteriormente carregada continua oferecendo o campo de pergunta quando é aberta a partir do cache offline, sem acrescentar arquivos externos ou SDKs. O gerador é idempotente, e o teste `pg-bot-inline-bridge.test.mjs` verifica que todos os 27 usam a mesma versão do código.

O adaptador inclui label acessível, envio por Enter, foco visível, resposta com `role=status`, botões e campo com altura mínima de 44px e estilos que se ajustam em telas estreitas. Não altera os motores nem os arquivos de saves.

## Evidências necessárias antes de publicar

Os testes Playwright `e2e/pg-bot-independent-27-ask.spec.ts` cobrem os 27 jogos, perguntas, toque, teclado, entrada hostil, largura de 320px, exemplos de 390px e recarregamento offline em Chromium, Firefox e WebKit. Rodar também `npm test`, `npm run build`, `npm run check:bundle`, os gates oficiais da PR e a auditoria de acessibilidade. Teste em Android físico permanece obrigatório para confirmar comportamento de hardware.
