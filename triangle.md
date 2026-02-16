# Golden Triangle - Game Design Document

## 1. Summary
A 2-player hotseat placement game where Black and White alternately place numbered triangles (1–10) onto a fixed triangular board; after the 20th placement each round, the final empty slot becomes a Golden triangle that scores adjacent face values, and after two rounds (with starting player swapped) the higher total wins.
- Assumptions:
  - Hotseat only (both players share one device); no online play.
  - Shapes-only rendering (no external images), but the board silhouette matches the reference composition (gold “G” frame around a 21-slot triangle grid).
  - Each player may place any unused number on their turn (not forced ascending order).
  - The board has exactly 21 triangle slots; 20 filled by players, 1 becomes the Golden slot.
  - Adjacency means sharing a full triangle edge (not just touching at a point).
  - Desktop + mobile supported (mouse/keyboard + touch).

## 2. Technical Requirements
- Rendering: Canvas 2D (built-in, no external libraries)
- Single HTML file with inline CSS and JS
- Unit system: pixels (px)
- Deterministic game state updates at 60 FPS (requestAnimationFrame), but gameplay is turn-based (no timing pressure)

## 3. Canvas & Viewport
- Dimensions: 960×540 internal resolution
- Background: dark slate radial gradient (center slightly lighter), to match the reference’s studio-like backdrop
  - Example intent: center #2B3340 → edges #1B202A
- Aspect ratio behavior: letterboxed
  - Scale the canvas uniformly to fit the browser while preserving 16:9, with black bars as needed.

## 4. Visual Style & Art Direction
- Art style: flat geometric with subtle faux-material shading; crisp edges; high contrast numbers
- Mood/atmosphere: elegant, competitive, boardgame-on-a-table feel
- Color palette (with purpose):
  - Background deep: `#1B202A` (outer vignette)
  - Background mid: `#2B3340` (center glow)
  - Gold base: `#C9A24A` (G-frame base)
  - Gold highlight: `#E7D08A` (bevel highlight)
  - Gold shadow: `#8A6A22` (bevel shadow)
  - White piece: `#F2F2F2`
  - White shadow: `#CFCFCF`
  - Black piece: `#121212`
  - Black highlight: `#3A3A3A`
  - Slot outline: `#6F7A89` (thin neutral line)
  - UI accent (turn): `#62B6FF`
  - Error/denied: `#FF5A6A`
- Board composition requirements (must visually match reference layout intent):
  - A large, segmented “G” shaped gold frame centered on screen.
  - Inside the frame sits the triangle-slot board (21 triangle cavities) with thin outlines.
  - The Golden triangle that appears at scoring time uses the same gold family but brighter than the frame.

## 5. Player Specifications
- Player entities: not an avatar; each player is a set of 10 numbered triangle pieces.
- Piece appearance:
  - Equilateral triangle with a subtle inner bevel (simple gradient/2-tone fill acceptable).
  - Centered number label (1–10), bold, high readability.
- Piece size:
  - Triangle side length: 72 px
  - Visual padding inside slot: pieces render at 68 px side length to show a thin slot border.
- Colors:
  - White player: fill `#F2F2F2`, label `#121212`
  - Black player: fill `#121212`, label `#F2F2F2`
- Starting availability:
  - Each round: both players start with all numbers 1–10 available (unused).
- Movement constraints:
  - Turn-based placement only; no moving after placing (placed pieces are locked).

## 6. Physics & Movement
(There is no platforming physics; values exist only to remove ambiguity.)
| Property | Value | Unit |
|----------|-------|------|
| Gravity | 0 | px/sec² |
| Jump velocity | 0 | px/sec |
| Move/scroll speed | 0 | px/sec |
| Max fall speed | 0 | px/sec |
| Ground position | 0 | px |

- Coordinate convention: +X right, +Y down.

## 7. Obstacles/Enemies
- None (pure competitive placement puzzle).
- Symmetry note: both players have identical constraints and options (same numbers, same placement rules).

## 8. World & Environment
### Board Layout (21 slots)
- The board is a fixed equilateral-triangle grid of **21 slots** arranged as a hex-like cluster (visually matching the reference density).
- Slot geometry:
  - Slot triangles alternate orientation (up/down) in a triangular tiling.
  - Every slot has:
    - `id` (0–20)
    - `orientation`: `"up"` or `"down"`
    - `center position` in pixels relative to board center
