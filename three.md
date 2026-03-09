# Three-Player Mode — Implementation Notes

## Overview

Three-player mode was added to both `golden-triangle.html` (hot seat / vs CPU) and `index.html` (online multiplayer). A third player — **Gold** — joins White and Black. 3P games always use a random 31-slot map, run for 3 rounds, and rotate the starting player each round.

---

## Gold Player Colors

Defined in the `COL` object in both files:

| Property | Value | Purpose |
|----------|-------|---------|
| `goldPlayer` | `#A48030` | Piece base fill |
| `goldPlayerHi` | `#C4A058` | Piece bevel highlight |
| `goldPlayerSh` | `#6A4A12` | Piece bevel shadow |
| `goldPlayerLabel` | `#E7D08A` | Number label on pieces / HUD score text |

---

## State Changes (`freshState()`)

New and modified fields:

- **`numPlayers`** (default `2`) — set to `3` when the player selects 3-player mode.
- **`goldPieces`** — `Array.from({length:10}, (_, i) => ({value: i+1, used: false}))`, same structure as `whitePieces` / `blackPieces`.
- **`scores`** / **`roundScores`** — expanded to `[0, 0, 0]` after 3P is selected.
- **`board`** — resized to `new Array(31).fill(null)` at match start for 3P.
- **`slotAnim`** — resized to 31 entries for 3P.

In `golden-triangle.html`, the initial phase is `"playerCountSelect"`.
In `index.html`, the initial phase remains `"lobby"` (with splash/boot preceding it).

---

## Helper Functions

Added to both files:

```javascript
getPiecesForOwner(owner)   // Returns whitePieces, blackPieces, or goldPieces
getPieceColors(owner)      // Returns {base, hi, sh, label} color object
getPlayerName(playerIdx)   // Returns "White", "Black", "Gold" (or "CPU"/"CPU 2")
```

These replace all hardcoded owner checks (`owner === 0 ? ... : ...`) throughout the codebase.

---

## Player Count Selection Menu

### golden-triangle.html

- Phase: `"playerCountSelect"` (entry point for all games)
- Drawing: `drawPlayerCountSelect()` — two large buttons ("2 PLAYERS" / "3 PLAYERS") plus a back button
- 2P button: dusty rose (`#C47878`), subtitle "CLASSIC DUEL"
- 3P button: warm amber (`#C4A068`), subtitle "RANDOM MAP • 3 ROUNDS"
- Click: sets `numPlayers`, then proceeds to `difficultySelect` (CPU) or `mapSelect` (hot seat). 3P auto-sets `mapType = "random"`.
- Hover states: `hover2P`, `hover3P`, `hoverCountBack`

### index.html

- Phase: `"playerCountSelect"` (inserted after "Create game" click, before mode selection)
- Drawing: `drawPlayerCountSelect()` — same visual style as golden-triangle.html
- Button definitions: `BTN_2P`, `BTN_3P`, `BTN_BACK_COUNT` in `getButtons()`
- Flow: lobby → playerCountSelect → modeSelection → mapSelection (2P) or createRoom (3P skips map select)
- Back from modeSelection returns to playerCountSelect (not lobby)
- Escape key handles back navigation through all menu layers

---

## Tray Layout (3-Player)

White and black trays stay in their original 2P positions. The gold tray is placed underneath the white tray. If the gold tray would overlap the board, it falls back to underneath the black tray.

### Wide layout (`is3P && useWide`)

- White: left side (`sideMargin / 2 + 12`)
- Black: right side (`W - sideMargin / 2 - 12`)
- Gold: same X as white, Y offset by `TRAY_SPACEY * 2.8`
- Overlap check: if `goldTrayRight > boardLeft`, gold moves under black

### Narrow layout (`is3P && !useWide`)

- White: `CX - S * 2.2`
- Black: `CX + S * 2.2`
- Gold: same X as white, Y offset by `TRAY_SPACEY * 2.5`

---

## Tray Labels

Labels above each tray read **"WHITE"**, **"BLACK"**, **"GOLD"** (all caps, VCR OSD Mono font). When it is that player's turn, the label pulses (alpha oscillates 0.45–1.0 over ~2.5s cycle). The label color stays constant — it does not change to scarlet. This applies in all modes including vs CPU.

