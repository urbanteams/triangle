"use strict";
const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Serve static files from parent directory (index.html, golden-triangle.html)
app.use(express.static(path.join(__dirname, "..")));

const PORT = process.env.PORT || 3000;

// ── Adjacency (copied from client) ─────────────────────────────
const ADJ = [
  [1, 6],          // 0
  [0, 2],          // 1
  [1, 3, 8],       // 2
  [2, 4],          // 3
  [3, 10],         // 4
  [6, 12],         // 5
  [0, 5, 7],       // 6
  [6, 8, 14],      // 7
  [2, 7, 9],       // 8
  [8, 10],         // 9
  [4, 9, 11],      // 10
  [10],            // 11
  [5, 13],         // 12
  [12, 14, 16],    // 13
  [7, 13, 15],     // 14
  [14, 18],        // 15
  [13, 17],        // 16
  [16, 18],        // 17
  [15, 17, 19],    // 18
  [18, 20],        // 19
  [19]             // 20
];

// ── Room Management ─────────────────────────────────────────────
const rooms = new Map();
const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1

function generateCode() {
  let code;
  do {
    code = "";
    for (let i = 0; i < 4; i++) code += CHARSET[Math.floor(Math.random() * CHARSET.length)];
  } while (rooms.has(code));
  return code;
}

function freshRoomState(gameMode = "regular") {
  return {
    round: 1,
    turnCount: 0,
    currentPlayer: 0,
    firstPlayer: 0,
    gameMode: gameMode, // "regular" or "hidden"
    board: new Array(21).fill(null),
    usedWhite: new Array(10).fill(false), // index 0 = value 1, etc.
    usedBlack: new Array(10).fill(false),
    scores: [0, 0],
    roundScores: [0, 0],
    goldenSlot: -1,
    advanceAck: [false, false],
    phase: "playing" // playing, reveal, roundResult, gameOver
  };
}

function send(ws, msg) {
  if (ws && ws.readyState === 1) {
    ws.send(JSON.stringify(msg));
  }
}

function broadcast(room, msg) {
  for (const ws of room.players) {
    send(ws, msg);
  }
}

function computeScoring(gameState) {
  const emptySlot = gameState.board.indexOf(null);
  gameState.goldenSlot = emptySlot;

  const adj = ADJ[emptySlot];
  gameState.roundScores = [0, 0];
  for (const a of adj) {
    if (gameState.board[a]) {
      const piece = gameState.board[a];
      gameState.roundScores[piece.owner] += piece.value;
    }
  }
  gameState.scores[0] += gameState.roundScores[0];
  gameState.scores[1] += gameState.roundScores[1];
}

// ── Stale Room Cleanup (every 60s) ─────────────────────────────
setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms) {
    const connected = room.players.filter(ws => ws && ws.readyState === 1).length;
    if (connected < 2 && now - room.created > 30 * 60 * 1000) {
      rooms.delete(code);
    }
  }
}, 60000);

