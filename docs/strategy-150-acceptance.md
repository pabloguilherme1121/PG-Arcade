# PG Estratégia — contrato de 150 jogos **independentes**

Este marco transforma a campanha tática em um catálogo de jogos reais. Não confundir **150 missões existentes sobre seis mecânicas compartilhadas** com a meta de **150 títulos estratégicos distintos**.

## Painel de verdade (outubro de 2026)

| Classe | Total | Conta nos 150? |
| --- | ---: | --- |
| Meta | 150 | — |
| Motores novos implementados na PR #213 | 2 candidatos | Ainda não |
| Motores certificados pelo novo contrato | 0 | Sim, quando aprovados |
| Missões da campanha | 150 | Não |
| Jogos antigos classificados como Estratégia no PG Arcade | 47 links | Não, até auditoria individual |

A contagem oficial usa `docs/strategy-verified-registry.json`. O comando `node --test scripts/strategy-registry-contract.test.mjs` rejeita IDs de missões, IDs duplicados, arquivos de motores duplicados, assinaturas de mecânica duplicadas, exportações ausentes, arquivos de testes ausentes e fábricas não determinísticas em todas as dificuldades declaradas. O teste roda junto ao `npm test`.

**Limite do teste:** assinatura de mecânica escrita no JSON não prova, sozinha, diferença de design. A revisão humana precisa comparar ações, recursos, ritmo, adversário e vitória/derrota. Atestado de CI e revisão de UX não são substituídos por metadata.

## Aceite antes de passar de candidato a certificado

1. **Regras originais:** estado, ações, consequências e condições de vitória e derrota próprios; não reutilizar outra engine trocando apenas cor, mapa ou cenário.
2. **Modos e dificuldades diferentes:** ao menos dois modos de partida com mudanças reais de dinâmica, além de no mínimo dois níveis de dificuldade com variação verificável. Modo solo não é obrigatório em títulos cooperativos.
3. **Fluxo inteiro:** iniciar, jogar, pausa (quando aplicável), retomar, reiniciar, ganhar, perder e registrar resultado, sem corrupção de progresso local.
4. **QA de domínio:** determinismo com semente fixa, ações inválidas, invariantes de recursos, limites de turno, adversário, pelo menos uma vitória e uma derrota reproduzíveis por dificuldade.
5. **QA de interface:** teclado e touch 320/390 px, foco visível, sem overflow, acessibilidade, reduced-motion e regressão de navegação PG Estratégia ↔ PG Arcade ↔ portfólio.
6. **Entrega segura:** bundle principal sob **400 KiB raw / 120 KiB gzip**, lazy loading, isolamento de PWA, `quality`, 12 shards Chromium/Firefox/WebKit, `validate` e CodeQL aprovados no SHA final.
7. **Evidências:** registrar commit revisado e verificação no objeto `certification`; revisar a lógica manualmente antes de ajustar `status: certified`. Verificação HTTPS pública e Android físico são aceites posteriores e separados.

## Organização do desenvolvimento

A issue #210 distribui a meta em **10 lotes de até 15 jogos independentes**, por especialidade: tabuleiros, tática, defesa de torres, cidades, economia, RTS, naval, cartas, sobrevivência e cooperação local. Os lotes são **capacidade de planejamento**, não títulos concluídos.

Próxima sequência: finalizar a PR #211 e a #213; acrescentar modos genuinamente diferentes a Frota Oculta e Cartas de Cerco; executar o conjunto completo de QA; certificar individualmente cada motor; auditar os 47 jogos herdados evitando duplicação; produzir de 2 a 5 novos motores por PR. Toda alteração de inventário passa pelo contrato automático.

## Governança

- `candidate` significa código em revisão: não incrementa o placar oficial.
- `certified` exige dois modos, provas de unitários/browser e revisão de código; não usar apenas `merged=true` para atestar qualidade visual/Android.
- Não adicionar entradas placeholder como se fossem jogos jogáveis.
- Não misturar os 150 IDs da campanha nem links ao Arcade com o registro de motores novos.
- O registry é uma auditoria para **jogos novos**. Jogos legados requerem uma análise equivalente antes de integrarem qualquer soma global.
