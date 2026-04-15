import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Socket } from "socket.io-client";
import { GAMES } from "../constants";
import { Player } from "../types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "motion/react";
import { Users, ArrowLeft, Play, Copy, CheckCircle2, MessageSquare } from "lucide-react";

export default function Lobby({ 
  socket, 
  user, 
  players, 
  selectedGameId,
  onLeave 
}: { 
  socket: Socket | null; 
  user: any; 
  players: Player[];
  selectedGameId: string;
  onLeave: () => void;
}) {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [messages, setMessages] = useState<{ user: string; text: string; color: string }[]>([]);
  const [chatInput, setChatInput] = useState("");

  const game = GAMES.find(g => g.id === selectedGameId) || GAMES[0];

  useEffect(() => {
    if (socket && roomId) {
      socket.on("game-started", (startedGameId) => {
        navigate(`/game/${startedGameId}/${roomId}`);
      });

      socket.on("game-event", ({ event, data }) => {
        if (event === "chat") {
          setMessages(prev => [...prev, data]);
        }
      });
    }

    return () => {
      socket?.off("game-started");
      socket?.off("game-event");
    };
  }, [socket, roomId, navigate]);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/lobby/${roomId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleReady = () => {
    socket?.emit("toggle-ready", { roomId });
  };

  const handleStartGame = () => {
    socket?.emit("start-game", { roomId, gameId: game.id });
  };

  const handleChangeGame = (direction: "next" | "prev") => {
    const currentIndex = GAMES.findIndex(g => g.id === selectedGameId);
    let nextIndex;
    if (direction === "next") {
      nextIndex = (currentIndex + 1) % GAMES.length;
    } else {
      nextIndex = (currentIndex - 1 + GAMES.length) % GAMES.length;
    }
    socket?.emit("change-game", { roomId, gameId: GAMES[nextIndex].id });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim() && socket) {
      const msg = { user: user.username, text: chatInput.trim(), color: user.color };
      socket.emit("game-event", { roomId, event: "chat", data: msg });
      setMessages(prev => [...prev, msg]);
      setChatInput("");
    }
  };

  const isAllReady = players.length >= game.minPlayers && players.every(p => p.ready);
  const isHost = players[0]?.id === socket?.id;

  return (
    <div className="flex h-screen w-screen flex-col bg-bg-main p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => { onLeave(); navigate("/"); }}
          className="text-text-secondary hover:text-white hover:bg-white/5"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          العودة للمكتبة
        </Button>

        <div className="text-center">
          <h2 className="text-2xl font-black uppercase tracking-widest neon-text">LOBBY SYSTEM</h2>
          <p className="text-xs text-text-secondary">Room ID: {roomId}</p>
        </div>

        <Button 
          onClick={handleCopyLink}
          className="btn-outline px-6 py-2 h-auto"
        >
          {copied ? <CheckCircle2 className="mr-2 h-4 w-4 text-accent-cyan" /> : <Copy className="mr-2 h-4 w-4" />}
          {copied ? "تم النسخ" : "نسخ رابط الغرفة"}
        </Button>
      </div>

      <div className="grid flex-1 grid-cols-12 gap-8 overflow-hidden">
        {/* Left: Game Info & Players */}
        <div className="col-span-8 flex flex-col gap-8">
          <Card className="glass overflow-hidden border-glass-border">
            <div className="flex h-48">
              <img 
                src={game.image} 
                alt="" 
                className="w-1/3 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-1 flex-col justify-center p-8">
                <div className="flex items-center justify-between">
                  <div className="mb-2 text-sm font-bold tracking-[2px] uppercase text-accent-magenta">
                    {game.category} | Multiplayer
                  </div>
                  {isHost && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-text-secondary uppercase font-bold mr-2">تغيير اللعبة:</span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleChangeGame("prev")}
                        className="h-8 w-8 p-0 border-glass-border bg-white/5"
                      >
                        {"<"}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleChangeGame("next")}
                        className="h-8 w-8 p-0 border-glass-border bg-white/5"
                      >
                        {">"}
                      </Button>
                    </div>
                  )}
                </div>
                <h3 className="text-3xl font-extrabold uppercase">{game.title}</h3>
                <p className="mt-2 text-sm text-text-secondary">{game.description}</p>
              </div>
            </div>
          </Card>

          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-text-secondary">
                <Users className="h-4 w-4" />
                Players ({players.length}/{game.maxPlayers})
              </h4>
              <p className="text-xs text-text-secondary/40">Min players required: {game.minPlayers}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {players.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
                    player.ready ? "border-accent-cyan/30 bg-accent-cyan/5" : "border-glass-border bg-white/3"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="h-10 w-10 rounded-full border-2 border-white/20 shadow-lg" 
                      style={{ backgroundColor: player.color }}
                    />
                    <div>
                      <p className="font-bold">{player.username} {index === 0 && <span className="text-[10px] text-accent-cyan ml-1">(HOST)</span>}</p>
                      <p className={`text-[10px] uppercase font-bold ${player.ready ? "text-accent-cyan" : "text-text-secondary/40"}`}>
                        {player.ready ? "Ready" : "Waiting..."}
                      </p>
                    </div>
                  </div>
                  {player.ready && <CheckCircle2 className="h-5 w-5 text-accent-cyan" />}
                </motion.div>
              ))}
              
              {Array.from({ length: game.maxPlayers - players.length }).map((_, i) => (
                <div key={i} className="flex items-center justify-center rounded-xl border border-dashed border-glass-border bg-transparent p-4">
                  <p className="text-xs text-text-secondary/20 uppercase tracking-widest">Open Slot</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              onClick={handleToggleReady}
              className={`h-16 flex-1 text-xl font-black uppercase transition-all ${
                players.find(p => p.id === socket?.id)?.ready 
                  ? "bg-white/5 text-white hover:bg-white/10 border border-glass-border" 
                  : "btn-primary"
              }`}
            >
              {players.find(p => p.id === socket?.id)?.ready ? "Unready" : "I'm Ready"}
            </Button>

            {isHost && (
              <Button 
                disabled={!isAllReady}
                onClick={handleStartGame}
                className={`h-16 flex-1 text-xl font-black uppercase ${
                  isAllReady ? "bg-accent-magenta text-white hover:bg-accent-magenta/80 shadow-[0_0_20px_rgba(255,0,255,0.3)]" : "bg-white/3 text-text-secondary/20"
                }`}
              >
                <Play className="mr-2 h-6 w-6 fill-current" />
                Start Game
              </Button>
            )}
          </div>
        </div>

        {/* Right: Chat */}
        <div className="col-span-4 flex flex-col overflow-hidden rounded-2xl glass">
          <div className="flex items-center gap-2 border-b border-glass-border p-4">
            <MessageSquare className="h-4 w-4 text-accent-cyan" />
            <h4 className="text-xs font-bold uppercase tracking-widest">Lobby Chat</h4>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase" style={{ color: msg.color }}>{msg.user}</span>
                  </div>
                  <p className="text-sm text-white/80">{msg.text}</p>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center py-12 text-center opacity-20">
                  <MessageSquare className="mb-2 h-8 w-8" />
                  <p className="text-xs">No messages yet</p>
                </div>
              )}
            </div>
          </ScrollArea>

          <form onSubmit={handleSendMessage} className="border-t border-glass-border p-4">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Type a message..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 rounded-lg border border-glass-border bg-white/5 px-4 py-2 text-sm focus:border-accent-cyan/50 focus:outline-none"
              />
              <Button type="submit" size="icon" className="bg-accent-cyan text-black hover:bg-accent-cyan/80">
                <Play className="h-4 w-4 fill-current" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
