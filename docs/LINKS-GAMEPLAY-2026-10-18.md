# Trilhas Numeradas — 18/10/2026

## Problemas de jogo e mudança

Normal e Avançado tinham os mesmos quatro pares em 4×4. Trocar a pontuação não alterava o desafio. Uma trilha começada também não podia ser retomada após selecionar outro terminal: a casa já preenchida era rejeitada como ocupada.

| Nível | Abertura |
|---|---|
| Iniciante | Quatro pares em 4×4, com quatro trechos começados, editáveis |
| Normal | Quatro pares em 4×4, somente terminais fixos |
| Avançado | Seis pares em 6×6, somente terminais fixos |

As oito simetrias do tabuleiro preservam a legalidade dos caminhos. Há um padrão estrutural por nível, não fases ilimitadas inéditas. A dimensão maior exige preencher mais casas, mas não comprova dificuldade humana superior: variedade e equilíbrio com consumidores continuam pendentes.

Tocar numa ponta preenchida retoma aquela cor, mesmo após trocar de terminal. O meio de uma trilha não é aceito como ponta. Apagar continua disponível, não conta toque numa casa já vazia e preserva terminais. Desfazer ignora seleções e reverte preenchimentos/apagamentos reais.

O seletor fica junto ao tabuleiro, com teclas nativas de teclado e desabilitado durante pausa/finalização. O sexto par tem cor própria e todos os pares conservam identificação numérica. Terminais recebem borda interna distinta. No horizontal, o conjunto de seletor e tabuleiro usa largura limitada para caber na altura de 390 px. O tabuleiro compacto 6×6 em 320 px tem casas menores que 44 px; a opção Ampliar oferece casas de pelo menos 44 px com rolagem interna, sem overflow da página.

## Regras e recordes

A vitória valida todos os pares presentes e exige que cada cor inteira pertença ao componente dos seus dois terminais. O motor anterior podia ignorar uma ilha desconectada da mesma cor; a regressão desse grafo falhou antes da correção. Caminhos com ramificações ou ciclos não são aceitos.

Os resultados novos usam variantes `paths2-0/1/2`, mantendo intactas as chaves anteriores `0/1/2` e o recorde geral legado. O progresso distingue “Trilhas ampliadas” de “Regras anteriores”. A validação de backups aceita ambos os formatos e rejeita variantes desconhecidas; não há reclassificação nem migração destrutiva de dados antigos.

## Evidência

- Testes reproduziram a ausência de níveis distintos, a retomada rejeitada, a ilha aceita como vitória e a rejeição das novas chaves de recorde antes das respectivas correções.
- Um solucionador independente utiliza somente terminais e casas visíveis. Os testes aplicam as soluções pelo motor real nos três níveis e oito orientações.
- E2E joga até a vitória por toque em 320×740 e 390×844 nos três níveis, e em 844×390 no Avançado. Verifica retomada, Desfazer, Apagar, terminais, teclado, pausa, reinício, ampliação, persistência e apresentação de recordes antigos/novos.
- O seletor compartilhado mantém uma regressão do teclado/pausa de Quadrado Mágico.

Resultados finais estão nos artefatos da rodada e na PR. Não houve Android físico nem certificação dos 101 jogos. Integração depende dos cinco gates no HEAD final.

## Intermitência do teste do 2048

A revisão da PR #137 encontrou uma tentativa sem painel inicial no WebKit, seguida de retry aprovado. O teste carregava o catálogo, alterava storage, recarregava o catálogo e só então navegava para o jogo. O fixture agora prepara os dados antes de inicializar a aplicação e abre diretamente 2048, sem mudar timeout ou expectativas de recordes. Uma guarda impede sobrescrever dados gravados ao recarregar. O fluxo revisado passou oito repetições no WebKit; a suíte de três testes passou em Chromium e Firefox. Isso não equivale a provar uma perda de dados do produto: a falha observada era ausência do painel na preparação do teste.
