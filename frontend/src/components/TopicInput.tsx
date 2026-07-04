"use client";

import React, { useState } from 'react';
import { useGameStore, Difficulty } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Stethoscope, ChevronRight, Loader2, AlertCircle, Heart, Gauge, Clock } from 'lucide-react';

const DIFFICULTIES: { value: Difficulty; label: string; hint: string }[] = [
    { value: 'Easy', label: 'Oson', hint: 'Klassik, aniq holat' },
    { value: 'Medium', label: "O'rta", hint: 'Realistik, biroz noaniq' },
    { value: 'Hard', label: 'Qiyin', hint: 'Yuqori xavf, murakkab' },
];

const DURATIONS = [15, 30, 45, 60];

const SUGGESTIONS = [
    'Acute MI / STEMI',
    'Ischemic Stroke',
    'Anaphylaxis',
    'Septic Shock',
    'Pulmonary Embolism',
    'Diabetic Ketoacidosis',
    'Hypertensive Crisis',
    'Pediatric Asthma',
    'Traumatic Brain Injury',
    'Aortic Dissection',
];

export const TopicInput: React.FC = () => {
    const {
        topic, setTopic, isGenerating, generateError, startSimulation,
        difficulty, setDifficulty, durationMinutes, setDurationMinutes,
    } = useGameStore();
    const [focused, setFocused] = useState(false);

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!topic.trim() || isGenerating) return;
        startSimulation();
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl"
            >
                {/* Logo */}
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 rounded-xl bg-[#06d6a0]/10 border border-[#06d6a0]/20 flex items-center justify-center">
                        <Heart className="w-5 h-5 text-[#06d6a0] animate-heartbeat" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-[#f0f0f0]">MedicAI</h1>
                        <p className="text-xs text-[#606060]">Clinical Simulation</p>
                    </div>
                </div>

                {/* Heading */}
                <h2 className="text-3xl font-bold text-[#f0f0f0] mb-2 leading-tight">
                    What medical scenario<br />would you like to practice?
                </h2>
                <p className="text-[#a0a0a0] mb-8 text-sm">
                    Enter any medical topic — the AI will generate a realistic clinical case for you.
                </p>

                {/* Input form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="relative">
                        <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#606060] pointer-events-none" />
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            onFocus={() => setFocused(true)}
                            onBlur={() => setTimeout(() => setFocused(false), 150)}
                            placeholder="e.g. Heart attack, Stroke, Anaphylaxis..."
                            className="topic-input pl-12 pr-4"
                            disabled={isGenerating}
                        />
                    </div>

                    {/* Difficulty selector */}
                    <div>
                        <div className="flex items-center gap-1.5 mb-2">
                            <Gauge className="w-3.5 h-3.5 text-[#606060]" />
                            <p className="text-xs text-[#606060] uppercase tracking-wider font-medium">Qiyinlik darajasi</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {DIFFICULTIES.map((d) => (
                                <button
                                    key={d.value}
                                    type="button"
                                    onClick={() => setDifficulty(d.value)}
                                    disabled={isGenerating}
                                    className={`flex flex-col items-start px-3 py-2 rounded-lg border text-left transition-all disabled:opacity-40 ${
                                        difficulty === d.value
                                            ? 'border-[#06d6a0]/50 bg-[#06d6a0]/10 text-[#f0f0f0]'
                                            : 'border-[rgba(255,255,255,0.08)] text-[#a0a0a0] hover:border-[rgba(255,255,255,0.2)]'
                                    }`}
                                >
                                    <span className="text-sm font-semibold">{d.label}</span>
                                    <span className="text-[10px] text-[#606060]">{d.hint}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Duration selector */}
                    <div>
                        <div className="flex items-center gap-1.5 mb-2">
                            <Clock className="w-3.5 h-3.5 text-[#606060]" />
                            <p className="text-xs text-[#606060] uppercase tracking-wider font-medium">Vaqt chegarasi</p>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {DURATIONS.map((mins) => (
                                <button
                                    key={mins}
                                    type="button"
                                    onClick={() => setDurationMinutes(mins)}
                                    disabled={isGenerating}
                                    className={`px-3 py-2 rounded-lg border text-sm font-semibold transition-all disabled:opacity-40 ${
                                        durationMinutes === mins
                                            ? 'border-[#06d6a0]/50 bg-[#06d6a0]/10 text-[#f0f0f0]'
                                            : 'border-[rgba(255,255,255,0.08)] text-[#a0a0a0] hover:border-[rgba(255,255,255,0.2)]'
                                    }`}
                                >
                                    {mins} min
                                </button>
                            ))}
                        </div>
                    </div>

                    {generateError && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2 text-[#ef476f] text-sm p-3 rounded-lg bg-[#ef476f]/10 border border-[#ef476f]/20"
                        >
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{generateError}</span>
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={!topic.trim() || isGenerating}
                        className="btn btn-green w-full py-3 text-base rounded-xl"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating scenario...
                            </>
                        ) : (
                            <>
                                Start Simulation
                                <ChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                {/* Suggestions */}
                <div className="mt-6">
                    <p className="text-xs text-[#606060] mb-3 uppercase tracking-wider font-medium">Quick suggestions</p>
                    <div className="flex flex-wrap gap-2">
                        {SUGGESTIONS.map((s) => (
                            <button
                                key={s}
                                onClick={() => setTopic(s)}
                                disabled={isGenerating}
                                className="px-3 py-1.5 rounded-full text-xs font-medium border border-[rgba(255,255,255,0.08)] text-[#a0a0a0] hover:text-[#f0f0f0] hover:border-[rgba(255,255,255,0.2)] transition-all disabled:opacity-40"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Generating overlay */}
                <AnimatePresence>
                    {isGenerating && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="scan-overlay"
                        >
                            <div className="scan-line" />
                            <div className="relative z-10 text-center">
                                <div className="w-16 h-16 rounded-2xl bg-[#06d6a0]/10 border border-[#06d6a0]/20 flex items-center justify-center mx-auto mb-4">
                                    <Stethoscope className="w-8 h-8 text-[#06d6a0]" />
                                </div>
                                <p className="text-[#06d6a0] font-bold text-lg mb-1">Generating Clinical Case</p>
                                <p className="text-[#a0a0a0] text-sm">Preparing <span className="text-[#f0f0f0] font-medium">{topic}</span> scenario...</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};
