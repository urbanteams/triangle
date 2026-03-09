# Changelog

## 2026-03-08 — Join Game Layout Rework

### Changed: Join Room Code Screen (`index.html`)
- Input field centered vertically at page center (`H/2`)
- "ENTER ROOM CODE:" label and Start/Back buttons spaced 40px from input (doubled from 20px)
- Label and buttons equidistant from input field
- Text inside input field raised (`-5` offset) for proper vertical centering within the box
- Cursor blink position adjusted to match
- Button hit-test rects in `getButtons()` updated to match new layout

## 2026-03-07 — CRT Television Effect & VCR Font Overhaul

### Added: CRT Television Overlay
- Fixed overlay div (`z-index: 9999`, `pointer-events: none`) with layered visual effects on both HTML files
- Scanlines: 4px repeating horizontal gradient
- Vignette: radial gradient darkening corners/edges to simulate curved CRT screen
- Chromatic aberration: subtle RGB channel separation via inset box-shadows
- Phosphor glow: faint green tint with screen blend mode
- CRT bezel frame: layered inset box-shadows simulating a dark plastic TV housing
- Flicker + static noise: **title screen only** — JS polls game phase to toggle effects

### Added: VCR OSD Mono Font
- Replaced system sans-serif (tile numbers) and most Merriweather UI text with VCR OSD Mono from CDNFonts
- All VCR OSD Mono text rendered in ALL CAPS except button subheadings
- Allura retained for: title logo, menu headings, player name labels above trays
- Merriweather retained for: How to Play popup body text
- Turn indicator ("WHITE TO PLACE" / "YOUR TURN") changed from Allura to VCR OSD Mono, still scarlet red with pulsating opacity
- Button text y-offset adjusted from `+2` to `-1` for proper vertical centering

### Changed: Background Stars
- Increased speck radius (0.8–3.0), opacity (0.25–0.75), and added shadowBlur glow
- Color shifted from warm gray to cool white with blue-white halo

### Changed: UI Element Positioning
- All HUD elements inset by 12px (`bezelPad`) from edges to clear the CRT bezel frame
- Player trays shifted 12px toward center in wide layout
- "Select Map" heading color changed from scarlet red to silver (`COL.accent`)
- "Scarlet Triangle" title text made bold

### Fixed: Local Development Server
- `server.js` now serves static files at `/triangle/` path to match `<base href="/triangle/">` tag
- Root `/` redirects to `/triangle/index.html`
- Navigation between `index.html` and `golden-triangle.html` works correctly on localhost

## 2026-02-25 — Map Type Selection & Random Maps (Hot Seat)

### Added: Pre-Game Map Selection
- Hot seat (`golden-triangle.html`) now shows a map selection screen before starting
- Flow: **Menu → Map Select → Playing**
- Two options: **Standard Map** (original layout with G-frame) and **Random Map** (procedurally generated, no G-frame)
- Back button and Escape key navigate back to menu

### Added: Random Map Generation
- Grid-based growth algorithm starting from cell `(0,0)` using triangular grid coordinates `(gr, gc)`
- Orientation determined by `((gr+gc)%2+2)%2` — 0 = up, 1 = down
- Frontier-based growth with **weighted selection toward centroid** (inverse square distance) for compact blob shapes
- Grid neighbors: horizontal `(gr, gc±1)` always; vertical `(gr+1, gc)` if up, `(gr-1, gc)` if down
- Screen positions computed from grid coords then centered by subtracting mean — **no position scaling**, since grid coordinates produce a non-overlapping tiling by construction
- `randomMapData` persists grid cells + adjacency so `updateSlots()` can recompute positions on window resize
- `ADJ` changed from `const` to `let` — set to `STANDARD_ADJ` for standard maps or generated adjacency for random maps
- G-frame only renders when `state.mapType === "standard"`

### Fixed: Piece Bevel Overlap
- `drawBevelTri()` now uses `ctx.clip()` on the triangle path before drawing bevel edge strokes
- **Root cause**: Canvas `stroke()` draws centered on the path — half inside, half outside. Bevel strokes (lineWidth 2–2.5) extended ~1.25px beyond each piece boundary. With `PIECE_S = S * 0.94`, the gap between adjacent pieces (~2.3px) was exceeded by combined bevel protrusion (~2.5px), causing visible overlap on dense random map layouts
- **Why standard maps were less affected**: Sparser layout with fewer shared edges, G-frame masking edge areas
- `lineWidth` doubled (2.5→5, 2→4) to compensate for clip cutting the outer half, maintaining identical visual bevel thickness

### Removed: Hidden Mode from Hot Seat
- Hot seat mode assumes standard (regular) game rules only
- No mode selection screen — menu goes directly to map selection
- Hidden mode remains available in the online multiplayer version (`index.html`)
