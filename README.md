# PG Arcade

Uma pausa. Uma nova jogada.

Vinte e dois jogos gratuitos no navegador: Sequência de Cores, Palavra Secreta, Rally de Checkpoints, Coleta na Estrada, Defesa Orbital, Campo Minado, Reflexo Rápido, Corrida Turbo, Estacionamento, Alvos Espaciais, Luzes Out, Caça-estrelas, Liga 4, Quebra-cabeça, 2048, Snake, Memória, Xadrez, Futebol, Dominó, Damas e Jogo da velha.

## Recursos

- Busca sem acentos, categorias, favoritos, ordenação por nome/visitas e jogo surpresa dentro dos filtros.
- Ajuda específica, botão para ir ao tabuleiro, modo foco e reinício com confirmação em todos os jogos.
- Visitas, último jogo aberto e recordes locais em dezesseis jogos. Menos jogadas é melhor na Memória e no Quebra-cabeça; os outros recordes usam pontos.
- Corrida: três ritmos, três vidas, setas/A/D, botões de toque, pausa e recorde ao terminar.
- Estacionamento: três trajetos em uma grade, controles de direção e pontuação por movimentos. Luzes Out: três padrões com solução e desfazer.
- Tiro ao alvo com bônus de sequência em 30 segundos; Caça-estrelas em 20 segundos. Toque, clique, números 1–9 e pausa.
- Jogos em tempo real pausam ao sair da janela ou trocar de aba. Pedir reinício também os pausa; cancelar mantém a rodada pausada até escolher Continuar.
- Memória com tempo ajustável para observar cartas diferentes; Quebra-cabeça com modelo opcional; Damas e Xadrez com navegação por setas e Enter.
- Links diretos, tela cheia quando suportada, controle de toque e gestos em 2048/Snake. Os cinco jogos originais conservam bots e modos locais.
- Sem conta, publicidade ou envio de dados das partidas a servidores. Progresso não sincroniza entre dispositivos; limpar os dados do navegador o remove. Trocar de jogo inicia outra partida.

## Desenvolvimento

Node.js 24. Execute `npm ci`, `npm run dev`. Verificação: `npm test`, `npm run build`, `npm run test:e2e`.

GitHub Actions verifica regras e navegação em Chromium, Firefox e WebKit antes de publicar no GitHub Pages. As rotas com hash funcionam em hospedagem estática.

## Origem

Os cinco jogos originais foram adaptados de [PG-portfolio](https://github.com/pabloguilherme1121/PG-portfolio), sob licença MIT. Os dezessete novos jogos e o catálogo foram desenvolvidos para este projeto. A ilustração inicial foi criada com auxílio de geração de imagem.

Licença MIT.

## Visual e integração

Arte original gerada para carros, nave, asfalto e espaço; assets WebP locais, sem dependência externa. Tabuleiros recebem profundidade e contraste, preservando formas/números acessíveis. O portfólio oferece acesso ao catálogo completo e o Arcade retorna ao portfólio.
