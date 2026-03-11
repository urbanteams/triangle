# CPU AI Logic (golden-triangle.html)

CPU AI lives entirely in `golden-triangle.html`. All difficulty levels evaluate every (piece, slot) combination and pick the highest-scoring move.

## Entry Points

- `computeCPUMove()` — dispatches to easy/medium/hard based on `cpuDifficulty`
- `updateCPU(dt)` — called each frame during CPU turns; handles think delay then executes the move

## Difficulty Levels

### Easy (`cpuMoveEasy`)
Minimal heuristics with heavy randomness. Factors:
1. **Golden slot awareness** (weak): `goldenSlotDelta * -1.2`
2. **Empty neighbor preference**: slight bonus per empty adjacent slot
3. **Noise**: `Math.random() * 6` — dominates most decisions, producing frequent mistakes

No blocking waste penalty — easy AI will happily use a 10 to block.

### Medium (`cpuMoveMedium`)
Balanced heuristic scoring. Factors:
1. **Golden slot denial**: `goldenSlotDelta * -3.0`
2. **Scoring potential**: `piece.value * emptyNeighbors * (1/slotsAfter) * 2.0`
3. **Threat creation**: `piece.value * 0.3` per empty neighbor (raises golden delta of adjacent slots)
4. **Adjacency preference**: `adj.length * 0.5`
4b. **Blocking waste penalty** (mild): `-piece.value * 0.6` when slot has 0 empty neighbors and piece value >= 5
5. **Noise**: `Math.random() * 1.5`

### Hard (`cpuMoveHard`)
Full strategic evaluation via `evaluateHardMove()`. Factors:

1. **Golden slot sacrifice/denial**: `goldenSlotDelta * -3.5`, with extra `-delta * 2.0` when <= 5 empty slots remain
2. **Scoring potential**: `piece.value * emptyNeighbors * (1/slotsAfter) * 2.5`
3. **Golden landscape impact**: For each empty neighbor, calculates how placing here shifts that neighbor's golden delta. Bonus of `piece.value * 0.4` per neighbor, plus +2.0 if it pushes a neighbor's delta above 10 (creating a new major threat)
4. **Piece economy**:
   - Early game (< 35% progress): penalizes pieces >= 8 by `(value - 7) * 2.5`
   - Late game (> 65% progress): bonus for pieces >= 7 proportional to empty neighbors
4b. **Blocking waste penalty** (strong):
   - 0 empty neighbors, piece >= 3: `-piece.value * 1.8`
   - 1 empty neighbor, piece >= 5: `-piece.value * 0.5`
   - Rationale: a low-value piece blocks just as effectively as a high-value one. Preserves high-value pieces for slots where they can actually score.
5. **Edge penalty**: 1-neighbor slots with piece >= 6: `-piece.value * 2.0`
6. **Deny opponent threats**: bonus when placing near empty slots heavily surrounded by opponent pieces (opponent total >= 12)
7. **Noise**: `Math.random() * 0.8`

#### Last Piece Special Case (`cpuMoveLastPiece`)
When exactly 2 empty slots and 1 piece remain, calculates exact outcome for both options: placing in slot A (making B golden) vs placing in slot B (making A golden). Picks the placement that maximizes `myScore - oppScore` for the resulting golden slot.

## Helper Functions

| Function | Purpose |
|---|---|
| `goldenSlotDelta(slotId)` | Net value of CPU's adjacent pieces minus opponents' adjacent pieces at an empty slot. Positive = golden here favors CPU. |
| `evaluateHardMove(piece, slotId, allPieces, allSlots)` | Full scoring function for hard AI |
| `cpuMoveLastPiece(piece, slots)` | Exact calculation for the final placement |
| `getAvailablePieces()` | Returns current player's unused pieces |
| `getEmptySlots()` | Returns array of empty board slot indices |
| `isCPUTurn()` | Returns true if it's a CPU-controlled player's turn |

## Design Principles

- **No lookahead / game tree search**: All evaluation is single-move heuristic. This keeps the AI fast and predictable in difficulty.
- **Noise for personality**: Each difficulty has calibrated randomness so the AI doesn't play identically each game.
- **Piece value conservation**: The AI should use the minimum piece value needed for any given strategic goal (blocking, edge filling, etc.) and save high-value pieces for positions where they can score.
