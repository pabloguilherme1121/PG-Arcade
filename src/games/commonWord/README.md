# Palavra em Comum — núcleo em desenvolvimento

Primeiro candidato da expansão de 50 jogos. A versão desta branch adiciona o jogo ao catálogo (102 títulos), com interface solo/dupla local. Publicação depende da integração e dos cinco gates. Não há transporte de rede nem hospedagem nova. Custo financeiro obrigatório: R$ 0.

`createDeck(seed)` escolhe dez temas entre vinte, sem repetições. `createMatch` recebe de dois a quatro IDs de participantes. `choose` aceita uma escolha por jogador/rodada; a última escolha revela o resultado. Cada participante recebe 100 pontos por outro participante com a mesma escolha, sem bônus de velocidade. `nextRound` só avança depois da revelação e termina após a última rodada. Uma nova partida começa com pontuação zerada.

`playerView` omite as escolhas alheias antes da revelação e não expõe temas futuros. O estado completo deve permanecer na autoridade da partida; esconder elementos no DOM não protegeria informação em uma implementação online. Este módulo não autentica usuários nem implementa rede, prazo de rodada, desconexão ou consentimento de revanche. Esses controles pertencem à futura camada de sessão e não podem ser anunciados como concluídos.

O usuário confirmou solo e dupla local primeiro. A interface tem treino com bot aleatório identificado e grupo de 2–4 pessoas no mesmo aparelho, cortina de passagem, rodadas de 5/10/20 temas, pausa automática/manual, resultado e nova partida. As escolhas ficam no estado local; a cortina é proteção visual, não segurança contra inspeção do aparelho. Não há cronômetro nem níveis artificiais: a duração muda o número de rodadas, não a dificuldade. Resultados são somente da sessão e não concorrem com recordes globais.

Acessibilidade: controles nativos, nomes explícitos nos seletores, foco no título nas transições e botões de pelo menos 44×44 px. Fonte e layout se adaptam a 320/390 px e orientação horizontal. Solo é treino casual; o maior valor deste jogo é a interação presencial. Não há alegação de equilíbrio humano ou posição de mercado.

Multiplayer online fica para depois, sem contratação de infraestrutura. A validação de rede ainda será necessária antes de anunciar esse modo.

Evidências e limites da rodada atual estão em docs/multiplayer/COMMON-WORD-2026-10-19.md.
