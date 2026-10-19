# Expansão multiplayer — estado de implementação

## Entrega 1: descoberta e compartilhamento

- `gameCapabilities` centraliza os modos solo, dupla local, bot e gestos.
- Descoberta, rótulos e filtros consomem a mesma origem. Modos desconhecidos são rejeitados; nenhum jogo anuncia suporte online inexistente.
- Compartilhar abre a folha nativa quando disponível; cancelamento não copia o link. Falha/ausência da API tenta clipboard e informa indisponibilidade quando necessário.
- A URL compartilhada tem apenas origem, caminho público e rota do jogo; parâmetros da página não são propagados.
- O botão de compartilhamento é carregado na tela do jogo. Falha no carregamento mostra uma alternativa textual; não bloqueia o motor nem o catálogo.
- Nenhuma biblioteca de servidor, conta, rastreamento ou serviço pago é adicionada ao cliente.

## Sequência da execução

1. Validar esta entrega pelos cinco gates, filtros mobile e offline.
2. Definir o contrato do primeiro jogo e implementar um servidor local autoritativo com sala privada, duas sessões e reconexão. Testar comandos duplicados, acesso indevido, turnos e resultados.
3. Implementar Palavra em Comum como primeiro piloto, com seleção de associações curadas, submissões ocultas até a revelação, pontuação e revanche por consentimento.
4. Medir recursos e custo antes de escolher hospedagem e publicar o backend. Limite mensal obrigatório de R$ 0: sem contratação, cartão, overage automático ou fornecedor pago. Não há fornecedor contratado.
5. Liberar o piloto sob flag e medir conclusão, convites convertidos, reconexão e retorno. Só então implementar os outros quatro pilotos e ondas posteriores do roadmap.

## Critérios do primeiro piloto

Convidado sem cadastro obrigatório, 2–4 participantes, convites não sequenciais e expirados; token privado de reconexão separado do link. Servidor decide ordem, prazo, pontuação e resultado. Cada cliente recebe só as próprias escolhas até a revelação. Comandos têm sequência e são idempotentes. Um resultado é persistido no máximo uma vez.

Lobby → contagem → escolha → revelação → resultado → revanche/encerramento. Dez rodadas de 15 segundos como hipótese inicial, com vocabulário curado. Pontuação: 100 pontos por outro participante que tenha escolhido a mesma associação. Sem bônus por velocidade, para não premiar conexão mais rápida. O jogador pode observar após perder uma rodada por desconexão; retorno depende de snapshot do servidor. A janela pretendida de reconexão é 30 segundos; precisa ser testada.

Uma partida começada mantém o conjunto de participantes: entrada tardia só como espectador sem escolhas privadas. Todos devem confirmar a revanche. Saída do criador não derruba a autoridade do servidor. Sem chat livre, apostas, monetização ou ranking global no piloto.

## Limites conhecidos

Os 50 candidatos do roadmap são backlog, não jogos implementados. As cinco PRs de dependências precisam de revisão própria. Proteção da main exige acesso administrativo não demonstrado nesta sessão. Android físico indisponível; testes automatizados não equivalem a certificação em hardware real. O texto de avaliação do roadmap registra a consulta anterior e números históricos, não resultados novos de build ou gameplay.

## Restrição confirmada: custo financeiro zero

O usuário definiu custo zero em 19/10/2026. Essa restrição prevalece sobre as recomendações iniciais de backend gerenciado e observabilidade SaaS. Colyseus é uma biblioteca candidata, não hospedagem gratuita garantida. Supabase, Sentry e analytics externos não serão provisionados nesta entrega. Não adicionar código de rastreamento nem exigir cadastro para jogar.

Antes de implementar backend de produção, selecionar e testar uma das alternativas: serviço com plano gratuito, sem cartão e bloqueio rígido ao atingir limites; ou conexão entre pares com sinalização gratuita e limitações de conectividade explícitas. Não ativar assinatura ou faixa cobrável. Se nenhuma alternativa suportar o requisito gratuitamente, manter offline/dupla local e registrar a limitação, sem apresentar multiplayer online como implementado.

WebRTC não elimina sinalização e normalmente precisa de STUN; redes restritas podem exigir TURN, cujo tráfego não é gratuito por definição. P2P também transfere confiança ao anfitrião e não oferece sozinho ranking autoritativo. Uma prova de duas pessoas em redes distintas deve preceder adoção. Cinquenta candidatos continuam no backlog por ondas; não há compromisso de disponibilizar 50 filas públicas com infraestrutura gratuita.

## Bloqueio administrativo observado

A tentativa de corrigir a descrição pública via API retornou HTTP 403 (Resource not accessible by integration). Nenhum metadado foi alterado. A proteção da main permanece pendente de acesso administrativo; não foi tentado contornar permissões.

## Verificação local da entrega 1

434 testes unitários em 59 arquivos aprovados. TypeScript/build aprovados. Bundle inicial 399,8 KiB raw / 117,8 KiB gzip, dentro dos limites 400/120. Auditoria npm sem vulnerabilidades reportadas.

Primeira execução Chromium/Firefox: 17 aprovações E2E e 3 skips preexistentes dos cenários de service worker no Firefox. Execução final do compartilhamento, incluindo falha do chunk: 8 aprovações. São 25 execuções aprovadas ao todo, com repetição de cenários, não 25 cenários únicos. Sem retries ou aumento de timeout. Native share/clipboard foram substituídos por adaptadores no E2E para verificar integração, payload e mensagens; isso não certifica a folha do sistema operacional em Android físico.

WebKit depende do gate oficial. A entrega não está certificada no Android real. Não há multiplayer online implementado nem serviços contratados. Integração condicionada aos cinco gates no HEAD final.

## Entrega 2 em desenvolvimento: jogo local completo

O usuário confirmou solo/dupla local primeiro; online depois. Palavra em Comum passa a ter interface e integração de catálogo na branch da PR #145. Nenhum dos outros 49 candidatos foi adicionado. A main só passará a 102 jogos após integração validada. O núcleo anterior já testado é reutilizado, e nenhum fornecedor ou dependência foi acrescentado.

## Refinamento após avaliação crítica

As hipóteses anteriores de rodada online de 15 segundos não descrevem a versão local: ela é sem cronômetro próprio e online permanece adiado. O solo agora exige interpretar pistas, com resposta independente da escolha humana e distribuição que evita o antigo ciclo de quatro rodadas. Há som opcional desligado por padrão.

Diagnóstico voluntário em Progresso coleta apenas durações de tarefas longas, viewport e tempos de navegação quando suportado. Até 128 durações recentes ficam em memória; não há storage persistente ou envio. Exportação exclui URL e progresso pessoal. O usuário pode iniciar, parar e exportar. Sem suporte a longtask, o diagnóstico básico continua disponível. Não interpretar esses números como FPS ou métricas de público.

PR #146 recebeu alinhamento de aceite no commit d853a44: os 101 jogos são a base, não teto; uma expansão deve preservar IDs/URLs/dados e apresentar evidência própria para 102 ou mais jogos. README e metadados da branch de expansão concordam em 102.
