# PR #5 review — realism and motion

Reviewed base `3e88fa9adcfad717cd1e3ddeb8c232046fd3cc53`, head `3473c279ab228e1c5d92ccfb640faac63c42dd2a`, current main `c1770a57fa182a9f5b916c63a918e79402a68231`.

At review time GitHub reports #5 merged (2026-10-05 01:40 UTC), not open/draft. Final scope: 14 commits, 17 files, +951/-17. The main merge contains the reviewed changes.

## Recommendation

**Adjust.** Preserve the visual improvements and correct the demonstrated gaps in a follow-up PR. No engine rewrite is warranted. Before merge, separating race physics/football timing from shared cosmetic CSS would have made review easier; splitting an already merged PR is unnecessary.

## Findings and fixes

- Canvas decorations ignore reduced motion: `paint` uses elapsed gameplay time for star parallax and runner arm swing regardless of system/saved preference. CSS overrides cannot affect canvas pixels. Pass `useReducedMotion` to rendering, freeze only decorative drift/swing, keep physics and input active. Changes to the preference repaint immediately and refresh the rendering loop.
- Football loses perspective at resolution: the flying SVG scales to `scaleAtGoal`, but the final static SVG has only translation. Retain the scale on the static ball (including reduced-motion shots). Rules, keeper logic, shot timers and selectors are unchanged.
- Racing speedometer is inside `role=status`: its changing text can repeatedly announce speed to screen readers. Restrict live regions to lives and play status; retain readable speed outside them. No control or collision changes.

## Contracts and remaining limits

Chess/checkers rules, worker, legal move generation, gridcells, board selectors and turn handling are not changed by #5. Domino adds `data-domino-face`; handoff and tile selectors remain. Decorative overlays have `pointer-events:none`. Existing E2E covers moves in the original games; the all-games test checks navigation, arena visibility, help, focus, restart and overflow at 390px, not complete gameplay in every game.

Race acceleration is a real gameplay change: starts at 85% of selected speed and reaches 140% after 330 ticks (33 seconds). Existing collision/removal tests remain and unit coverage checks the cap. Difficulty balance and input-to-collision visual alignment are not established by that cap test. Keep these as playtesting concerns rather than rewriting physics without evidence.

Performance: no new dependency, no changed canvas resolution or physics timestep. Added gradients, shadows, filters and animated backdrop blur increase paint/compositing work; nested arena entry animations also exist. Build success and small helpers do not establish frame-rate performance on low-end phones. No FPS/device benchmark was performed; do not claim performance is guaranteed.

## Test coverage / TDD

The original added unit tests check relative football flight duration, positive curve, perspective scaling and race speed growth/cap. They do not test SVG result continuity, canvas reduction, screen-reader announcement frequency or every game mechanic. The E2E race test checks acceleration and overflow; the reduced-motion test covers a 2048 arena/tile, not canvas decoration.

Git history puts the new football/race helper tests and implementations together in `3a97f85`; it does not substantiate the claim those unit tests were written first. Shared CSS motion has a preceding test commit (`03490d3`), but no retained red-run evidence. Do not label all changes proven TDD.

Follow-up E2E adds system/saved reduced-motion canvas behavior while gameplay time advances, football duration/reset/final scale, race announcement isolation, and all 50 arenas at 320px under both reduced-motion preferences. Existing move tests continue to cover chess, checkers and domino.

## Validation evidence

- Reviewed PR head CI: run 37251551711, validate succeeded (unit, build, Chromium/Firefox/WebKit E2E); deploy skipped for PR.
- Baseline and follow-up locally: 123 tests / 17 files passed; TypeScript and production build passed; diff whitespace check passed.
- New E2E is discovered by Playwright. Local browser execution is blocked by missing browser executables; downloading browsers returned invalid ZIP content. This is an environment limitation, not a passed E2E run. Follow-up GitHub CI must validate the new browser tests before integration.
