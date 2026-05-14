"use client";

import React from 'react';
import { useGameStore } from '@/lib/store';
import { SplineState, SkinColor } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Ghost, HeartCrack, Zap } from 'lucide-react';

export const PatientVisualizer: React.FC = () => {
    const currentVisual = useGameStore(state => state.currentVisual);
    const isAlive = useGameStore(state => state.isAlive);
    const stats = useGameStore(state => state.currentStats);

    const getSkinColorClass = (color: SkinColor) => {
        switch (color) {
            case 'pale': return 'from-slate-200 to-slate-400';
            case 'cyanotic': return 'from-blue-200 to-blue-500';
            case 'flushed': return 'from-rose-400 to-rose-600';
            case 'jaundiced': return 'from-yellow-200 to-yellow-500';
            default: return 'from-[#ffdcb4] to-[#f0be8d]'; // normal
        }
    };

    const getBodyAnimation = (state: SplineState) => {
        switch (state) {
            case 'Pain': return { y: [0, -4, 0], transition: { repeat: Infinity, duration: 1.5 } };
            case 'Seizure': return {
                x: [0, -2, 2, -3, 3, 0],
                y: [0, 1, -1, 1, -1, 0],
                transition: { repeat: Infinity, duration: 0.1 }
            };
            case 'Recovery': return { scale: [1, 1.02, 1], transition: { repeat: Infinity, duration: 4 } };
            case 'Dead': return { opacity: 0.7, scale: 0.98 };
            default: return { y: [0, -2, 0], transition: { repeat: Infinity, duration: 3 } }; // Breathing
        }
    };

    return (
        <div className={`patient-avatar-container shadow-2xl relative overflow-hidden flex flex-col items-center justify-center p-6 transition-all duration-700 patient-state-${currentVisual.spline_state.toLowerCase()}`}>

            {/* Background Decor */}
            <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentVisual.spline_state}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="relative z-10 w-full max-w-[200px] aspect-square flex items-center justify-center"
                >
                    {/* Main Patient Body Representation (Abstract) */}
                    <motion.div
                        animate={getBodyAnimation(currentVisual.spline_state)}
                        className={`w-48 h-48 rounded-full bg-gradient-to-br ${getSkinColorClass(currentVisual.skin_color)} shadow-2xl relative border-4 border-white/20`}
                    >
                        {/* Eyes */}
                        <div className="absolute top-1/3 left-1/4 flex gap-12 w-full px-4">
                            <div className={`w-6 h-6 rounded-full bg-slate-900 overflow-hidden relative`}>
                                {currentVisual.spline_state === 'Dead' ? (
                                    <div className="absolute inset-0 flex items-center justify-center font-bold text-white text-[8px]">X</div>
                                ) : (
                                    <motion.div
                                        animate={{ scaleY: [1, 0.1, 1] }}
                                        transition={{ repeat: Infinity, duration: 4, repeatDelay: 1 }}
                                        className="w-full h-full bg-slate-900"
                                    />
                                )}
                            </div>
                            <div className="w-6 h-6 rounded-full bg-slate-900 overflow-hidden relative">
                                {currentVisual.spline_state === 'Dead' ? (
                                    <div className="absolute inset-0 flex items-center justify-center font-bold text-white text-[8px]">X</div>
                                ) : (
                                    <motion.div
                                        animate={{ scaleY: [1, 0.1, 1] }}
                                        transition={{ repeat: Infinity, duration: 4, repeatDelay: 1.1 }}
                                        className="w-full h-full bg-slate-900"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Mouth */}
                        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2">
                            {currentVisual.spline_state === 'Pain' && (
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }} className="w-10 h-6 border-2 border-slate-900 rounded-full bg-slate-900/10" />
                            )}
                            {currentVisual.spline_state === 'Seizure' && (
                                <div className="w-12 h-2 bg-slate-900 rounded-full" />
                            )}
                            {currentVisual.spline_state === 'Dead' && (
                                <div className="w-10 h-0.5 bg-slate-900" />
                            )}
                            {(currentVisual.spline_state === 'Idle' || currentVisual.spline_state === 'Recovery') && (
                                <div className={`w-10 h-2 border-b-2 border-slate-900 rounded-full ${currentVisual.spline_state === 'Recovery' ? 'h-4 border-slate-900' : ''}`} />
                            )}
                        </div>

                        {/* Sweat drops if in pain/seizure */}
                        {(currentVisual.spline_state === 'Pain' || currentVisual.spline_state === 'Seizure') && (
                            <>
                                <motion.div animate={{ y: [0, 10], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute top-1/4 right-1/4 w-1 h-3 bg-cyan-200 rounded-full" />
                                <motion.div animate={{ y: [0, 8], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }} className="absolute top-1/3 left-1/3 w-1 h-2 bg-cyan-200 rounded-full" />
                            </>
                        )}
                    </motion.div>

                    {/* Reaction Icons */}
                    <div className="absolute -top-4 -right-4">
                        {currentVisual.spline_state === 'Pain' && <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }}><AlertCircle className="w-8 h-8 text-accent-danger" /></motion.div>}
                        {currentVisual.spline_state === 'Seizure' && <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 0.2 }}><Zap className="w-8 h-8 text-accent-warning fill-accent-warning" /></motion.div>}
                        {currentVisual.spline_state === 'Dead' && <Ghost className="w-8 h-8 text-slate-400" />}
                        {currentVisual.spline_state === 'Recovery' && <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity }}><div className="text-2xl">✨</div></motion.div>}
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="mt-8 text-center z-10">
                <h3 className="text-xl font-bold tracking-tight mb-1">
                    Bemor Holati: <span className={
                        !isAlive ? 'text-accent-danger' :
                            currentVisual.spline_state === 'Recovery' ? 'text-accent-primary' :
                                currentVisual.spline_state === 'Pain' ? 'text-accent-warning' : 'text-text-primary'
                    }>
                        {currentVisual.spline_state}
                    </span>
                </h3>
                <p className="text-sm text-text-secondary max-w-[250px] mx-auto italic">
                    {isAlive ? `Bemorning hayotiy ko'rsatkichlari ${currentVisual.spline_state.toLowerCase()} holatiga mos kelmoqda.` : "Bemor hayotdan ko'z yumdi. Reanimatsiya choralari natija bermadi."}
                </p>
            </div>

            {/* Stats Overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center glass-card-sm px-3 py-2 border-white/5">
                <div className="flex items-center gap-1.5">
                    <HeartCrack className={`w-3.5 h-3.5 ${stats.hr > 120 || stats.hr < 50 ? 'text-accent-danger' : 'text-accent-primary'}`} />
                    <span className="text-[11px] font-mono font-bold capitalize">{currentVisual.skin_color} Teri</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className={`status-dot ${!isAlive ? 'status-dead' : (stats.spo2 < 90 || stats.hr > 140) ? 'status-critical' : 'status-alive'}`} />
                    <span className="text-[11px] font-mono font-bold">{isAlive ? 'Stabil' : 'Kritik'}</span>
                </div>
            </div>
        </div>
    );
};
