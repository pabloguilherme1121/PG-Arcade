# Recordes justos nos oito jogos casuais

Base de aplicação: `a19f15c6e9acf16b994b1c9829acf2327e8f6cbc`. Esta mudança inclui os testes de ciclo mobile da PR #130, sem alterar sua implementação.

## Problema confirmado

Vinte e um, Dados, Boliche, Basquete, Golfe, Arco, Pesca e Combina 3 usavam uma marca geral, embora ofereçam três dificuldades e formatos de 5, 10 e 15 rodadas. Mais rodadas permitem acumular mais pontos; comparar esses totais oculta o desempenho da configuração escolhida.

O teste de navegador reproduziu o problema com um histórico de 999: o HUD exibia 999 numa configuração nunca jogada. A regressão unitária também demonstrou que o importador descartava as novas chaves.

## Correção

Os oito títulos reutilizam `useScopedRecord`, com dificuldade, formato interno e modo da sessão externa na chave versionada. Não existe migração arbitrária do histórico geral. A normalização aceita somente as três dificuldades e os três formatos implementados. Rótulos ficam no módulo da página de progresso, carregada sob demanda.

Uma partida de Dados com cinco rodadas determinísticas termina com 525 pontos. O roteiro verifica o resultado real, bloqueio das configurações durante a partida, separação ao mudar formato e dificuldade, persistência após reload e preservação da marca geral 999. O teste antigo de recarregamento agora seleciona novamente a configuração jogada; também exige que a configuração padrão ainda não jogada apresente zero.

As regras, recompensas, motores, temporizadores e probabilidades permanecem iguais. A separação melhora a comparação dos resultados; não demonstra equilíbrio humano dos níveis. A troca de formato após uma sessão concluída ainda conserva o resumo anterior até iniciar uma nova sessão, comportamento fora desta alteração de persistência.

## Validação

405 testes unitários em 52 arquivos, TypeScript, build Pages e orçamento aprovados; npm audit sem vulnerabilidades reportadas. Bundle inicial: 398,6 KiB raw / 117,4 KiB gzip, abaixo de 400/120. A regressão de navegador, a suíte dos jogos casuais e a pausa da Pesca passaram em 45 execuções nos três navegadores, sem retries. O roteiro de persistência também verifica os rótulos na página de progresso e exportação/restauração do backup pela interface. A integração depende dos cinco gates no HEAD final. Android físico indisponível; emulação de toque não substitui essa validação.
