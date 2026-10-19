# Palavra em Comum — núcleo em desenvolvimento

Primeiro candidato da expansão de 50 jogos. Ainda não aparece no catálogo e não contém interface, transporte ou hospedagem. O catálogo continua com 101 jogos. Custo financeiro obrigatório: R$ 0.

`createDeck(seed)` escolhe dez temas entre vinte, sem repetições. `createMatch` recebe de dois a quatro IDs de participantes. `choose` aceita uma escolha por jogador/rodada; a última escolha revela o resultado. Cada participante recebe 100 pontos por outro participante com a mesma escolha, sem bônus de velocidade. `nextRound` só avança depois da revelação e termina após a última rodada. Uma nova partida começa com pontuação zerada.

`playerView` omite as escolhas alheias antes da revelação e não expõe temas futuros. O estado completo deve permanecer na autoridade da partida; esconder elementos no DOM não protegeria informação em uma implementação online. Este módulo não autentica usuários nem implementa rede, prazo de rodada, desconexão ou consentimento de revanche. Esses controles pertencem à futura camada de sessão e não podem ser anunciados como concluídos.

A interface será definida conforme a prioridade confirmada pelo usuário: solo/dupla local primeiro ou multiplayer online desde o início. Não substituir uma opção pela outra sem definir essa decisão. Para uma versão online, acesso gratuito e conectividade entre redes distintas ainda precisam de prova; não há serviço contratado.

Validação desta etapa: sete testes de regras/baralho, incluindo 100 sementes reproduzíveis, mais a suíte completa (441 testes aprovados). TypeScript/build e orçamento inicial passaram: 399,8 KiB raw / 117,8 KiB gzip. Como os módulos não são importados pelo app, não há aumento no bundle inicial. Não foi realizada partida de interface nem certificação Android nesta etapa.
