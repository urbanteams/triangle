# Golden Triangle - First Draft Notes

## Board Layout

The board uses a proper triangular tiling with 21 slots arranged in 4 rows:

- **Row 0 (top):** 5 slots — ↑ ↓ ↑ ↓ ↑ (ids 0–4)
- **Row 1:** 7 slots — ↑ ↓ ↑ ↓ ↑ ↓ ↑ (ids 5–11, widest row)
- **Row 2:** 4 slots — ↓ ↑ ↓ ↑ (ids 12–15, shifted left under Row 1)
- **Row 3 (bottom):** 5 slots — ↓ ↑ ↓ ↑ ↓ (ids 16–20, first ↓ borders Row 2's id13; last ↓ top is non-adjacent)

The bottom-right area is open, matching the G-frame gap.

## Key Technical Decision: Triangle Tiling Coordinates

The original spec placed ↑ and ↓ triangles at the same y-center within a row. This does NOT produce a valid tiling — triangles overlap and don't share edges.

The fix: ↑ and ↓ triangles in the same band have **different y-centers**, offset by `TH/3 ≈ 20.78px`. Within each band (between two vertex rows):
- ↑ triangles: centroid at `y_band + 2*TH/3`
- ↓ triangles: centroid at `y_band + TH/3`

This ensures all adjacent triangles share a full edge (verified: every adjacent pair shares exactly 2 vertices).

## Adjacency

24 edges total (17 within-row + 7 between-row). Between-row connections occur where an ↑ triangle's base (horizontal edge) aligns with a ↓ triangle's top in the row below.

## What's Implemented

- Canvas 960×540, letterboxed with DPR-aware scaling
- 21-slot board with proper edge-sharing tiling
- Gold G-frame (hexagonal ring with gap + crossbar)
- Two player trays (White left, Black right) with idle breathing animation
- Tap-to-select, tap-to-place input with 6px hit-test forgiveness
- 2-round game flow with starting player swap
- Golden slot reveal sequence (~900ms) with glow + float labels
- Placement pop, denied shake, hover tint, selection glow animations
- Progressive intensity (outlines brighten at 10, vignette at 15, G-frame pulse at 18)
- Milestone toasts, zoom pulse on 20th placement, gold flash
- Pause (P/Escape), restart (R), Space/Enter confirmations
- Best winning margin stored in localStorage
- Synthesized placement sound effect (Web Audio API)

## Placement Sound Effect

A short acrylic-tile-click sound plays on each piece placement, synthesized via Web Audio API in `playPlaceClick()`. Two components:

1. **Noise burst** (transient click): 12ms white noise → bandpass filter → fast decay
   - `bp.frequency`: controls tone of the click (lower = deeper). Currently **1800 Hz**
   - `bp.Q`: sharpness of the filter (higher = more ringy). Currently **0.8**
   - `noiseDur`: length of the burst. Currently **0.012s**

2. **Sine ping** (acrylic resonance): short oscillator tone that decays quickly
   - `osc.frequency`: pitch of the ring (lower = less squeaky). Currently **1600 Hz**
   - `oscGain` initial value: how prominent the ring is. Currently **0.12**
   - Decay time (exponentialRamp target): how fast ring fades. Currently **0.018s**

3. **Master gain**: overall volume. Currently **0.055** (very faint)

To adjust: deeper/less squeaky → lower frequencies; less ringy → lower oscGain initial value and shorter decay; quieter/louder → change master gain.
