# Changelog

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