- Board placement on canvas:
  - Board center at (480, 270)
  - Triangle side length `S = 72`
  - Triangle height `H = S * 0.8660254 ≈ 62.35`
  - Horizontal spacing between adjacent triangle centers in a row: `S/2 = 36`
  - Vertical spacing between rows of centers: `H/2 ≈ 31.18`
- **Exact slot center coordinates (px)** relative to board center (0,0), then offset by (480,270).
  - This layout creates 21 slots in 7 rows (top to bottom): 3, 4, 3, 4, 3, 2, 2 (21 total).  
  - Row Y positions use multiples of `H/2` to ensure edge-sharing adjacency.
  - Define rows with `(x, y, orientation)`:

Row 0 (y = -3H = -187.05): 3 slots  
1. id0:  x = -36, y = -187.05, orientation = up  
2. id1:  x =   0, y = -187.05, orientation = down  
3. id2:  x = +36, y = -187.05, orientation = up  

Row 1 (y = -2H = -124.70): 4 slots  
4. id3:  x = -54, y = -124.70, orientation = down  
5. id4:  x = -18, y = -124.70, orientation = up  
6. id5:  x = +18, y = -124.70, orientation = down  
7. id6:  x = +54, y = -124.70, orientation = up  

Row 2 (y = -H = -62.35): 3 slots  
8. id7:  x = -36, y = -62.35, orientation = up  
9. id8:  x =   0, y = -62.35, orientation = down  
10. id9: x = +36, y = -62.35, orientation = up  

Row 3 (y = 0): 4 slots  
11. id10: x = -54, y = 0, orientation = down  
12. id11: x = -18, y = 0, orientation = up  
13. id12: x = +18, y = 0, orientation = down  
14. id13: x = +54, y = 0, orientation = up  

Row 4 (y = +H = +62.35): 3 slots  
15. id14: x = -36, y = +62.35, orientation = up  
16. id15: x =   0, y = +62.35, orientation = down  
17. id16: x = +36, y = +62.35, orientation = up  

Row 5 (y = +2H = +124.70): 2 slots  
18. id17: x = -18, y = +124.70, orientation = down  
19. id18: x = +18, y = +124.70, orientation = up  

Row 6 (y = +3H = +187.05): 2 slots  
20. id19: x = -18, y = +187.05, orientation = up  
21. id20: x = +18, y = +187.05, orientation = down  

### Gold “G” Frame
- A thick segmented gold frame surrounds the 21-slot cluster, forming a stylized capital “G”:
  - Outer silhouette: hexagon-like ring
  - Inner cutout: matches the board cavity area
  - A horizontal “bite”/bar on the right side creates the “G” gap, as in the reference
- Visual intent:
  - Use 3-tone shading to imply bevel: highlight on top-left edges, shadow on bottom-right edges.
  - The “G” must visually surround the empty triangle spaces, leaving a comfortable margin (~40–60 px) between slots and frame.

## 9. Collision & Scoring
- Interaction hit-testing:
  - Slot selection uses point-in-triangle hit test (tap/click anywhere inside a slot).
  - Forgiveness: also accept clicks within a 6 px padding around triangle edges to reduce frustration.
- Placement rule:
  - A piece can be placed only on an empty slot.
  - Once placed, a slot is occupied permanently for that round.
- Round end condition:
  - After exactly 20 placements, exactly 1 slot remains empty.
  - That empty slot becomes the **Golden slot** (Golden triangle appears there).
- Adjacency definition (scoring):
  - A triangle is adjacent if it shares a full edge with the Golden triangle.
  - In this triangular tiling, the Golden triangle can have **up to 3 adjacent** edge-neighbors.
- Scoring:
  - For each adjacent occupied triangle:
    - Add its face value (1–10) to its owner’s round score.
  - Round score is the sum of adjacent values for each player (both can score in the same round).
- Match structure:
  - 2 rounds total.
  - Board resets fully between rounds.
  - Starting player swaps in round 2 (whoever went second in round 1 goes first in round 2).
  - Winner: higher total points after round 2.
  - Tiebreaker: if totals equal, declare “Draw” (no extra tiebreak rules in V1).
- High score storage (local):
  - Store “best winning margin” (largest absolute difference in total points) to create persistence.
  - localStorage key: `goldenTriangle_bestMargin`

