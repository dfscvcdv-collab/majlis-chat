import { useState, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { Player } from "../../types";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import { Crosshair, Target, Zap } from "lucide-react";

export default function CyberStrike({ 
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
  const [score, setScore] = useState(0);
  const [targets, setTargets] = useState<{ id: number; x: number; y: number }[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const spawnTarget = () => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    const newTarget = {
      id: Date.now(),
      x: Math.random() * (width - 100) + 50,
      y: Math.random() * (height - 100) + 50,
    };
    setTargets(prev => [...prev, newTarget]);
    
    // Auto remove after 2 seconds
    setTimeout(() => {
      setTargets(prev => prev.filter(t => t.id !== newTarget.id));
    }, 2000);
  };

  useEffect(() => {
    let interval: any;
    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        if (Math.random() > 0.6) spawnTarget();
      }, 1000);
    } else if (timeLeft === 0) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeLeft]);

  const handleHit = (id: number) => {
    setScore(prev => prev + 100);
    setTargets(prev => prev.filter(t => t.id !== id));
    
    // Broadcast score to others
    socket?.emit("game-event", { roomId, event: "score-update", data: { score: score + 100 } });
  };

  return (
    <div 
      ref={containerRef}
      className="relative h-full w-full cursor-crosshair overflow-hidden bg-[url('https://picsum.photos/seed/cyber/1920/1080?blur=10')] bg-cover bg-center"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* HUD */}
      <div className="absolute left-1/2 top-12 z-10 flex -translate-x-1/2 items-center gap-12 rounded-2xl border border-glass-border bg-black/40 px-12 py-6 backdrop-blur-xl">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-widest text-text-secondary">Score</p>
          <p className="text-4xl font-black text-accent-cyan tracking-tighter">{score}</p>
        </div>
        <div className="h-12 w-px bg-glass-border" />
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-widest text-text-secondary">Time</p>
          <p className={`text-4xl font-black tracking-tighter ${timeLeft < 10 ? "text-accent-magenta animate-pulse" : "text-white"}`}>
            00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
          </p>
        </div>
      </div>

      {!isPlaying && timeLeft === 30 && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <h2 className="mb-4 text-6xl font-black uppercase tracking-tighter neon-text">Cyber Strike</h2>
            <p className="mb-8 text-text-secondary">أثبت مهارتك في التصويب! أسرع واحد يجيب هيدشوت يفوز</p>
            <Button 
              onClick={() => setIsPlaying(true)}
              className="btn-primary h-16 px-12 text-xl font-black uppercase"
            >
              ابدأ التحدي
            </Button>
          </div>
        </div>
      )}

      {timeLeft === 0 && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/90">
          <div className="text-center">
            <Trophy className="mx-auto mb-6 h-24 w-24 text-yellow-400" />
            <h2 className="mb-2 text-6xl font-black uppercase tracking-tighter">انتهى الوقت!</h2>
            <p className="mb-8 text-2xl text-text-secondary font-bold">نتيجتك النهائية: <span className="text-accent-cyan">{score}</span></p>
            <Button 
              onClick={() => { setTimeLeft(30); setScore(0); }}
              className="bg-white text-black hover:bg-white/80 rounded-md px-8 py-2 h-auto font-bold"
            >
              إعادة المحاولة
            </Button>
          </div>
        </div>
      )}

      {/* Targets */}
      <AnimatePresence>
        {targets.map((target) => (
          <motion.button
            key={target.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            onClick={() => handleHit(target.id)}
            className="absolute z-10 flex h-16 w-16 items-center justify-center"
            style={{ left: target.x, top: target.y }}
          >
            <div className="relative flex h-full w-full items-center justify-center">
              <div className="absolute h-full w-full animate-ping rounded-full border-2 border-accent-cyan/40" />
              <div className="h-full w-full rounded-full border-4 border-accent-cyan bg-accent-cyan/10 shadow-[0_0_20px_rgba(0,243,255,0.5)]" />
              <div className="absolute h-2 w-2 rounded-full bg-accent-cyan" />
            </div>
          </motion.button>
        ))}
      </AnimatePresence>

      {/* Crosshair Overlay */}
      <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center opacity-20">
        <div className="relative h-12 w-12">
          <div className="absolute left-1/2 top-0 h-4 w-0.5 -translate-x-1/2 bg-accent-cyan" />
          <div className="absolute left-1/2 bottom-0 h-4 w-0.5 -translate-x-1/2 bg-accent-cyan" />
          <div className="absolute left-0 top-1/2 h-0.5 w-4 -translate-y-1/2 bg-accent-cyan" />
          <div className="absolute right-0 top-1/2 h-0.5 w-4 -translate-y-1/2 bg-accent-cyan" />
        </div>
      </div>
    </div>
  );
}

function Trophy(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 22V18" />
      <path d="M14 22V18" />
      <path d="M12 15a7 7 0 0 0 7-7V4H5v4a7 7 0 0 0 7 7z" />
    </svg>
  );
}
