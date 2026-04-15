import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  // Real-time Lobby Logic
  const rooms = new Map();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", ({ roomId, username, color }) => {
      socket.join(roomId);
      
      if (!rooms.has(roomId)) {
        rooms.set(roomId, { players: [], selectedGameId: "the-outlier" });
      }
      
      const room = rooms.get(roomId);
      const existingPlayer = room.players.find((p: any) => p.id === socket.id);
      if (!existingPlayer) {
        const player = { id: socket.id, username, color, ready: false };
        room.players.push(player);
      }
      
      io.to(roomId).emit("room-update", { players: room.players, selectedGameId: room.selectedGameId });
      console.log(`${username} joined room ${roomId}`);
    });

    socket.on("change-game", ({ roomId, gameId }) => {
      const room = rooms.get(roomId);
      if (room) {
        room.selectedGameId = gameId;
        io.to(roomId).emit("room-update", { players: room.players, selectedGameId: room.selectedGameId });
      }
    });

    socket.on("toggle-ready", ({ roomId }) => {
      const room = rooms.get(roomId);
      if (room) {
        const player = room.players.find((p: any) => p.id === socket.id);
        if (player) {
          player.ready = !player.ready;
          io.to(roomId).emit("room-update", { players: room.players, selectedGameId: room.selectedGameId });
        }
      }
    });

    socket.on("start-game", ({ roomId, gameId }) => {
      io.to(roomId).emit("game-started", gameId);
    });

    socket.on("disconnect", () => {
      rooms.forEach((room, roomId) => {
        const playerIndex = room.players.findIndex((p: any) => p.id === socket.id);
        if (playerIndex !== -1) {
          const player = room.players[playerIndex];
          room.players.splice(playerIndex, 1);
          io.to(roomId).emit("room-update", { players: room.players, selectedGameId: room.selectedGameId });
          console.log(`${player.username} left room ${roomId}`);
          
          if (room.players.length === 0) {
            rooms.delete(roomId);
          }
        }
      });
    });

    // Game Specific Events
    socket.on("game-event", ({ roomId, event, data }) => {
      socket.to(roomId).emit("game-event", { event, data, senderId: socket.id });
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
