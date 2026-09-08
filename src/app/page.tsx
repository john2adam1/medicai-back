"use client";

import React, { useEffect } from 'react';
import { useGameStore, getGrade } from '@/lib/store';
import { TopicInput } from '@/components/TopicInput';
import { VitalMonitor } from '@/components/VitalMonitor';
import { PatientVisualizer } from '@/components/PatientVisualizer';
import { ChatInterface } from '@/components/ChatInterface';
import QuestionnaireModal from '@/components/QuestionnaireModal';
import ProfileWidget from '@/components/ProfileWidget';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Trophy, AlertTriangle, Heart, LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { useTranslation } from '@/lib/i18n';

export default function Home() {
    const { scenario, isGameOver, gameOverReason, simulationStatus, isAlive, score, resetGame, updateTime } = useGameStore();
    const { user, logout } = useAuthStore();
    const { t } = useTranslation();
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user, router]);

    useEffect(() => {
        if (!scenario || isGameOver) return;
        const interval = setInterval(() => updateTime(0.5), 30000);
        return () => clearInterval(interval);
    }, [scenario, isGameOver, updateTime]);

    if (!user) return null; // Avoid flashing the home page logic while redirecting

    return (
        <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
            <AnimatePresence mode="wait">
                {!scenario ? (
                    <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative h-screen flex flex-col items-center justify-center">
                        <div className="absolute top-6 right-6 w-64 z-10 hidden sm:block">
                            <ProfileWidget className="rounded-2xl shadow-lg border" />
                        </div>
                        <TopicInput />
                        <QuestionnaireModal />
                    </motion.div>
                ) : (
                    <motion.div key="sim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex h-screen overflow-hidden">

                        {/* Left panel */}
                        <aside className="w-[260px] flex-shrink-0 border-r border-[var(--color-border)] flex flex-col overflow-y-auto bg-[var(--color-surface)]">
                            {/* Header */}
                            <div className="p-3 border-b border-[var(--color-border)] flex items-center justify-between flex-shrink-0">
                                <div className="flex items-center gap-2">
                                    <Heart className="w-4 h-4 text-[var(--color-accent)] animate-heartbeat" />
                                    <span className="text-sm font-bold">MedicAI</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={resetGame}
                                        className="btn-icon w-7 h-7"
                                        title={t('new_sim')}>
                                        <RotateCcw className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={logout}
                                        className="btn-icon w-7 h-7 text-rose-500 hover:bg-rose-500/10"
                                        title={t('logout')}>
                                        <LogOut className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Patient + Vitals */}
                            <div className="p-3 space-y-3 flex-1">
                                <PatientVisualizer />
                                <VitalMonitor />
                            </div>

                            {/* Profile Widget */}
                            <div className="mt-auto">
                                <ProfileWidget />
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
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172a]/40 backdrop-blur-xs">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            className="card w-full max-w-sm p-8 text-center">
                            <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-5 ${isAlive ? 'bg-[#06d6a0]/10' : 'bg-[#ef476f]/10'}`}>
                                {isAlive ? <Trophy className="w-8 h-8 text-[#06d6a0]" /> : <AlertTriangle className="w-8 h-8 text-[#ef476f]" />}
                            </div>
                            <h2 className="text-xl font-bold mb-2">
                                {simulationStatus === 'success' ? t('patient_stabilized') : isAlive ? t('sim_over') : t('patient_deceased')}
                            </h2>
                            <p className="text-sm text-[var(--color-text-2)] mb-6">{gameOverReason}</p>
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="card-sm p-3 bg-[var(--color-surface-2)] border-[var(--color-border)]">
                                    <p className="text-xs text-[var(--color-text-3)] mb-1">{t('grade')}</p>
                                    <p className="text-xl font-mono font-bold text-[var(--color-accent-yellow)]">{getGrade(score)}</p>
                                </div>
                                <div className="card-sm p-3 bg-[var(--color-surface-2)] border-[var(--color-border)]">
                                    <p className="text-xs text-[var(--color-text-3)] mb-1">{t('score')}</p>
                                    <p className="text-xl font-mono font-bold text-[var(--color-accent-blue)]">{score}</p>
                                </div>
                            </div>
                            <button onClick={resetGame} className="btn btn-green w-full py-3 rounded-xl">
                                {t('new_sim')}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