## 10. Controls
| Input | Action | Condition |
|-------|--------|-----------|
| Mouse click / Touch tap on a piece (1–10) in your tray | Select/deselect that piece | Only during Playing; only if it’s your turn and piece unused |
| Mouse click / Touch tap on an empty slot | Place selected piece | Only if a piece is selected and slot empty |
| Mouse click / Touch tap on occupied slot | Denied feedback (no action) | Playing |
| R key | Restart entire match (both rounds reset) | Menu, Playing, Game Over |
| P or Escape | Toggle Pause | Playing only |
| Space / Enter | Confirm/continue (Start match, Next round) | Menu, Round Result, Game Over |

## 11. Game States
### Menu
- Displays:
  - Title: “Golden Triangle”
  - Short rules (3 lines max): “Alternate placing numbered triangles. After the last placement, the final empty slot becomes Gold. Adjacent numbers score.”
  - Controls panel (always visible): click/tap to select then place; P/Esc pause; R restart.
  - “Start Match” prompt (Space/Enter/click button)
- Start:
  - Default: Round 1 begins; randomly choose starting player (Black or White) for Round 1, but clearly display it.

### Playing
- Active:
  - Board with 21 slots
  - Two piece trays (White and Black), each showing remaining numbers 1–10
  - Turn indicator banner: “Black to place” / “White to place”
  - Round indicator: “Round 1/2” or “Round 2/2”
  - Score so far (total across rounds) always visible
  - Controls hint mini-strip (always visible): “Tap piece → tap slot”
- Flow:
  - Player selects an unused number from their tray, then places into an empty slot.
  - Turn immediately passes after successful placement.
  - After 20th placement: enter Scoring Reveal (still part of Playing or transition to Round Result).

### Paused
- Trigger: P or Escape
- Displays:
  - Dimmed overlay
  - “Paused” and controls reminder
- Behavior:
  - All animations stop except a subtle UI pulse (optional).
  - No input except unpause/restart.

### Round Result
- Trigger: after scoring is computed and reveal animation completes
- Displays:
  - Golden slot shown
  - Highlighted adjacent triangles with owner-colored glows
  - Round score breakdown:
    - “Round X: White +N, Black +M”
  - Running totals after this round
  - “Next Round” (if Round 1) or “View Winner” (if Round 2)
- Continue:
  - Space/Enter/click to proceed

### Game Over
- Trigger: after Round 2 Round Result is acknowledged
- Displays:
  - Winner banner: “White Wins”, “Black Wins”, or “Draw”
  - Final totals
  - Best margin (from localStorage) if updated: “New Best Margin!”
  - Controls: Space/Enter to play again, R to reset
- Retry:
  - Starts a fresh 2-round match; starting player may randomize again.

## 12. Game Feel & Juice (REQUIRED)

### 12.1 Input Response
- Selecting a piece (same-frame acknowledgement):
  - Selected triangle in tray scales to **1.08×** instantly (within 1 frame) then eases back to **1.05×** as an “armed” state.
  - Add a thin glow outline in turn color (`#62B6FF`) to confirm selection.
- Placing a piece:
  - On valid slot click, the piece “snaps” into the slot with a quick pop (see timing below).
  - Slot outline briefly brightens to confirm registration.
- Denied input feedback:
  - If clicking an occupied slot or clicking a slot without a selected piece:
    - Slot does a 6 px micro-shake left-right over 120 ms
    - Outline flashes `#FF5A6A` at 70% opacity for 120 ms

### 12.2 Animation Timing
- Piece placement pop:
  - Duration: 140 ms total
  - Scale: 0.85× → 1.12× (first 70 ms) → 1.00× (next 70 ms)
  - Easing intent: ease-out on the upscaling, ease-in-out on settle
- Hover (desktop) / focus (mobile after selection):
  - When hovering an empty slot with a piece selected: slot fill subtly tints by owner color at 12% opacity (instant on, 80 ms fade off).
- UI transitions:
  - Menu to Playing: 220 ms fade + slight upward slide (12 px)
  - Round Result panel: 180 ms scale from 0.96× to 1.00× with ease-out

### 12.3 Near-Miss Rewards
(Not applicable: no movement or dodging. Replace with **“Tension Pings”** that reward strategic moments.)
- Detection:
  - When a player places a piece that becomes adjacent to the *current* last remaining empty slot count scenario is unknown; instead, detect when empty slots remaining reaches:
    - 5 remaining
    - 3 remaining
    - 2 remaining
