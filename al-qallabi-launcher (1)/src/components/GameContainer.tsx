import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Socket } from "socket.io-client";
import { GAMES } from "../constants";
import { Player } from "../types";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import { X, Trophy, MessageSquare, Users } from "lucide-react";

// Mini-game components
import TheOutlier from "./games/TheOutlier";
import HighLow from "./games/HighLow";
import CyberStrike from "./games/CyberStrike";

export default function GameContainer({ 
  socket, 
  user, 
  players 
}: { 
  socket: Socket | null; 
  user: any; 
  players: Player[];
}) {
  const { gameId, roomId } = useParams();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<any>(null);
  const [showChat, setShowChat] = useState(false);

  const game = GAMES.find(g => g.id === gameId);

  useEffect(() => {
    if (!game) navigate("/");
  }, [game, navigate]);

  const renderGame = () => {
    switch (gameId) {
      case "the-outlier":
        return <TheOutlier socket={socket} roomId={roomId!} user={user} players={players} />;
      case "high-low":
        return <HighLow socket={socket} roomId={roomId!} user={user} players={players} />;
      case "cyber-strike":
        return <CyberStrike socket={socket} roomId={roomId!} user={user} players={players} />;
      default:
        return (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-8 h-32 w-32 rounded-full bg-accent-cyan/10 p-8 text-accent-cyan animate-pulse">
              <Trophy className="h-full w-full" />
            </div>
            <h2 className="text-4xl font-black uppercase tracking-tighter">{game?.title}</h2>
            <p className="mt-4 text-text-secondary">هذه اللعبة قيد التطوير حالياً في نسخة البيتا</p>
            <Button 
              onClick={() => navigate("/")}
              className="mt-8 btn-primary px-8 py-2 h-auto"
            >
              العودة للانشر
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden">
      {/* Game Header / HUD Overlay */}
      <div className="absolute left-0 right-0 top-0 z-50 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent p-6">
        <div className="flex items-center gap-4">
          <div 
            className="h-10 w-10 rounded-full border-2 border-white/20" 
            style={{ backgroundColor: user.color }}
          />
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/60">{game?.title}</p>
            <p className="text-sm font-black">{user.username}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowChat(!showChat)}
            className="text-white/40 hover:text-white hover:bg-white/10"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/")}
            className="text-white/40 hover:text-accent-magenta hover:bg-accent-magenta/10"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="h-full w-full pt-20">
        {renderGame()}
      </div>

      {/* Players List Overlay */}
      <div className="absolute bottom-6 left-6 z-50 flex gap-2">
        {players.map((p) => (
          <div 
            key={p.id}
            className="group relative h-10 w-10 rounded-full border-2 border-white/20 transition-all hover:scale-110"
            style={{ backgroundColor: p.color }}
            title={p.username}
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black/80 px-2 py-1 text-[10px] font-bold opacity-0 transition-opacity group-hover:opacity-100">
              {p.username}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
