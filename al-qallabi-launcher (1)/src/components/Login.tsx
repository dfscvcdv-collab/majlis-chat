import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "motion/react";

const COLORS = ["#00f3ff", "#bc13fe", "#ff0055", "#39ff14", "#ffaa00"];

export default function Login({ onLogin }: { onLogin: (u: string, c: string) => void }) {
  const [username, setUsername] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim(), selectedColor);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-bg-main">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-accent-cyan/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-accent-magenta/5 blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass relative w-full max-w-md rounded-2xl p-10 shadow-2xl"
      >
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black tracking-widest neon-text uppercase">AL-QALLABI</h1>
          <p className="mt-2 text-xs uppercase tracking-[0.3em] text-text-secondary">Gaming Launcher</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <Label htmlFor="username" className="text-[10px] uppercase tracking-[0.2em] text-text-secondary">اسم المستخدم</Label>
            <Input 
              id="username"
              placeholder="أدخل اسمك هنا..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border-glass-border bg-white/5 text-center text-lg h-12 focus:border-accent-cyan/50 focus:ring-accent-cyan/20"
              autoFocus
            />
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] uppercase tracking-[0.2em] text-text-secondary">اختر لونك</Label>
            <div className="flex justify-center gap-4">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`h-8 w-8 rounded-full transition-all ${selectedColor === color ? "scale-125 ring-2 ring-accent-cyan ring-offset-4 ring-offset-bg-main" : "opacity-40 hover:opacity-100"}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={!username.trim()}
            className="btn-primary w-full h-14 text-lg"
          >
            دخول اللانشر
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
