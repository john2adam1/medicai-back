"use client";

import React, { useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import { ScenarioSelection } from '@/components/ScenarioSelection';
import { VitalMonitor } from '@/components/VitalMonitor';
import { PatientVisualizer } from '@/components/PatientVisualizer';
import { ChatInterface } from '@/components/ChatInterface';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Clock,
  RotateCcw,
  ArrowLeft,
  AlertTriangle,
  Heart,
  ChevronRight,
  Activity
} from 'lucide-react';

export default function Home() {
  const {
    scenario,
    currentStats,
    isAlive,
    score,
    elapsedMinutes,
    isGameOver,
    gameOverReason,
    setScenario,
    resetGame,
    initialize
  } = useGameStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const progress = scenario ? (elapsedMinutes / scenario.time_limit_minutes) * 100 : 0;

  return (
    <main className="min-h-screen bg-bg-primary text-text-primary overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-accent-secondary/5 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-grid opacity-20" />
      </div>

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {!scenario ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-12"
            >
              <ScenarioSelection onSelect={(s) => setScenario(s)} />
            </motion.div>
          ) : (
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-screen"
            >
              {/* Top Navigation */}
              <header className="glass-card-sm rounded-none border-x-0 border-t-0 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={resetGame}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors text-text-muted hover:text-text-primary"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-primary">MedicAI Simulation</span>
                      <ChevronRight className="w-3 h-3 text-text-muted" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">{scenario.difficulty}</span>
                    </div>
                    <h2 className="text-lg font-black tracking-tight">{scenario.title}</h2>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="hidden md:block">
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-1">Elapsed Time</div>
                        <div className="flex items-center gap-2 justify-end">
                          <Clock className="w-3.5 h-3.5 text-accent-info" />
                          <span className="text-sm font-mono font-bold">{elapsedMinutes} / {scenario.time_limit_minutes}m</span>
                        </div>
                      </div>
                      <div className="text-right border-l border-white/10 pl-6">
                        <div className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-1">Score</div>
                        <div className="flex items-center gap-2 justify-end">
                          <Trophy className="w-3.5 h-3.5 text-accent-warning" />
                          <span className="text-sm font-mono font-bold text-accent-warning">{score}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={resetGame}
                    className="p-2.5 bg-bg-secondary hover:bg-bg-card-hover rounded-xl transition-all group border border-white/5"
                  >
                    <RotateCcw className="w-5 h-5 text-text-muted group-hover:rotate-180 transition-transform duration-500" />
                  </button>
                </div>
              </header>

              {/* Main Workspace */}
              <div className="flex-1 flex overflow-hidden">
                {/* Left Side: Vitals & Visualizer */}
                <aside className="w-[300px] lg:w-[350px] border-r border-white/5 flex flex-col bg-bg-primary/50 overflow-y-auto">
                  <div className="p-4 space-y-4">
                    <div className="glass-card overflow-hidden">
                      <div className="p-3 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-accent-primary" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Bemor Holati</span>
                        </div>
                        <div className={`status-dot ${isAlive ? 'status-alive' : 'status-dead'}`} />
                      </div>
                      <PatientVisualizer />
                    </div>

                    <VitalMonitor stats={currentStats} />
                  </div>
                </aside>

                {/* Right Side: Chat Interface */}
                <section className="flex-1 flex flex-col min-w-0 bg-bg-secondary/20">
                  <div className="flex-1 relative">
                    <ChatInterface />
                  </div>
                </section>
              </div>

              {/* Progress Footer */}
              <div className="h-1 w-full bg-bg-secondary overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-accent-primary to-accent-info"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Over Modal */}
        <AnimatePresence>
          {isGameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-primary/95 backdrop-blur-xl"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="glass-card w-full max-sm p-10 text-center border-border-glow shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-primary to-transparent" />

                <div className={`w-24 h-24 rounded-3xl mx-auto flex items-center justify-center mb-8 rotate-12 transition-transform hover:rotate-0 duration-500 ${isAlive ? 'bg-accent-primary/10 text-accent-primary' : 'bg-accent-danger/10 text-accent-danger'}`}>
                  {isAlive ? <Trophy className="w-12 h-12" /> : <AlertTriangle className="w-12 h-12" />}
                </div>

                <h2 className="text-3xl font-black mb-3 tracking-tighter uppercase">
                  {isAlive ? 'Ssenariy Yakunlandi' : 'Klinik O\'lim'}
                </h2>
                <p className="text-text-secondary mb-10 text-sm leading-relaxed">
                  {gameOverReason || (isAlive ? "Siz bemorni stabilizatsiya qilishga muvaffaq bo'ldingiz." : "Afsuski, bemor hayotdan ko'z yumdi.")}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="p-5 bg-white/5 rounded-3xl border border-white/5">
                    <div className="text-[10px] text-text-muted font-black uppercase mb-1 tracking-widest">Natija</div>
                    <div className="text-2xl font-mono font-black text-accent-warning">{score}</div>
                  </div>
                  <div className="p-5 bg-white/5 rounded-3xl border border-white/5">
                    <div className="text-[10px] text-text-muted font-black uppercase mb-1 tracking-widest">Vaqt</div>
                    <div className="text-2xl font-mono font-black text-accent-info">{elapsedMinutes}m</div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <button onClick={resetGame} className="btn-primary w-full py-5 text-base rounded-2xl">
                    QAYTA BOSHLASH
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Floating Branding */}
      {!scenario && (
        <footer className="fixed bottom-8 left-0 w-full text-center pointer-events-none opacity-40">
          <div className="flex items-center justify-center gap-3">
            <Heart className="w-5 h-5 fill-accent-primary text-accent-primary animate-heartbeat" />
            <span className="text-sm font-black tracking-[0.3em] uppercase">MedicAI Simulation Core v2.0</span>
          </div>
        </footer>
      )}
    </main>
  );
}
