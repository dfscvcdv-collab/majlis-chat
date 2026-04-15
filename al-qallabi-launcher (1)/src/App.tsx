/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import Launcher from "./components/Launcher";
import Lobby from "./components/Lobby";
import GameContainer from "./components/GameContainer";
import Login from "./components/Login";
import { Player, Game } from "./types";

function AppContent() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [user, setUser] = useState<{ username: string; color: string } | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string>("the-outlier");
  const location = useLocation();

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on("room-update", ({ players: updatedPlayers, selectedGameId: gameId }: { players: Player[], selectedGameId: string }) => {
      setPlayers(updatedPlayers);
      setSelectedGameId(gameId);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem("qallabi-user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Handle room joining based on URL
  useEffect(() => {
    if (socket && user) {
      const pathParts = location.pathname.split("/");
      const roomId = pathParts[pathParts.length - 1];
      const isLobby = location.pathname.includes("/lobby/");
      const isGame = location.pathname.includes("/game/");

      if ((isLobby || isGame) && roomId) {
        socket.emit("join-room", { roomId, username: user.username, color: user.color });
      }
    }
  }, [socket, user, location.pathname]);

  if (!user) {
    return <Login onLogin={(u, c) => {
      setUser({ username: u, color: c });
      localStorage.setItem("qallabi-user", JSON.stringify({ username: u, color: c }));
    }} />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-bg-main text-white selection:bg-accent-cyan/30">
      <Routes>
        <Route 
          path="/" 
          element={<Launcher socket={socket} user={user} />} 
        />
        <Route 
          path="/lobby/:roomId" 
          element={
            <Lobby 
              socket={socket} 
              user={user} 
              players={players} 
              selectedGameId={selectedGameId}
              onLeave={() => {}}
            />
          } 
        />
        <Route 
          path="/game/:gameId/:roomId" 
          element={<GameContainer socket={socket} user={user} players={players} />} 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

