import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import { Player } from "../../types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "motion/react";
import { HelpCircle, UserX, CheckCircle2 } from "lucide-react";

const WORDS = ["برجر", "سيارة", "مدرسة", "طيارة", "بحر", "قهوة", "جوال", "كورة"];

export default function TheOutlier({ 
  socket, 
  roomId, 
  user, 
  players 
}: { 
  socket: Socket | null; 
  roomId: string; 
  user: any; 
  players: Player[];
}) {
  const [role, setRole] = useState<"player" | "outlier" | null>(null);
  const [word, setWord] = useState<string | null>(null);
  const [phase, setPhase] = useState<"reveal" | "discuss" | "vote" | "result">("reveal");
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [votedFor, setVotedFor] = useState<string | null>(null);

  useEffect(() => {
    if (socket) {
      // Host initializes the game
      if (players[0].id === socket.id) {
        const outlierIndex = Math.floor(Math.random() * players.length);
        const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
        
        socket.emit("game-event", { 
          roomId, 
          event: "setup-outlier", 
          data: { outlierId: players[outlierIndex].id, word: randomWord } 
        });
      }

      socket.on("game-event", ({ event, data }) => {
        if (event === "setup-outlier") {
          if (data.outlierId === socket.id) {
            setRole("outlier");
            setWord("أنت برا السالفة!");
          } else {
            setRole("player");
            setWord(data.word);
          }
        } else if (event === "vote-cast") {
          setVotes(prev => ({ ...prev, [data.targetId]: (prev[data.targetId] || 0) + 1 }));
        }
      });
    }

    return () => { socket?.off("game-event"); };
  }, [socket, roomId, players]);

  const handleVote = (targetId: string) => {
    if (votedFor) return;
    setVotedFor(targetId);
    socket?.emit("game-event", { roomId, event: "vote-cast", data: { targetId } });
  };

  return (
    <div className="flex h-full flex-col items-center justify-center p-8">
      <AnimatePresence mode="wait">
        {phase === "reveal" && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="text-center"
          >
            <h2 className="mb-8 text-2xl font-bold uppercase tracking-widest text-text-secondary">كلمتك السرية</h2>
            <Card className="glass flex h-64 w-96 flex-col items-center justify-center border-accent-cyan/30 p-12 shadow-[0_0_50px_rgba(0,243,255,0.2)]">
              <p className={`text-5xl font-black ${role === "outlier" ? "text-accent-magenta" : "text-accent-cyan"}`}>
                {word || "جاري التحميل..."}
              </p>
              {role === "outlier" && (
                <p className="mt-4 text-sm text-accent-magenta/60">حاول ترقع وما يبين أنك ما تدري!</p>
              )}
            </Card>
            <Button 
              onClick={() => setPhase("discuss")}
              className="mt-12 btn-primary px-8 py-2 h-auto"
            >
              فهمت، ابدأ النقاش
            </Button>
          </motion.div>
        )}

        {phase === "discuss" && (
          <motion.div
            key="discuss"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-4xl text-center"
          >
            <div className="mb-12">
              <h2 className="text-5xl font-black uppercase tracking-tighter">وقت النقاش</h2>
              <p className="text-white/40">اسألوا بعض أسئلة ذكية عشان تقفطون اللي برا السالفة</p>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {players.map((p) => (
                <Card key={p.id} className="glass border-white/5 p-6">
                  <div 
                    className="mx-auto mb-4 h-16 w-16 rounded-full border-4 border-white/10" 
                    style={{ backgroundColor: p.color }}
                  />
                  <p className="font-bold">{p.username}</p>
                  <p className="text-[10px] text-white/20 uppercase">Talking...</p>
                </Card>
              ))}
            </div>

            <Button 
              onClick={() => setPhase("vote")}
              className="mt-12 bg-accent-magenta text-white hover:bg-accent-magenta/80 rounded-md px-8 py-2 h-auto font-bold"
            >
              انتقل للتصويت
            </Button>
          </motion.div>
        )}

        {phase === "vote" && (
          <motion.div
            key="vote"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-4xl text-center"
          >
            <h2 className="mb-12 text-5xl font-black uppercase tracking-tighter">من هو اللي برا السالفة؟</h2>
            
            <div className="grid grid-cols-3 gap-6">
              {players.map((p) => (
                <button
                  key={p.id}
                  disabled={votedFor !== null || p.id === socket?.id}
                  onClick={() => handleVote(p.id)}
                  className={`group relative flex flex-col items-center rounded-2xl border p-6 transition-all ${
                    votedFor === p.id ? "border-accent-cyan bg-accent-cyan/10" : "border-glass-border bg-white/3 hover:border-white/20"
                  } ${p.id === socket?.id ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div 
                    className="mb-4 h-20 w-20 rounded-full border-4 border-white/10 transition-transform group-hover:scale-110" 
                    style={{ backgroundColor: p.color }}
                  />
                  <p className="font-bold">{p.username}</p>
                  <div className="mt-2 flex gap-1">
                    {Array.from({ length: votes[p.id] || 0 }).map((_, i) => (
                      <div key={i} className="h-2 w-2 rounded-full bg-accent-cyan" />
                    ))}
                  </div>
                  {votedFor === p.id && (
                    <div className="absolute -top-2 -right-2 rounded-full bg-accent-cyan p-1 text-black">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
