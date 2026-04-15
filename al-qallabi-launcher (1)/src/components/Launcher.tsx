import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Socket } from "socket.io-client";
import { GAMES } from "../constants";
import { Game } from "../types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "motion/react";
import { Play, Users, Gamepad2, Settings, LogOut, Search, Keyboard } from "lucide-react";

export default function Launcher({ socket, user }: { socket: Socket | null; user: any }) {
  const [selectedGame, setSelectedGame] = useState<Game>(GAMES[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const filteredGames = GAMES.filter(g => 
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    g.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartGame = () => {
    const roomId = Math.random().toString(36).substring(7);
    navigate(`/lobby/${roomId}`);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentIndex = GAMES.findIndex(g => g.id === selectedGame.id);
      if (e.key === "ArrowDown") {
        const nextIndex = (currentIndex + 1) % GAMES.length;
        setSelectedGame(GAMES[nextIndex]);
      } else if (e.key === "ArrowUp") {
        const prevIndex = (currentIndex - 1 + GAMES.length) % GAMES.length;
        setSelectedGame(GAMES[prevIndex]);
      } else if (e.key === "Enter") {
        handleStartGame();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedGame]);

  return (
    <div className="grid h-screen w-screen grid-cols-[1fr_320px] grid-rows-[70px_1fr_60px] gap-[15px] p-[10px] bg-bg-main">
      {/* Header */}
      <header className="col-span-2 flex items-center justify-between px-5 glass rounded-xl">
        <div className="text-2xl font-black tracking-widest neon-text uppercase">
          AL-QALLABI | القلابي
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 border-r border-glass-border pr-5 mr-5">
            <span className="text-sm">أهلاً، <strong className="text-accent-cyan">{user.username}</strong></span>
            <div 
              className="h-8 w-8 rounded-full shadow-lg" 
              style={{ backgroundColor: user.color }}
            />
          </div>
          <div className="flex gap-4">
            <Button onClick={handleStartGame} className="btn-primary px-5 py-2 h-auto text-sm">إنشاء غرفة</Button>
            <Button variant="outline" className="btn-outline px-5 py-2 h-auto text-sm">دخول لغرفة</Button>
          </div>
        </div>
      </header>

      {/* Main Content: Game Details */}
      <main className="relative flex flex-col justify-center overflow-hidden rounded-2xl glass p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedGame.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-0"
          >
            <img 
              src={selectedGame.image} 
              alt="" 
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-bg-main/20 to-bg-main/90" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 max-w-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedGame.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
            >
              <div className="mb-2 text-sm font-bold tracking-[2px] uppercase text-accent-magenta">
                {selectedGame.category} | Multiplayer
              </div>
              <h1 className="mb-5 text-5xl font-extrabold leading-tight">
                {selectedGame.title}
              </h1>
              <p className="mb-8 text-base leading-relaxed text-text-secondary">
                {selectedGame.description}
              </p>
              
              <div className="mb-10 flex items-center gap-5 rounded-lg bg-black/30 p-4 border-r-4 border-accent-cyan">
                <div className="ml-5">
                  <div className="text-[10px] opacity-60 uppercase tracking-wider">Players</div>
                  <div className="font-bold">{selectedGame.minPlayers}-{selectedGame.maxPlayers}</div>
                </div>
                <div className="flex gap-2">
                  {Array.from({ length: selectedGame.maxPlayers }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`flex h-11 w-11 items-center justify-center rounded-full border-2 ${
                        i < selectedGame.minPlayers ? "border-accent-cyan bg-accent-cyan/10 text-accent-cyan" : "border-dashed border-text-secondary text-text-secondary"
                      }`}
                    >
                      {i < selectedGame.minPlayers ? "👤" : "+"}
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleStartGame}
                className="btn-primary h-auto px-12 py-4 text-xl"
              >
                ابدأ اللعب الآن
              </Button>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Right Sidebar: Game Library */}
      <aside className="flex flex-col gap-4 rounded-2xl glass p-5 overflow-hidden">
        <div className="flex items-center justify-between text-lg font-bold">
          <span>مكتبة الألعاب</span>
          <span className="text-xs text-accent-cyan">{GAMES.length} لعبة</span>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <input 
            type="text" 
            placeholder="بحث عن لعبة..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-glass-border bg-white/5 py-2 pl-10 pr-4 text-xs text-text-secondary focus:border-accent-cyan/50 focus:outline-none"
          />
        </div>
        
        <ScrollArea className="flex-1 pr-2">
          <div className="flex flex-col gap-2">
            {filteredGames.map((game) => (
              <button
                key={game.id}
                onClick={() => setSelectedGame(game)}
                className={`flex items-center gap-3 rounded-xl p-3 transition-all border ${
                  selectedGame.id === game.id 
                    ? "bg-accent-cyan/5 border-accent-cyan" 
                    : "bg-white/3 border-transparent hover:bg-white/5"
                }`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[#222] text-2xl">
                  {game.category.includes("Shooter") ? "🔫" : 
                   game.category.includes("Racing") ? "🏎️" : 
                   game.category.includes("Horror") ? "🪓" : 
                   game.category.includes("Social") ? "🤔" : "🎲"}
                </div>
                
                <div className="text-right">
                  <h4 className="text-sm font-bold">{game.title}</h4>
                  <span className="text-[11px] text-text-secondary">{game.category} • {game.maxPlayers} لاعبين</span>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* Footer */}
      <footer className="col-span-2 flex items-center justify-between px-5 text-xs text-text-secondary">
        <div className="flex items-center gap-2">
          التنقل: <span className="bg-[#333] px-1.5 py-0.5 rounded text-white font-mono">W</span> <span className="bg-[#333] px-1.5 py-0.5 rounded text-white font-mono">S</span> 
          | الاختيار: <span className="bg-[#333] px-1.5 py-0.5 rounded text-white font-mono">ENTER</span> 
          | العودة: <span className="bg-[#333] px-1.5 py-0.5 rounded text-white font-mono">ESC</span>
        </div>
        <div>نظام القلابي v2.0.4 | متصل: 1,240 لاعب</div>
      </footer>
    </div>
  );
}
