# Contributing

PG Arcade uses a small, test-first workflow.

## Before changing behavior

1. Add or update a focused unit/E2E regression test first.
2. Keep game-engine changes deterministic where possible.
3. Preserve keyboard, touch, 320/390 px mobile layouts, reduced-motion and high-contrast behavior.
4. Avoid coupling unrelated games in the same patch.

## Validation

Use Node.js 24.

```bash
npm ci
npm run audit
npm test
npm run build
npm run check:bundle
npm run test:e2e
```

The GitHub workflow validates Chromium, WebKit and Firefox separately. Do not merge gameplay changes with a failing browser gate.