---

## HUD

The top bar contains three elements on the same baseline (`topY = margin + bezelPad`):

- **Top left**: `ROUND X/N` (where N = `numPlayers`)
- **Top center**: `"WHITE TO PLAY"` / `"BLACK TO PLAY"` / `"GOLD TO PLAY"` in scarlet red, VCR font, 25% larger than tray labels
- **Top right**: Score stack — `WHITE: N`, `BLACK: N`, and (for 3P) `GOLD: N`

Score labels always say WHITE/BLACK/GOLD regardless of CPU mode.

---

## Turn Logic

Turn rotation uses modular arithmetic:

```javascript
state.currentPlayer = (state.currentPlayer + 1) % state.numPlayers;
```

Total placements per round: `numPlayers * 10` (20 for 2P, 30 for 3P).

---

## Round System

- Number of rounds equals `numPlayers` (2 rounds for 2P, 3 rounds for 3P).
- Starting player rotates each round: `(firstPlayer + round - 1) % numPlayers`.
- `firstPlayer` is chosen randomly at match start: `Math.floor(Math.random() * numPlayers)`.
- Advance condition: `state.round < state.numPlayers` → start next round; otherwise → game over.

---

## Random Map Generation

`generateRandomMap(targetSize)` accepts an optional size parameter:

- 2P: 21 slots (default)
- 3P: 31 slots

The function grows a connected region of triangle cells using weighted random selection, then computes adjacency. Board arrays, slot animations, and all iteration loops use `SLOTS.length` or `state.board.length` instead of hardcoded `21`.

---

## CPU AI (golden-triangle.html only)

- `isCPUTurn()` returns `true` when `state.currentPlayer !== 0` (both player 1 and player 2 are CPU in 3P).
- `getAvailablePieces()` uses `getPiecesForOwner(state.currentPlayer)`.
- `getEmptySlots()` iterates `state.board.length` (supports 31-slot boards).
- `goldenSlotDelta()` evaluates from the perspective of `state.currentPlayer` (not hardcoded player 1).
- All CPU players share the same difficulty level.

---

## Online Multiplayer (index.html)

### Firebase Room Structure

```
rooms/{CODE}/
  numPlayers: 2 | 3
  players:
    0: true | null   (White)
    1: true | null   (Black)
    2: true | null   (Gold — only in 3P)
  gameState/
    advance_0, advance_1, advance_2
    select_0, select_1, select_2
```

### Net Object Changes

- **`createRoom()`**: Uses `state.numPlayers` for `firstPlayer` range. Creates 3 player slots for 3P. Listens for all players joining before starting.
- **`joinRoom()`**: Finds first empty player slot (0, 1, or 2). Reads `numPlayers` from room data. In 3P, if not all players are present yet, the joiner enters `"waiting"` phase and listens on the room's `status` field — when the last player joins and `status` changes to `'playing'`, `startOnlineMatch()` is triggered for all waiting players.
- **`setupGameStateListeners()`**: Loops over all opponent indices for selection and disconnect listeners.
- **`placePiece()`**: Uses `numPlayers * 10` for total placements. Modular next player.
- **`sendRoundResult()`**: Dynamic board scan and score arrays sized to `numPlayers`.
- **`advanceRound()`**: Waits for all `advance_X` flags. Dynamic round count. Rotated `firstPlayer`.

---

## Progressive Intensity

Milestones scale with total placements:

- 2P (20 total): 10, 15, 18, 20
- 3P (30 total): 15, 22, 27, 30

Computed as 50%, 75%, 90%, 100% of `numPlayers * 10`.

---

## Splash / Boot Animation (index.html only)

The splash screen ("CLICK TO ENTER") and boot animation exist only in `index.html`. They are skipped when navigating back from `golden-triangle.html` via `sessionStorage.setItem("skipBoot", "1")`. The `drawSplash()` function renders a black overlay with starry specks, the game title in VCR font, and pulsing "CLICK TO ENTER" text.

---

## CRT Overlay

The `onSubmenu` check for CRT flicker effects includes `playerCountSelect` in both files, so the CRT effects apply correctly during menu navigation.
