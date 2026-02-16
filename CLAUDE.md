# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Golden Triangle** is a 2-player hotseat placement board game. The entire game is a **single HTML file** with inline CSS and JS — no build system, no dependencies, no external libraries.

The game design document lives in `triangle.md` and is the authoritative spec.

## Running the Game

Open the HTML file directly in a browser. No server or build step required.

## Technical Constraints

- **Single file**: All HTML, CSS, and JS must be in one `.html` file
- **Canvas 2D only**: No WebGL, no external rendering libraries
- **No external assets**: Shapes-only rendering (no images, fonts, or sounds)
- **Internal resolution**: 960x540, letterboxed to preserve 16:9 aspect ratio
- **localStorage key**: `goldenTriangle_bestMargin` for persisting best winning margin

## Architecture (from the spec)

### Game States
`Menu` → `Playing` → `Paused` (toggle) → `Round Result` → `Game Over`

State machine drives the entire game loop. Two rounds per match; starting player swaps between rounds.

### Board Layout
- 21 triangle slots in a triangular tiling (alternating up/down orientation)
- 7 rows with slot counts: 3, 4, 3, 4, 3, 2, 2
- Board centered at canvas (480, 270), triangle side length 72px
- Exact slot coordinates are specified in `triangle.md` Section 8
- Adjacency = sharing a full triangle edge (max 3 neighbors per slot)

### Core Game Loop
1. Players alternate placing numbered triangles (1-10) from their tray onto empty slots
2. After 20 placements, the remaining empty slot becomes the Golden slot
3. Adjacent pieces' face values score for their respective owners
4. Two rounds total, then winner determined by higher total

### Key Implementation Details
- Hit testing: point-in-triangle with 6px forgiveness padding
- Piece selection: tap tray piece to select, tap slot to place (no drag)
- Animation timings are precisely specified in Section 12 (placement pop: 140ms, denied shake: 120ms, etc.)
- Progressive intensity: visual effects escalate as board fills (milestones at 10, 15, 18, 20 placements)
- End-of-round reveal sequence: ~900ms total with staggered highlights and floating score labels
