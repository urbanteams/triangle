# Hidden Mode Implementation

## Overview
Hidden mode is a game variant available only for online multiplayer games (not hotseat). In this mode, each player's 1 and 10 pieces are hidden from their opponent, appearing as "?" instead of showing their values.

### Tray Positioning
To prevent positional deduction, hidden pieces are displayed after the visible pieces in the tray:
- **Display order**: 2, 3, 4, 5, 6, 7, 8, 9, ?, ?
- Each player gets their own **independent randomization** of whether the two "?" represent [1, 10] or [10, 1]
- This prevents opponents from deducing which hidden piece is being played based on its position
- The randomization is set at game start and preserved across both rounds

## User Flow
1. Player clicks "Create Game" in the lobby
2. Mode selection screen appears with two options: **Regular** and **Hidden**
3. Player selects a mode, and the room is created with that mode
4. When opponent joins, both players play with the selected mode
5. During gameplay, opponent's 1 and 10 pieces show as "?"
6. At round end, all hidden pieces are revealed (300ms pause) before the Golden Triangle appears

## Implementation

### Client-Side (`index.html`)
- **State**: Added `gameMode` ("regular" or "hidden"), `hiddenPiecesRevealed`, `whiteHiddenOrder`, and `blackHiddenOrder` fields
- **Hidden Order Randomization**: Each player gets independent randomization of 1 and 10 position
  - `whiteHiddenOrder` and `blackHiddenOrder` are set to either [1, 10] or [10, 1] randomly when hidden mode starts
  - Preserved across rounds (not reset in `startOnlineRound()`)
- **Mode Selection UI**: New phase with Regular/Hidden buttons shown after clicking "Create Game"
- **Piece Hiding Logic**: `shouldHidePiece(owner, value)` checks if piece should display as "?"
  - Returns true if: gameMode is "hidden" AND pieces not revealed AND piece is opponent's 1 or 10
- **Tray Display Order**: `getTrayDisplayOrder(owner)` returns piece values in display order
  - Regular mode: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  - Hidden mode: [2, 3, 4, 5, 6, 7, 8, 9, hiddenOrder[0], hiddenOrder[1]]
- **Rendering**: Modified `drawBevelTri()` to accept `isHidden` parameter and display "?" when true
  - Tray rendering uses display order to position pieces
- **Click Handling**: Tray click detection uses display order to select correct piece
- **Reveal Sequence**: `beginRevealOnline()` sets `hiddenPiecesRevealed = true` and pauses 300ms before golden triangle
- **Network**: Client sends `gameMode` when creating room, receives it in `room_created`, `room_joined`, and `game_start` messages
- **State Preservation**: `startOnlineMatch()` preserves `gameMode` and initializes hidden orders when resetting state

### Server-Side (`server/server.js`)
- **Room State**: Added `gameMode` field to room state (defaults to "regular")
- **Create Room**: Accepts `gameMode` from client, stores in room, sends back in response
- **Join Room**: Sends room's `gameMode` to joining player
- **Game Start**: Broadcasts `gameMode` to both players when game begins

### Key Functions
- `getTrayDisplayOrder(owner)` - Returns array of piece values in tray display order (2-9, then randomized 1 and 10 in hidden mode)
- `shouldHidePiece(pieceOwner, pieceValue)` - Determines if piece should be hidden
- `beginRevealOnline(goldenSlot, ...)` - Handles piece reveal before golden triangle
- `continueRevealOnline(goldenSlot)` - Continues reveal sequence after hidden pieces shown

## Files Modified
- `index.html` - Online game client (mode selection UI, hiding logic, rendering)
- `server/server.js` - Game server (gameMode storage and broadcasting)
- `golden-triangle.html` - **NOT modified** (hotseat game remains unchanged)

## Notes
- Hidden mode is **only available for online games**, not hotseat
- Hidden pieces are revealed once per round (at the end, before scoring)
- Mode selection happens before room creation (not after)
- Server must be restarted after code changes to take effect

## Update History

### 2026-02-16: Randomized Hidden Piece Positioning
**Problem**: In the original implementation, hidden pieces (1 and 10) appeared in their natural positions in the tray. This allowed players to deduce which hidden piece their opponent was playing based on its position (e.g., if they clicked the first piece, it must be their 1).

**Solution**:
- Hidden pieces now appear **after piece 9** in the tray display: 2, 3, 4, 5, 6, 7, 8, 9, ?, ?
- Each player receives **independent randomization** of whether the two question marks represent [1, 10] or [10, 1]
- Randomization is set at game start and **preserved across both rounds**
- Prevents positional deduction entirely while maintaining the hidden property

**Implementation Details**:
- Added `whiteHiddenOrder` and `blackHiddenOrder` state fields (arrays containing [1,10] or [10,1])
- Created `getTrayDisplayOrder(owner)` function to return correct piece order for rendering
- Updated `drawTrays()` to use display order instead of natural array order
- Updated tray click handling to map clicks to correct piece values using display order
- Randomization initialized in `startOnlineMatch()` when gameMode is "hidden"
- Order preserved in `startOnlineRound()` (not reset between rounds)