- Visual:
  - Brief gold pulse travels around the inner edge of the G-frame (a 250 ms shimmer sweep).
- Score:
  - No points awarded (pure feedback to heighten endgame tension).

### 12.4 Screen Effects
| Effect | Trigger | Feel |
|--------|---------|------|
| Shake | Denied placement / invalid click | Tiny, snappy (6 px, 120 ms) |
| Flash | Golden reveal moment | Warm gold flash overlay at 18% opacity, 160 ms |
| Zoom pulse | Final placement (20th) | Subtle camera-scale pulse 1.00→1.03→1.00 over 220 ms |
| Time dilation | Golden reveal | Brief slow reveal feel by delaying highlight steps (no true delta slow required); total reveal 900 ms |

### 12.5 Progressive Intensity
- As the board fills, increase “stakes”:
  - At 10 placements: slot outlines brighten slightly (+15% value), UI turn banner becomes more saturated.
  - At 15 placements: background vignette deepens, gold frame highlight becomes stronger (+10%).
  - At 18 placements: subtle ambient pulsing glow on the G-frame (period ~1.2 sec).
  - At 20th placement: trigger zoom pulse + gold flash, then Golden reveal sequence.

### 12.6 Idle Life
- Player trays:
  - Unused pieces subtly “breathe” (scale 1.00↔1.02 over 2.4 sec) to feel tactile.
- Board:
  - Very subtle drifting specks in the background (simple 2D dots with slow movement).
- UI:
  - Turn indicator underline softly pulses (alpha 60%↔100%).

### 12.7 Milestone Celebrations
- Milestones:
  - At placements remaining: 10, 5, 3, 2 (shared milestones)
- Celebration:
  - Gold frame shimmer sweep (250 ms) + small text toast: “10 slots left”, etc. (toast lasts 900 ms).
- New high score (best margin):
  - On Game Over, if new best margin: add a gold “crown” badge next to the margin line and a 300 ms sparkle flash.

### 12.8 Death Sequence
(There is no death. Replace with **End-of-Round Impact**.)
- End-of-round scoring reveal sequence (total ~900 ms):
  1. Golden triangle appears in the last empty slot with a pop (same timing as placement but brighter).
  2. Adjacent triangles light up one-by-one (3 steps max, 160 ms each).
  3. Floating +N labels rise 18 px and fade (350 ms) over each scoring triangle, colored by owner.
  4. Round Result panel slides in (180 ms).

## 13. UX Requirements
- Controls on menu screen: required and always visible.
- Controls hint during gameplay: required and always visible.
- Accessibility/readability:
  - Numbers must be at least 28 px font size on pieces (bold).
  - Ensure sufficient contrast (white on black; black on white).
- Forgiving interaction:
  - Accept clicks/taps slightly outside triangle (6 px padding).
  - Provide denied feedback for all invalid interactions.
- Mobile/touch support:
  - Tap-to-select then tap-to-place (no drag required).
  - Selected piece remains selected until placed or tapped again to deselect.

## 14. Out of Scope (V1)
- Sound effects or music
- Online multiplayer / matchmaking
- AI opponent
- Animations for player avatars (the faces in the reference)
- Board editor / alternate maps
- Advanced stats (heatmaps, move history export)
- Tutorial overlays beyond the brief rules text on the menu
- Custom piece skins/themes

## 15. Success Criteria
- [ ] Runs from a single HTML file without errors
- [ ] Board visually matches the reference intent: gold “G” frame surrounding a 21-slot triangle board
- [ ] Controls visible on menu AND during gameplay
- [ ] Two players can complete a full round: 20 placements, 1 slot becomes Golden automatically
- [ ] Starting player swaps automatically between Round 1 and Round 2
- [ ] Golden scoring correctly sums face values of edge-adjacent triangles by owner
- [ ] Round Result shows per-round gains and running totals
- [ ] Input feels instant (same-frame response) with clear selection, placement, and denied feedback
- [ ] End-of-round reveal feels impactful (gold pop + highlights + score floaters)
- [ ] Pause/resume works and freezes interaction
- [ ] Match ends after two rounds with winner/draw display
- [ ] High score (best winning margin) persists via localStorage
- [ ] Collision/selection feels fair with 6 px forgiving hit padding