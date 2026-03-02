# Scarlet Triangle — Branch Documentation

This document describes the visual and naming changes made on the `Scarlet` branch, transforming **Golden Triangle** into **Scarlet Triangle**.

## Overview

The game has been renamed from "Golden Triangle" to "Scarlet Triangle." The final empty slot on the board — previously a golden triangle — is now scarlet red. The overall color palette has been redesigned around four primary colors: **Red, Black, Gold, and Silver**.

Both `golden-triangle.html` (hot seat) and `index.html` (online multiplayer) have been updated with identical theming.

## Color Palette

### Primary Colors

| Role    | Hex       | Usage                                      |
|---------|-----------|---------------------------------------------|
| Red     | `#DC143C` | Scarlet triangle, primary action buttons     |
| Black   | `#120A0E` | Backgrounds (warm black with red undertone)  |
| Gold    | `#C9A24A` | Title text, G-Frame border, gold accents     |
| Silver  | `#C0C8D8` | Selection highlights, secondary buttons      |

### Full COL Object

```js
const COL = {
  bgDeep: "#120A0E",      // Very dark black-red (was #1B202A)
  bgMid: "#261820",       // Dark reddish (was #2B3340)
  goldBase: "#C9A24A",    // Gold — unchanged
  goldHi: "#E7D08A",      // Gold highlight — unchanged
  goldSh: "#8A6A22",      // Gold shadow — unchanged
  white: "#F2F2F2",       // White pieces — unchanged
  whiteSh: "#CFCFCF",     // White shadow — unchanged
  black: "#121212",       // Black pieces — unchanged
  blackHi: "#3A3A3A",     // Black highlight — unchanged
  slotOutline: "#8A8894", // Silver-toned (was #6F7A89)
  accent: "#C0C8D8",      // Silver (was #62B6FF blue)
  denied: "#FF5A6A",      // Error/denied — unchanged
  scarletBright: "#DC143C" // Scarlet red (was goldenBright #F5D96B)
};
```

## Changes by Category

### 1. Game Name

All user-visible text changed from "Golden Triangle" to "Scarlet Triangle":
- `<title>` tags in both HTML files
- Title screen display text
- "How to Play" descriptions (online version)

### 2. The Scarlet Triangle (Final Slot)

The special triangle placed in the last empty slot is now scarlet red instead of gold:

| Element        | Old (Golden)          | New (Scarlet)         |
|----------------|-----------------------|-----------------------|
| Base color     | `#F5D96B` goldenBright | `#DC143C` scarletBright |
| Highlight edge | `#FFF5C0`             | `#FF6680`             |
| Shadow edge    | `#C9A24A` goldBase    | `#8B0A1E`             |
| Star symbol    | `#8A6A22` goldSh      | `#5A0814`             |

### 3. Backgrounds

| Element              | Old         | New         |
|----------------------|-------------|-------------|
| CSS body background  | `#1B202A`   | `#120A0E`   |
| COL.bgDeep           | `#1B202A`   | `#120A0E`   |
| COL.bgMid            | `#2B3340`   | `#261820`   |
| Empty slot fill      | `#1A1F28`   | `#1A0E12`   |
| Background specks    | `rgba(200,200,220,a)` | `rgba(210,200,200,a)` |
| Overlay dim          | `rgba(10,14,20,a)`    | `rgba(14,8,10,a)`     |
| Dialog panel bg      | `rgba(30,36,48,0.95)` | `rgba(36,20,26,0.95)` |

All backgrounds shifted from cool blue-gray to warm black-red.

### 4. UI Accent Color

The interactive accent color changed from blue to silver:

| Usage                  | Old (Blue)  | New (Silver) |
|------------------------|-------------|--------------|
| COL.accent             | `#62B6FF`   | `#C0C8D8`    |
| Selected piece outline | Blue glow   | Silver glow  |
| Turn indicator         | Blue        | Silver       |
| Input box stroke       | Blue        | Silver       |
| Continue prompts       | Blue        | Silver       |

### 5. Slot Outlines

| Element         | Old       | New       |
|-----------------|-----------|-----------|
| COL.slotOutline | `#6F7A89` | `#8A8894` |

