# Validação física Android — PG Arcade

Este protocolo **não é um resultado de teste**. Nenhum Android físico é conectado ao CI. Ele prepara medições reproduzíveis para complementar `scripts/benchmark-arcade.mjs`, que usa Chromium em runner e CPU emulada.

## Preparação (Windows 11 + Android)

1. No Android: habilitar opções do desenvolvedor e **Depuração USB**; autorizar o próprio computador. Usar um navegador Chrome atualizado, bateria em faixa comparável e desativar economia de bateria durante a sessão.
2. No Windows: instalar Android SDK Platform-Tools (`adb`), conectar por cabo de dados e executar `adb devices`. Confirmar **device**, não `unauthorized`.
3. Abrir Chrome no aparelho em `https://pabloguilherme1121.github.io/PG-Arcade/`; no Chrome do computador, abrir `chrome://inspect/#devices` e usar **Inspect** no alvo do aparelho.
4. Usar a aba **Performance** das DevTools para registrar uma navegação e pelo menos **120 segundos de gameplay real**, com interações representativas. Registrar FPS/quedas no painel Frames, tarefas longas, resposta a toque (Event Timing/INP quando disponível), uso de memória e erros de console. Se INP não estiver disponível, escrever **N/D**; não inventar valores.
5. Anotar nível de bateria antes/depois. Temperatura só com sensor confiável exposto pelo sistema: `adb shell dumpsys battery` pode mostrar `temperature` em décimos de °C dependendo do fabricante; registrar **N/D** se não reportado. A medição representa bateria/dispositivo, não temperatura específica da GPU.

## Matriz mínima por jogo

| Jogo | Jornada obrigatória | Estados |
|---|---|---|
| Snake | Mover com touch, curva, colisão, nova partida | Início, execução, pausa, retomada, derrota |
| 2048 | Deslizar em quatro direções, undo e modo difícil | Nova partida, pontuação, game over |
| Memória | Descobrir pares, observar erro, completar grade de 4 pares | Pausa, retomada, vitória, reinício |
| Xadrez | Mover, consultar possibilidades legais, bot e 1v1 local | Captura, navegação e foco |
| Corrida | Acelerar, mudar faixa e sobreviver a obstáculos | Pausa, colisão/derrota, reinício |
| Futebol | Ajustar mira/força, cobrar, defender e repetir | Gol, defesa/erro, nova série |

Testar **320×740**, **390×844** e **844×390 paisagem** quando suportado pelo dispositivo. Em largura diferente de 320/390, anotar a largura real e não substituir a medição por emulação. Por jogo, repetir no mínimo cinco entradas frias e cinco retornos quentes; medir 120 segundos de interação ou documentar por que a partida terminou antes.

## Registro por amostra

| Data/hora | Dispositivo/Android/Chrome | Jogo | Viewport | Cache frio/quente | Pronto (ms) | FPS/quadros perdidos | INP (ms) | Memória (MB) | Bateria antes→depois | Temperatura °C | Erros/overflow |
|---|---|---|---|---|---:|---|---:|---:|---|---:|---|
| _não medido_ | _preencher_ | _preencher_ | _preencher_ | _preencher_ | N/D | N/D | N/D | N/D | N/D | N/D | N/D |

Exportar trace/screenshot por amostra, registrar commit do app e versão do service worker; evitar publicar dados pessoais, IDs de dispositivos, contas ou conteúdo privado do navegador.

## Critérios de auditoria

- Confirmar touch real, controles visíveis e sem deslocamento involuntário de página;
- Não confundir FPS do compositor com intervalo de `requestAnimationFrame` coletado pelo benchmark;
- Comprovar preservação do progresso e retorno ao catálogo em offline já visitado;
- Registrar flakiness (inclusive issue #114) separadamente de regressões estáveis;
- Só marcar **validado em aparelho físico** depois de anexar resultados e evidências reais.
