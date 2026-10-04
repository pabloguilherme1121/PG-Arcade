# PG Arcade

Uma pausa. Uma nova jogada.

Oito jogos gratuitos no navegador: 2048, Snake, Memória, Xadrez, Futebol, Dominó, Damas e Jogo da velha.

## Recursos

- Busca por nome e filtros por categoria.
- Favoritos, visitas, último jogo aberto e recordes locais de 2048, Snake e Memória.
- Links diretos para compartilhar jogos, tela cheia quando suportada pelo navegador.
- Teclado, controles de toque e gestos nos novos jogos. Snake pausa ao sair da janela.
- Bots e modos locais dos cinco jogos originais do PG Portfólio.
- Sem conta, publicidade ou envio de dados de partidas a servidores. O progresso não sincroniza entre dispositivos e é perdido ao apagar os dados do navegador.

## Desenvolvimento

Node.js 24. Execute `npm ci`, `npm run dev`. Validação: `npm test`, `npm run build`, `npm run test:e2e`.

GitHub Actions verifica regras e navegação em Chromium, Firefox e WebKit antes de publicar no GitHub Pages. Rotas com hash permitem abrir cada jogo diretamente em hospedagem estática.

## Origem

Os cinco jogos originais foram adaptados de [PG-portfolio](https://github.com/pabloguilherme1121/PG-portfolio), sob licença MIT. Os três novos jogos e o catálogo foram desenvolvidos para este projeto. A ilustração da página inicial foi criada com auxílio de geração de imagem.

Licença MIT.