Changed from blue-gray to silver-toned.

### 6. Flash Overlay (20th Placement)

The full-screen flash when the 20th piece is placed:

| Old (Gold)                    | New (Scarlet)                  |
|-------------------------------|--------------------------------|
| `rgba(245,217,107,a)` | `rgba(220,20,60,a)` |

### 7. Button Styling (Online Lobby)

Buttons now use the Red/Gold/Silver palette:

| Button        | Border/Text Color | Background Tint     |
|---------------|-------------------|----------------------|
| Create Game   | Scarlet (`#DC143C`) | Dark red (`#1E1018`) |
| Join Game     | Silver (`#C0C8D8`)  | Dark neutral (`#1E1E24`) |
| Hot Seat      | Gold (`#C9A24A`)    | Dark warm (`#1E1810`) |
| Regular Mode  | Scarlet (`#DC143C`) | Dark red (`#1E1018`) |
| Hidden Mode   | Gold (`#C9A24A`)    | Dark warm (`#1E1810`) |
| Back/Cancel   | Gray (`#AAB`)       | Dark warm (`#1E1618`) |

### 8. G-Frame (Hexagonal Border)

The decorative hexagonal frame around the board retains its **gold** color scheme (`goldBase`, `goldHi`, `goldSh`), since gold is part of the Scarlet palette.

## Map Selection for Online Multiplayer

A **Select Map** screen was added to online multiplayer (`index.html`), matching the flow already present in hot seat mode. After choosing Regular or Hidden mode when creating a game, players now choose between:

- **Standard Map** — the classic 21-slot triangular layout
- **Random Map** — a procedurally generated board (same algorithm as hot seat)

This creates four possible game types: Regular/Standard, Regular/Random, Hidden/Standard, Hidden/Random.

### Implementation Details

- New `mapSelection` phase inserted between `modeSelection` and room creation
- Screen styling (title font, button sizes, hover colors, back button) matches the Select Game Mode screen
- Random map generation (`generateRandomMap`) and random-map-aware `updateSlots` ported from `golden-triangle.html`
- For random maps, the creator stores `mapData` (cell grid coordinates + adjacency list) in the Firebase room so the joiner reconstructs the identical board
- `returnToLobby()` resets `randomMapData` and restores the standard slot layout

## Fonts

| Context | Font | Source |
|---------|------|--------|
| Title text (e.g. "Scarlet Triangle") | Allura (cursive) | Google Fonts |
| General UI text (menus, labels, scores, prompts) | Merriweather (serif), bold & regular weights | Google Fonts |
| Numbers on triangle tiles | System sans-serif | Built-in |

Both files load fonts via: `fonts.googleapis.com/css2?family=Allura&family=Merriweather:wght@400;700&display=block`

## Tile Overlap Fix

Placed triangles were visually overlapping neighboring slots, especially on smaller screens (mobile). Two changes fixed this in both files:

1. **Clipping path in `drawBevelTri`**: A `ctx.clip()` call now confines all drawing (fill + bevel strokes) to the triangle boundary, preventing bevel strokes from bleeding into adjacent slots. Bevel line widths were doubled (2.5→5 highlight, 2→4 shadow) to compensate for the clip cutting the outer half of strokes.

2. **Reduced piece size ratio** (`PIECE_S`): Changed from `S * 0.94` to `S * 0.88`. The previous 6% reduction left sub-pixel gaps on small screens. The new 12% reduction creates a visible border between pieces and slot outlines at all screen sizes.

## What Was NOT Changed

- **Internal variable names**: `goldenSlot`, `goldFlash`, `goldBase`, `goldHi`, `goldSh` remain as-is (only the color property `goldenBright` was renamed to `scarletBright`)
- **File names**: `golden-triangle.html` and `index.html` are unchanged
- **localStorage key**: `goldenTriangle_bestMargin` kept for backward compatibility
- **Game mechanics**: No gameplay logic was altered
- **G-Frame colors**: Gold border kept as part of the palette
- **Piece colors**: White and black player pieces unchanged
- **Denied/error color**: `#FF5A6A` unchanged
