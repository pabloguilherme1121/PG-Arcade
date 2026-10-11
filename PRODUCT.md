# PG Arcade — produto

## Proposta

Escolher uma mecânica reconhecível e começar uma partida no navegador, especialmente no celular. O catálogo conserva 100 jogos, sem cadastro. A primeira tela apresenta seis entradas variadas: Snake, Maré de Cores, Liga 4, Basquete, Palavra Secreta e Pulso Musical. A escolha é editorial, sem inventar popularidade, duração ou dificuldade relativa.

## Jornada

1. Seleção inicial curta, com objetivo e representação específica da mecânica.
2. Quando há dados locais, “Volte a um jogo” apresenta a última entrada visitada e outras mais visitadas. O armazenamento anterior registra contagem e último jogo, não datas: a interface não promete uma linha do tempo completa.
3. Favoritos disponíveis na home e em sua rota própria.
4. Catálogo completo com busca por palavras, acentos e espaços tolerantes; categoria, modo e ordenação combináveis; contagem e recuperação do estado vazio. Carros e Corrida ficam sob “Carros e corrida”, sem mudar categorias ou IDs internos.
5. Partida com título, objetivo, ajuda sob demanda e arena. Favoritar, compartilhar, tela cheia, conforto e reinício com confirmação ficam em “Opções da partida”. As utilidades pausam motores quando esse evento é suportado; continuar depende do controle do jogo.
6. Voltar restaura busca, filtros, ordem e posição da lista. O contexto fica em memória e em sessionStorage com chave própria versionada. Dados inválidos recuperam padrões seguros; armazenamento indisponível preserva a visita atual.

## Verdade de produto e contratos

- “Iniciar nova partida” representa abrir novamente um jogo. Visitas e recordes não são sessões salvas.
- “Solo ou dupla local” aparece somente nos cinco jogos que já oferecem essa opção: Liga 4, Xadrez, Damas, Dominó e Jogo da velha. “Duelo de Frações” continua solo: seu nome não prova multiplayer.
- Controle por teclado e toque indica ações realmente presentes. Controles específicos, gestos e regras permanecem no texto próprio de cada jogo.
- Nenhuma duração aproximada, ranking global, sincronização, conta ou multiplayer online foi acrescentado.
- Recordes, favoritos, backup JSON e preferências mantêm os formatos anteriores. Não há migração destrutiva.
- Regras, física e pontuação permanecem nos motores existentes. Cada ID continua apontando ao mesmo componente/carregamento sob demanda.
- URLs hash e base path do GitHub Pages são preservados. Assets usam `BASE_URL`.
- Offline conserva o contrato existente: shell e recursos já usados/preparados, sem prometer disponibilidade de todas as coleções no primeiro acesso.

## Correções e evidência

| Achado | Mudança | Verificação |
| --- | --- | --- |
| 50 SVGs com dimensão nula na versão publicada | Container de preview deixa de ser grid com padding conflitante; SVG recebe dimensões e proporção explícitas | Regressão de dimensões nos 100 cards em 320/360/390/430/768/1024/1440 px |
| Prévia genérica não revela a mecânica | 50 cenas específicas de tabuleiro, pergunta e movimento; 28 SVGs autorais específicos da primeira expansão | Snapshots de tabuleiros/perguntas derivados dos motores; arquivos locais e fallback textual |
| Arena precedida por camadas de utilidades | Barra curta e opções secundárias, preferências após o conteúdo principal | Teste de teclado/visibilidade de utilidades e amostra de arena |
| Ajuda solo cita adversário | Texto de desfazer depende de jogo estratégico/duelo | Regressão em Maré de Cores e Resta Um |
| Busca perde resultados com espaços repetidos | Busca normalizada por termos em nome, descrição e categoria | Testes unitários e E2E com “CORES maré” |
| Navegação de volta perde posição | Contexto de catálogo em sessionStorage e memória | E2E com filtro, ordem, posição, foco e reload durante a partida |

Inventário individual: [docs/GAME-INVENTORY.md](docs/GAME-INVENTORY.md). A lista é extraída da implementação; uma lista de 100 entradas não substitui verificação profunda das regras e partidas. O relatório de publicação deve registrar separadamente unitários, E2E, CI, merge e versão pública.