// ── WebSocket Handling ──────────────────────────────────────────
wss.on("connection", (ws) => {
  ws._roomCode = null;
  ws._playerIndex = -1;
  ws._alive = true;

  ws.on("pong", () => { ws._alive = true; });

  ws.on("message", (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    switch (msg.type) {
      case "ping":
        send(ws, { type: "pong" });
        break;

      case "create_room": {
        const code = generateCode();
        const firstPlayer = Math.random() < 0.5 ? 0 : 1;
        const gameMode = msg.gameMode || "regular"; // Get game mode from client
        const gameState = freshRoomState(gameMode);
        gameState.firstPlayer = firstPlayer;
        gameState.currentPlayer = firstPlayer;

        const room = {
          players: [ws, null], // index 0 = creator (White), index 1 = joiner (Black)
          state: gameState,
          created: Date.now()
        };
        rooms.set(code, room);

        ws._roomCode = code;
        ws._playerIndex = 0;

        send(ws, { type: "room_created", code, playerIndex: 0, gameMode });
        break;
      }

      case "join_room": {
        const code = (msg.code || "").toUpperCase().trim();
        const room = rooms.get(code);

        if (!room) {
          send(ws, { type: "error", message: "Room not found" });
          break;
        }
        if (room.players[1] && room.players[1].readyState === 1) {
          send(ws, { type: "error", message: "Room is full" });
          break;
        }

        room.players[1] = ws;
        ws._roomCode = code;
        ws._playerIndex = 1;

        send(ws, { type: "room_joined", code, playerIndex: 1, gameMode: room.state.gameMode });

        // Notify both players game is starting
        broadcast(room, {
          type: "game_start",
          firstPlayer: room.state.firstPlayer,
          gameMode: room.state.gameMode
        });
        break;
      }

      case "select_piece": {
        const room = rooms.get(ws._roomCode);
        if (!room) break;
        const opponent = room.players[1 - ws._playerIndex];
        send(opponent, {
          type: "opponent_selected",
          value: msg.value,
          playerIndex: ws._playerIndex
        });
        break;
      }

      case "place_piece": {
        const room = rooms.get(ws._roomCode);
        if (!room) break;
        const gs = room.state;

        if (gs.phase !== "playing") break;

        // Validate turn
        if (ws._playerIndex !== gs.currentPlayer) {
          send(ws, { type: "error", message: "Not your turn" });
          break;
        }

        const slotId = msg.slotId;
        const value = msg.value;

        // Validate slot
        if (slotId < 0 || slotId > 20 || gs.board[slotId] !== null) {
          send(ws, { type: "error", message: "Invalid slot" });
          break;
        }

        // Validate piece
        const used = ws._playerIndex === 0 ? gs.usedWhite : gs.usedBlack;
        if (value < 1 || value > 10 || used[value - 1]) {
          send(ws, { type: "error", message: "Invalid piece" });
          break;
        }

        // Apply placement
        gs.board[slotId] = { owner: ws._playerIndex, value };
        used[value - 1] = true;
        gs.turnCount++;

        const is20th = gs.turnCount === 20;

        if (!is20th) {
          gs.currentPlayer = 1 - gs.currentPlayer;
        }

        // Broadcast placement to both players
        broadcast(room, {
          type: "piece_placed",
          slotId,
          value,
          owner: ws._playerIndex,
          turnCount: gs.turnCount,
          nextPlayer: is20th ? -1 : gs.currentPlayer
        });

        // 20th placement → compute scoring and send result
        if (is20th) {
          gs.phase = "reveal";
          computeScoring(gs);

          // Send round result after a short delay for reveal animation
          setTimeout(() => {
            gs.phase = "roundResult";
            gs.advanceAck = [false, false];
            broadcast(room, {
              type: "round_result",
              goldenSlot: gs.goldenSlot,
              roundScores: gs.roundScores,
              totalScores: [...gs.scores],
              round: gs.round
            });
          }, 1200);
        }
        break;
      }

      case "advance_round": {
        const room = rooms.get(ws._roomCode);
        if (!room) break;
        const gs = room.state;

        if (gs.phase !== "roundResult") break;

        gs.advanceAck[ws._playerIndex] = true;

        // Wait for both players to acknowledge
        if (gs.advanceAck[0] && gs.advanceAck[1]) {
          if (gs.round < 2) {
            // Start round 2
            gs.round = 2;
            gs.board = new Array(21).fill(null);
            gs.usedWhite = new Array(10).fill(false);
            gs.usedBlack = new Array(10).fill(false);
            gs.turnCount = 0;
            gs.goldenSlot = -1;
            gs.roundScores = [0, 0];
            gs.currentPlayer = 1 - gs.firstPlayer;
            gs.phase = "playing";
            gs.advanceAck = [false, false];

            broadcast(room, {
              type: "round_start",
              round: 2,
              firstPlayer: gs.currentPlayer
            });
          } else {
            // Game over
            gs.phase = "gameOver";
            let winner = -1;
            if (gs.scores[0] > gs.scores[1]) winner = 0;
            else if (gs.scores[1] > gs.scores[0]) winner = 1;

            broadcast(room, {
              type: "game_over",
              totalScores: [...gs.scores],
              winner
            });

            // Clean up room after a delay
            setTimeout(() => {
              rooms.delete(ws._roomCode);
            }, 5000);
          }
        }
        break;
      }
    }
  });

  ws.on("close", () => {
    const room = rooms.get(ws._roomCode);
    if (!room) return;

    // Notify opponent
    const idx = ws._playerIndex;
    const opponent = room.players[1 - idx];
    if (opponent && opponent.readyState === 1) {
      send(opponent, { type: "opponent_disconnected" });
    }

    room.players[idx] = null;

    // Destroy room if both disconnected
    const connected = room.players.filter(p => p && p.readyState === 1).length;
    if (connected === 0) {
      rooms.delete(ws._roomCode);
    }
  });
});

// Keep-alive ping from server side
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws._alive) { ws.terminate(); return; }
    ws._alive = false;
    ws.ping();
  });
}, 30000);

server.listen(PORT, () => {
  console.log(`Golden Triangle server running on http://localhost:${PORT}`);
});
