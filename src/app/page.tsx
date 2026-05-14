"use client";

import React, { useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import { ScenarioSelection } from '@/components/ScenarioSelection';
import { VitalMonitor } from '@/components/VitalMonitor';
import { ActionPanel } from '@/components/ActionPanel';
import { PatientVisualizer } from '@/components/PatientVisualizer';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Clock,
  RotateCcw,
  ArrowLeft,
  AlertTriangle,
  Heart,
  Stethoscope,
  ChevronRight
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
    resetGame
  } = useGameStore();

  // Progress bar calculation
  const progress = scenario ? (elapsedMinutes / scenario.time_limit_minutes) * 100 : 0;

  return (
    <main className="min-h-screen relative bg-bg-primary text-text-primary overflow-x-hidden pb-20">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-accent-secondary/5 blur-[150px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <AnimatePresence mode="wait">
          {!scenario ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-12"
            >
              <ScenarioSelection onSelect={(s) => setScenario(s)} />
            </motion.div>
          ) : (
            <motion.div
              key="game"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              {/* Header Info */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-card p-6 border-b-2 border-accent-primary/20">
                <div className="flex items-center gap-4">
                  <button
                    onClick={resetGame}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors text-text-muted hover:text-text-primary"
                    title="Bosh sahifaga qaytish"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-widest text-accent-primary">Simulyatsiya</span>
                      <ChevronRight className="w-3 h-3 text-text-muted" />
                      <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">{scenario.difficulty}</span>
                    </div>
                    <h2 className="text-2xl font-black">{scenario.title}</h2>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <div className="text-xs text-text-muted font-bold uppercase mb-1">Vaqt</div>
                    <div className="flex items-center gap-2 justify-end">
                      <Clock className="w-4 h-4 text-accent-info" />
                      <span className="text-xl font-mono font-bold tracking-tighter">
                        {elapsedMinutes} / {scenario.time_limit_minutes} <span className="text-xs text-text-muted">min</span>
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-text-muted font-bold uppercase mb-1">Ball</div>
                    <div className="flex items-center gap-2 justify-end">
                      <Trophy className="w-4 h-4 text-accent-warning" />
                      <span className="text-xl font-mono font-bold tracking-tighter text-accent-warning">
                        {score}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={resetGame}
                    className="p-3 bg-bg-secondary hover:bg-bg-card-hover rounded-xl transition-all group"
                  >
                    <RotateCcw className="w-5 h-5 text-text-muted group-hover:rotate-180 transition-transform duration-500" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="time-progress">
                <motion.div
                  className="time-progress-bar"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Left Side: Vitals & History */}
                <div className="lg:col-span-8 space-y-6">

                  {/* Presentation Bubble */}
                  <div className="glass-card-sm p-6 feedback-info border-l-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-accent-info/20 flex items-center justify-center flex-shrink-0">
                        <Stethoscope className="w-5 h-5 text-accent-info" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-bold text-sm text-accent-info uppercase">Birlamchi Ko'rik & Anamnez</h4>
                        <p className="text-sm leading-relaxed text-text-secondary">
                          {scenario.initial_presentation}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Vitals */}
                  <VitalMonitor stats={currentStats} />

                  {/* Action Panel */}
                  <div className="h-[500px]">
                    <ActionPanel />
                  </div>
                </div>

                {/* Right Side: Visualizer */}
                <div className="lg:col-span-4 sticky top-8">
                  <PatientVisualizer />
                </div>
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
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-primary/90 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="glass-card w-full max-w-md p-8 text-center border-border-glow shadow-[0_0_50px_rgba(6,214,160,0.2)]"
              >
                <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 ${isAlive ? 'bg-accent-primary/20 text-accent-primary' : 'bg-accent-danger/20 text-accent-danger'}`}>
                  {isAlive ? <Trophy className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
                </div>

                <h2 className="text-3xl font-black mb-2">
                  {isAlive ? 'Simulyatsiya Yakunlandi' : 'Klinik O\'lim'}
                </h2>
                <p className="text-text-secondary mb-8">
                  {gameOverReason || (isAlive ? "Siz bemorni stabilizatsiya qilishga muvaffaq bo'ldingiz." : "Afsuski, bemor hayotdan ko'z yumdi.")}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-white/5 rounded-2xl">
                    <div className="text-xs text-text-muted font-bold uppercase mb-1">Yakuniy Ball</div>
                    <div className="text-3xl font-mono font-black text-accent-warning">{score}</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl">
                    <div className="text-xs text-text-muted font-bold uppercase mb-1">Ketgan Vaqt</div>
                    <div className="text-3xl font-mono font-black text-accent-info">{elapsedMinutes}m</div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button onClick={resetGame} className="btn-primary w-full py-4 text-lg">
                    Qayta Boshlash
                  </button>
                  <button onClick={resetGame} className="btn-outline w-full py-3">
                    Bosh Sahifa
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Branding */}
      <footer className="absolute bottom-6 left-0 w-full text-center pointer-events-none opacity-20">
        <div className="flex items-center justify-center gap-2">
          <Heart className="w-4 h-4 fill-accent-primary text-accent-primary animate-heartbeat" />
          <span className="text-xs font-black tracking-widest uppercase">MedicAI Simulation Core v1.0</span>
        </div>
      </footer>
    </main>
  );
}
