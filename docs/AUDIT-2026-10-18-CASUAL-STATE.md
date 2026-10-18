# Estado dos casuais ao mudar a configuração

Base: `bfc7eb2c1f8e74ecf2d5f296579ffdc8187c85f5` (composição da PR #133 sobre a #132 integrada). Esta correção é separada da estabilização dos testes Firefox.

## Falha reproduzida

Ao concluir cinco rodadas de Dados, o jogo mostrava corretamente 525 pontos e a conclusão. Alterar o formato para Maratona mudava o denominador para 15, mas conservava rodada 5, pontos e mensagem de sessão concluída. Alterar a dificuldade conservava o mesmo resumo de outra configuração. O recorde já estava separado corretamente pela #131; o estado da partida não estava.

Dois E2E falharam na base, um para cada seletor. A mudança para Maratona deve preparar rodada 1/15 com zero pontos; trocar dificuldade mantendo Treino deve preparar 1/5 com zero pontos. Em ambos, a interface precisa oferecer iniciar uma nova sessão, sem declarar que a nova configuração foi concluída.

## Correção e estrutura

Uma função local compartilha o reinício entre os dois seletores e o botão de início. Ela limpa início/conclusão, placar, rodada, mensagem e identidade da sessão; ao iniciar, usa a mensagem existente de partida ativa. A identidade usa atualização funcional para que reinícios não dependam de um valor capturado.

Os seletores continuam bloqueados durante a partida. Os oito casuais usam esse componente, portanto recebem a mesma transição. Os recordes versionados e gerais são preservados; nada é apagado ou atribuído a uma dificuldade diferente. Regras, geração aleatória, física, recompensas e durações não mudam.

## Evidência e limites

Os roteiros verificam conclusão real de cinco rodadas, troca de configuração, limpeza do HUD e mensagem, novo início, bloqueio dos seletores, contador inicial de lançamentos, recorde salvo e ausência de overflow em 320/390 px. A suíte dos casuais, a persistência/backup e a pausa da Pesca devem permanecer aprovadas nos três navegadores.

405 testes unitários em 52 arquivos e TypeScript/build aprovados. Build isolada para preservar a outra rodada de E2E em execução; o mesmo verificador de orçamento foi executado sobre sua saída: 398,6 KiB raw / 117,3 KiB gzip, abaixo de 400/120.

A integração exige os cinco gates no HEAD final, com a composição da main conferida. Não há Android físico disponível. Este patch corrige uma transição de interface; não certifica o equilíbrio dos níveis nem partidas completas dos oito títulos em todas as configurações.
