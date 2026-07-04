"use client";

import React, { useEffect } from 'react';
import { useGameStore, getGrade } from '@/lib/store';
import { TopicInput } from '@/components/TopicInput';
import { VitalMonitor } from '@/components/VitalMonitor';
import { PatientVisualizer } from '@/components/PatientVisualizer';
import { ChatInterface } from '@/components/ChatInterface';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Trophy, AlertTriangle, Heart } from 'lucide-react';

export default function Home() {
    const { scenario, isGameOver, gameOverReason, simulationStatus, isAlive, score, resetGame, updateTime } = useGameStore();

    useEffect(() => {
        if (!scenario || isGameOver) return;
        const interval = setInterval(() => updateTime(0.5), 30000);
        return () => clearInterval(interval);
    }, [scenario, isGameOver, updateTime]);

    return (
        <main className="min-h-screen bg-[#0f0f0f] text-[#f0f0f0]">
            <AnimatePresence mode="wait">
                {!scenario ? (
                    <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <TopicInput />
                    </motion.div>
                ) : (
                    <motion.div key="sim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex h-screen overflow-hidden">

                        {/* Left panel */}
                        <aside className="w-[260px] flex-shrink-0 border-r border-[rgba(255,255,255,0.06)] flex flex-col overflow-y-auto">
                            {/* Header */}
                            <div className="p-3 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between flex-shrink-0">
                                <div className="flex items-center gap-2">
                                    <Heart className="w-4 h-4 text-[#06d6a0] animate-heartbeat" />
                                    <span className="text-sm font-bold">MedicAI</span>
                                </div>
                                <button onClick={resetGame}
                                    className="btn-icon w-7 h-7"
                                    title="New simulation">
                                    <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Patient + Vitals */}
                            <div className="p-3 space-y-3 flex-1">
                                <PatientVisualizer />
                                <VitalMonitor />
                            </div>
                        </aside>

                        {/* Right: Chat */}
                        <section className="flex-1 flex flex-col min-w-0">
                            <ChatInterface />
                        </section>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Game Over Modal */}
            <AnimatePresence>
                {isGameOver && scenario && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            className="card w-full max-w-sm p-8 text-center">
                            <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-5 ${isAlive ? 'bg-[#06d6a0]/10' : 'bg-[#ef476f]/10'}`}>
                                {isAlive ? <Trophy className="w-8 h-8 text-[#06d6a0]" /> : <AlertTriangle className="w-8 h-8 text-[#ef476f]" />}
                            </div>
                            <h2 className="text-xl font-bold mb-2">
                                {simulationStatus === 'success' ? 'Patient Stabilized' : isAlive ? 'Simulation Over' : 'Patient Deceased'}
                            </h2>
                            <p className="text-sm text-[#a0a0a0] mb-6">{gameOverReason}</p>
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="card-sm p-3">
                                    <p className="text-xs text-[#606060] mb-1">Grade</p>
                                    <p className="text-xl font-mono font-bold text-[#ffd166]">{getGrade(score)}</p>
                                </div>
                                <div className="card-sm p-3">
                                    <p className="text-xs text-[#606060] mb-1">Score</p>
                                    <p className="text-xl font-mono font-bold text-[#73d2de]">{score}</p>
                                </div>
                            </div>
                            <button onClick={resetGame} className="btn btn-green w-full py-3 rounded-xl">
                                New Simulation
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
