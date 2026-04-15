import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import { Player } from "../../types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "motion/react";
import { TrendingUp, TrendingDown, Coins } from "lucide-react";

export default function HighLow({ 
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
  const [currentNumber, setCurrentNumber] = useState(50);
  const [nextNumber, setNextNumber] = useState<number | null>(null);
  const [prediction, setPrediction] = useState<"high" | "low" | null>(null);
  const [result, setResult] = useState<"win" | "loss" | null>(null);
  const [points, setPoints] = useState(1000);

  const handlePredict = (type: "high" | "low") => {
    setPrediction(type);
    const next = Math.floor(Math.random() * 100) + 1;
    setNextNumber(next);
    
    const isHigh = next > currentNumber;
    const win = (type === "high" && isHigh) || (type === "low" && !isHigh);
    
    setResult(win ? "win" : "loss");
    setPoints(prev => win ? prev + 100 : prev - 100);

    setTimeout(() => {
      setCurrentNumber(next);
      setNextNumber(null);
      setPrediction(null);
      setResult(null);
    }, 2000);
  };

  return (
    <div className="flex h-full flex-col items-center justify-center p-8">
      <div className="mb-12 text-center">
        <h2 className="text-5xl font-black uppercase tracking-tighter neon-text">فوق ولا تحت؟</h2>
        <p className="text-text-secondary">توقع الرقم القادم: هل سيكون أعلى أم أقل من {currentNumber}؟</p>
      </div>

      <div className="relative mb-16 flex items-center gap-12">
        <Card className="glass flex h-64 w-64 items-center justify-center border-accent-cyan/30 text-8xl font-black shadow-[0_0_50px_rgba(0,243,255,0.1)]">
          {currentNumber}
        </Card>

        <div className="flex flex-col gap-4">
          <Button 
            onClick={() => handlePredict("high")}
            disabled={prediction !== null}
            className="h-24 w-48 btn-primary text-2xl font-black"
          >
            <TrendingUp className="mr-2 h-8 w-8" />
            فوق
          </Button>
          <Button 
            onClick={() => handlePredict("low")}
            disabled={prediction !== null}
            className="h-24 w-48 bg-accent-magenta text-white hover:bg-accent-magenta/80 rounded-md text-2xl font-black shadow-[0_0_20px_rgba(255,0,255,0.2)]"
          >
            <TrendingDown className="mr-2 h-8 w-8" />
            تحت
          </Button>
        </div>

        <AnimatePresence>
          {nextNumber !== null && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className={`absolute -right-72 flex h-64 w-64 items-center justify-center rounded-2xl border-4 text-8xl font-black ${
                result === "win" ? "border-accent-cyan bg-accent-cyan/10 text-accent-cyan" : "border-accent-magenta bg-accent-magenta/10 text-accent-magenta"
              }`}
            >
              {nextNumber}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-4 rounded-full bg-white/5 px-8 py-4 border border-glass-border">
        <Coins className="h-6 w-6 text-yellow-400" />
        <span className="text-2xl font-black tracking-tighter">{points} PTS</span>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-8 text-4xl font-black uppercase tracking-widest ${
            result === "win" ? "text-accent-cyan" : "text-accent-magenta"
          }`}
        >
          {result === "win" ? "كفو! فزت" : "حظ أوفر!"}
        </motion.div>
      )}
    </div>
  );
}
