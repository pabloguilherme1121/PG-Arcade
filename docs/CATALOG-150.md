# Catálogo de 150 jogos

A expansão adiciona 18 jogos solo por turnos. Cada jogo traz um desafio fixo, instruções próprias, vitória verificável, desfazer, reiniciar e recorde local. Os motores e o CSS da coleção são carregados apenas ao abrir uma partida. Não há bot, cronômetro ou níveis aleatórios nesses títulos.

Lanternas, Hitori, Kakurasu, Acampamento, Termômetros, Aquários, Constelação, Dominosa, Retângulos de Giz, Ilhas de Pedra, Mirantes, Mosaico de Pistas, Trilha da Soma, Medida Exata, Mochila de Expedição, Torre de Panquecas, Travessia dos Sapos e Cofre dos Restos completam os 150 títulos. Os filtros Por turnos e Sem pressa incluem os novos jogos; Por turnos totaliza 96. As 18 capas SVG locais retratam os respectivos tabuleiros ou controles.

A lógica compartilha controles e histórico, mas cada regra de vitória é distinta: iluminação sem conflito; remoção de repetições e conectividade; somas ponderadas; casamento entre árvores e tendas; preenchimento monotônico; nível de água por região; estrelas sem contato; cobertura por dominós únicos; partição retangular; ilhas e mar conectado; visibilidade interrompida; contagem de vizinhança; caminho com grau e soma; transferência de líquidos; otimização de mochila; reversão de prefixos; saltos direcionais; congruências simultâneas.

Validação local: 667 testes unitários; 38 E2Es Chromium/WebKit cobrindo vitórias, desfazer, recarga e telas 320/390/844; 18 auditorias Axe/WCAG em Chromium. Build e orçamento de bundle continuam obrigatórios. Não há medição de FPS em aparelho físico.

A importação de backup passa de 2 para 3 MiB: o cenário existente de 400 dias com 150 contadores em seu máximo seguro produz aproximadamente 2,22 MB de JSON formatado, acima do limite anterior. O teste de ida e volta do calendário foi preservado.
