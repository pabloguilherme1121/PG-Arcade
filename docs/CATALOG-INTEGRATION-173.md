# Integração e recertificação do catálogo — issue #173

## Baseline reconciliada em 22/10/2026

A base desta alteração é `ac44c646832e185525efbff3be4c5448e3232384`,
com 150 IDs, após as PRs #198, #199 e #200. Nenhuma das PRs históricas
precisa ser reaplicada. A contagem do catálogo não substitui o aceite das
mecânicas propostas na issue #173.

### Cadeia histórica

```text
105 jogos → #169 (107) → #170 (108) → #171 (109) → #172 (110)
→ #174 (111) → #175 (112) → #176 (113) → #177 (114)
→ #178–#183 (115–120) → #184 (contratos de capas, sem título novo)
→ #185–#196 (121–132)

#197: correção paralela dos lotes de QA, baseada em main
#198: consolidação, merge d76d77a669ad675f7c5afe946a9cb7c4c0a9381a
#199: 18 desafios adicionais, merge ae57f76f6379faa7fc827d7a7b7b942b62c0b461
#200: rota inicial, merge ac44c646832e185525efbff3be4c5448e3232384
```

As bases dos intervalos acima eram sequenciais. #169 e #170 foram integradas;
#171 e #197 aparecem incorporadas pelo merge da consolidação. #172 e
#174–#196 foram encerradas sem merge individual, com trabalho incorporado
pela #198. Reabrir essa pilha pode reintroduzir contratos antigos de contagem
e versões anteriores de testes e motores.

Os HEADs `8e288008` (#176), `145fb966` (#177), `0056e3d9` (#196) e
`9c1d2948` (#198) são ancestrais da baseline, respectivamente 208, 204,
19 e 7 commits atrás dela. São referências históricas, não bases de expansão.

## Contagem e escopo original

Os títulos 111–132 do plano original foram incorporados pela #198.
A #199 acrescentou Jardim de Lanternas, Hitori, Kakurasu, Acampamento,
Termômetros, Aquários, Constelação, Dominosa, Retângulos de Giz, Ilhas de
Pedra, Mirantes, Mosaico de Pistas, Trilha da Soma, Medida Exata, Mochila de
Expedição, Torre de Panquecas, Travessia dos Sapos e Cofre dos Restos.

Esses 18 jogos não entregam automaticamente as mecânicas originalmente
propostas para 133–150. Os itens originais 133–151 permanecem pendentes de
implementação e aceite. Manter o backlog original explícito; não renomear
um motor existente para simular sua entrega. O número 151 do plano original
é um marco do roadmap, não um ID técnico nem uma contagem atual garantida.

## Próximos grupos

1. Recertificar a redução de carga inicial e o contrato de compatibilidade
   desta PR, sem acrescentar títulos. O registro dos jogadores passa a ser
   carregado somente ao abrir uma rota de jogo; os motores e seus IDs são
   preservados.
2. Exigir `quality`, os quatro shards de cada um dos três navegadores,
   `validate` e CodeQL verdes na revisão final. Qualquer novo commit ou
   atualização da base exige evidência correspondente à nova revisão.
   Não aceitar falha, cancelamento ou execução pendente como sucesso.
3. Após integração, confirmar novamente os gates na `main`. Só iniciar a
   próxima PR de expansão após essa baseline verde. Artifact e deploy têm
   sua própria evidência; Android físico continua sendo aceite separado.
4. Implementar uma mecânica original pendente por vez, começando pelo item
   133 (Correio de Drones), em branch nova da `main` certificada. Antes de
   ampliar o lote, demonstrar vitória/derrota, reinício, entradas reais,
   acessibilidade, 320/390/844×390, offline e objetivos materialmente distintos.

## Invariantes verificáveis

- `src/lib/legacyCatalogIds.ts` fixa os 101 IDs de
  `f727889b` (o SHA completo está no próprio arquivo), extraídos do histórico,
  independentemente do catálogo atual. Não regenerar essa lista para acomodar
  uma remoção ou renomeação.
- `catalogCompatibility.test.ts` exige esses IDs uma única vez, igualdade
  entre catálogo e registro de jogadores, e preservação de favoritos,
  visitas, recordes, última rota e calendário histórico no fluxo de importação.
- Motores compartilhados por família continuam permitidos; um registro por
  ID não prova sozinho distinção de mecânica. Revisar regras e objetivos no
  diff de cada título novo.
- Manter o orçamento inicial abaixo de 400 KiB raw / 120 KiB gzip. Não elevar
  limites para acomodar uma expansão.
- O teste de carregamento lazy verifica que o registro e as famílias de
  jogos não são baixados na navegação inicial, e que a família correta é
  carregada ao abrir cada rota. Os testes offline cobrem jogo não armazenado,
  recuperação após reconexão e recarga de jogo previamente armazenado.

## Evidência da baseline anterior

[Run 39837479111](https://github.com/pabloguilherme1121/PG-Arcade/actions/runs/39837479111)
aprovou quality, 12 shards, validate, artifact e deploy em `ac44c646`.
CodeQL também foi aprovado no mesmo SHA. O bundle medido foi
399,9 KiB raw / 117,5 KiB gzip. Essa evidência não certifica commits novos.

Nesta alteração, a medição local após build foi 388,7 KiB raw / 113,6 KiB
gzip, preservando 150 títulos e os limites. A evidência de CI da PR deve ser
consultada antes de integrar; a medição local não comprova publicação.
