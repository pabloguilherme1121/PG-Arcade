# PG Arcade — design

## Direção

Uma sala de jogos precisa, com lima para ação e seleção, superfícies escuras de leitura estável e capas que identificam cada jogo e objetivos escritos. A expressão lúdica vem da vitrine e do jogo; a estrutura comum fica compacta. Não há animação contínua de cards ou efeitos que ocultem a partida.

## Tokens e composição

| Uso | Token / valor |
| --- | --- |
| Fundo | `--pg-bg: #080b12`; fundo profundo `#05070c` |
| Texto principal | `--pg-text: #f7f8f3` |
| Texto secundário da reformulação | `#b4c5d0` |
| Ação e foco | `--pg-accent`, `--pg-focus: #c9f65a` |
| Família complementar | azul `#79b8ff`, violeta `#b59cff`, laranja `#ffb46b` |
| Superfície de demonstração | `#11232d`; casa `#233d49` |
| Limites visuais | `#32414a`, `#52616d` |
| Tipografia | Space Grotesk Variable em títulos; Inter Variable em leitura e interface |
| Título da abertura | 36–60 px, altura 1.04, tracking −0.035 em |
| Título de partida | 26–40 px, altura 1.1, tracking −0.03 em |
| Espaço entre seções | `--pg-space-section: clamp(32px,5vw,64px)` |
| Cantos | 14–18 px para shell e vitrine; controles 10 px |
| Foco | 3 px lima, offset 4 px, sem depender só da cor da seleção |
| Toque | 44 px mínimo nas ações comuns; preferência de controles ampliados preservada |
| Grid curado | 3 colunas; 2 abaixo de 768 px; 1 abaixo de 360 px |
| Grid pessoal | 4 colunas; 2 abaixo de 768 px; 1 abaixo de 360 px |
| Breakpoints | 359/767/1024 px, acompanhando o layout existente do catálogo |

O header passa a ocupar seu espaço normal. Âncoras têm scroll margin, foco não fica atrás de cabeçalhos. Browser surfaces recebem seleção lima, caret, scrollbar e sublinhado consistentes. Alto contraste e redução de movimento continuam locais e acessíveis.

## Capas do catálogo

`GameCover.tsx` e `coverArt.ts` geram 100 capas SVG determinísticas a partir dos IDs do catálogo. Elas são usadas nos cards, nas recomendações e no cabeçalho da partida, sem buscar chunks ou imagens externas. Cada instância recebe um ID próprio de gradiente; a arte e sua impressão digital continuam estáveis por jogo. O objetivo permanece em texto junto à capa e na orientação de gameplay.

As demonstrações de `GamePreview.tsx`, `previewSnapshots.ts` e `public/previews/*.svg` da reformulação anterior foram substituídas no catálogo pelas capas completas. Esses arquivos permanecem disponíveis como material de referência e não entram no bundle inicial.

## Manutenção e desempenho

`discovery.css` concentra a nova composição. Seletores antigos exclusivamente ligados a eyebrows e kicker removidos do JSX foram eliminados das camadas anteriores. `fonts.css` inclui apenas os subsets Latin e Latin Extended das fontes já licenciadas/instaladas, suficientes para português e copy matemática; evita distribuir subsets não usados.

As capas não importam os motores nem exigem requisições de preview. Componentes de jogo continuam lazy. Os SVGs inline têm dimensões e proporção reservadas. Orçamento obrigatório permanece 400 KiB raw / 120 KiB gzip para JS+CSS inicial; não foi ampliado para acomodar a reformulação.

## Estados

Links têm nomes de ação; controles favoritos usam `aria-pressed`. Curadoria usa “Começar com”, catálogo usa “Jogar”. Busca vazia orienta e oferece limpar filtros. Utilidades fechadas saem da ordem de Tab nativamente via details. Diálogo de reinício fica no atalho e na ação secundária “Reiniciar com confirmação”, acessível por toque, protegendo o encerramento da sessão; o botão local de cada motor continua como ação principal de reinício.

Contraste e geometria devem ser confirmados no navegador sobre a build final. Testes automatizados não certificam leitura com tecnologia assistiva, todos os cenários de zoom ou todos os resultados de partida; essas verificações devem continuar no processo de publicação.
