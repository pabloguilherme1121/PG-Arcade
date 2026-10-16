## O que muda

Descreva o efeito para quem joga e os jogos/áreas afetados.

## Validação

- [ ] Teste/regressão atualizado quando há mudança de comportamento
- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm run check:bundle`
- [ ] Mobile 320/390 px considerado
- [ ] Teclado e touch preservados
- [ ] Reduced-motion e alto contraste preservados
- [ ] Chromium/WebKit/Firefox verdes no **HEAD final** antes do merge
- [ ] `validate` verde no mesmo HEAD, sem jobs ignorados ou falha mascarada por retry
- [ ] Bundle inicial até **400 KiB bruto / 120 KiB gzip** em `npm run check:bundle`
- [ ] Em mudança de gameplay: início, pausa/retomada, reinício e vitória/derrota testados por família
- [ ] Medição em Android real anexada, **ou** declarada pendente conforme `docs/performance/ANDROID-PHYSICAL-QA.md`
- [ ] Publicação da `main` verificada após integração, sem confundir CI da PR com deploy

## Risco

Liste regressões concretas possíveis e como foram cobertas.
