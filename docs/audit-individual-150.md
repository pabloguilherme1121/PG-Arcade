# Auditoria individual de 150 jogos do PG Arcade

A auditoria é executada separadamente dos gates rápidos e não afrouxa nem substitui testes existentes.

## Execução

```bash
npm ci
npm run test:audit:games
```

Também é executada pelo workflow `Auditoria individual dos 150 jogos` em PRs que modificam sua infraestrutura e semanalmente. O relatório completo fica em `artifacts/individual-150.json`, anexado ao run do GitHub Actions.

## Cobertura exata

Para **cada** um dos 150 IDs oficiais, os dois navegadores Chromium e WebKit:

- Abrem a rota própria do jogo, sem depender de apenas visualizar um cartão do catálogo.
- Verificam que o título corresponde ao registro, que a arena correta carregou e que há pelo menos um controle do motor disponível.
- Executam uma ação no controle próprio do jogo, quando existe botão de ação.
- Rejeitam erros JavaScript visíveis via `pageerror`.
- Inspecionam rolagem horizontal indevida em 390 e 320 pixels CSS.

Há um teste adicional de integridade para exatamente 150 IDs sem duplicação por navegador.

## Resultado da primeira rodada

Em 2 de novembro de 2026, execução local no Windows com Node.js 24: **302 de 302 testes aprovados** (151 por navegador). Nenhuma falha encontrada por esse teste.

## Limitações importantes

Essa auditoria **não prova vitória e derrota em todos os 150 jogos**, não mede latência em um Android real e não comprova todas as combinações de dificuldade, pausa, retomada, modo paisagem, offline e persistência. Os testes de regras e mecânicas específicos continuam sendo necessários. Um controle presente e clicável não equivale a uma partida validada do início ao fim.

Qualquer falha nova deve ser atribuída ao ID do jogo, corrigida com teste de regressão de motor e validada sem aumentar timeouts apenas para esconder erros. Para aprovação em Android físico, seguir o protocolo do PG Bot.
