# Features & Changes

## Responsive Design (Feb 2026)

Replaced the fixed 960x540 letterboxed resolution with fully responsive rendering. The game now scales all assets dynamically based on window size, with no black bars or fixed-resolution constraints.

### What changed

- All dimension constants (`W`, `H`, `CX`, `CY`, `S`, `TH`, `PIECE_S`, etc.) converted from fixed values to variables recalculated on every window resize.
- Triangle side length `S` is derived from available viewport space: `Math.min(availableWidth / 7, availableHeight / 11)`, clamped between 30-100px.
- Tray positions, piece sizes, and spacing scale proportionally with the window (`TRAY_WHITE_CX = W * 0.156`, etc.).
- Font sizes throughout (HUD, menus, labels, buttons) scale as percentages of window height.
- G-Frame radii scale with triangle size (`outerR = S * 3.5`, `innerR = S * 2.4`).
- Lobby buttons in `index.html` use a `getButtons()` function for dynamic positioning instead of fixed `const` declarations.
- Background specks count scales with canvas area.
- Applied to both `golden-triangle.html` (hot seat) and `index.html` (online multiplayer).

### Key bug that was fixed

After the initial responsive conversion, both files showed only a blue screen with no game assets. The root cause was **JavaScript temporal dead zone (TDZ) errors**:

1. `resize()` was called at script load time but referenced `specks` (a `const` array) and `TRAY_*` variables (`let` declarations) that were declared further down in the file. In strict mode, accessing `const`/`let` variables before their declaration line throws a `ReferenceError`, silently crashing the entire script.
2. `index.html` additionally had duplicate variable declarations — old `const TRAY_WHITE_CX = 150` lines that conflicted with the new `let` declarations added earlier in the file.

Fix: moved `const specks = []` and `let TRAY_*` declarations above the `resize()` function, and removed the duplicate old declarations.

### Adaptive layout & scaled-up assets (Feb 2026)

Replaced the fixed side-by-side tray layout with an adaptive layout that switches between two modes based on window aspect ratio, maximizing board size at every window dimension.

**Wide mode** (typical desktop windows): Trays in upper-left and upper-right corners beside the board. Board gets the full vertical space. `S` sized from `min(availH / 6.5, W / 15.5)`.

**Narrow mode** (compressed or portrait windows): Both trays side-by-side below the board. `S` sized from `min(availH / 8.24, W * 0.95 / 8)`.

The layout automatically picks whichever mode yields a larger `S`.

**Sizing changes**:
- No upper cap on `S` — the board scales to fill the window.
- Tray pieces: `TRAY_PIECE_S = S * 0.58`, `TRAY_SPACEX = S * 0.75`, `TRAY_SPACEY = S * 0.72`.
- Float label and toast font sizes now scale with `S` instead of being hardcoded 22px/18px.
- Tray label font size coefficient increased from 0.32 to 0.45.
- Applied to both `golden-triangle.html` and `index.html`.
