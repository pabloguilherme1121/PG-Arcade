# Visual and touch experience

All 101 titles use the shared game surface loaded by SessionChallenge. It adds
dimensional button materials, clear pressed feedback, canvas borders, and direct
selection of Free, Sprint and Marathon sessions. Game-specific board materials
include wooden strategy surfaces, shaded stones for Gomoku/Hex/Ataxx, glass-like
sorting tubes and distinct found-word highlights. Reduced motion and contrast
preferences remain supported. No decorative animation runs continuously.

GameCover loads a local mechanic illustration for every game, with reserved
dimensions and lazy loading in the catalog. Its generation script reuses the
actual board/question snapshots, authored mechanic previews and original scenes.
The 101 SVGs together are approximately 179 KiB before compression.

## Direct gestures

The new useBoardGesture hook supports mouse, pen and touch. Word Search accepts
a segment drag, Match Three accepts a neighboring directional swap, Slide Block
accepts a vehicle swipe, and Maze/Sokoban accept one movement per completed swipe.
Existing taps, buttons, keyboard navigation and undo remain available.

Pointer capture retains input when the pointer leaves a cell. Cancellation and
lost capture never commit a move. A handled touch tap is committed explicitly,
and the compatibility click is suppressed so it cannot double a command.
Word-search selection is previewed while dragging. Inactive gesture handlers must
not swallow clicks in games that do not enable swiping.

The discovery filter "Deslizar na tela" lists only engines with implemented swipe
controls and combines with category, query, favorites and player mode. It survives
navigation and reload using the existing catalog preferences. Balloon popping,
Rhythm and Sudoku are not presented as swipe games.

## Rendering

ActionCollection and MotionExpansion retain fixed-step simulation. Player
position/angle interpolation changes presentation only; it does not change
collisions, scores or game rules. Large position jumps bypass interpolation.
MotionExpansion stops scheduling frames when the game reaches a terminal state.

## Validation and limits

Focused browser checks exercise real Chromium touch input and WebKit pointer
input, cancellation, native taps, undo, single-move scoring and mode locks.
Existing suites cover actual board victories, quiz rounds, casual physics and
records, the 101-game mobile control surface, and Axe accessibility checks.

These are improvements to the existing 2D engines. They do not imply a 3D or
photorealistic remake, physical-device validation, or a published deployment.
