"use client";

import React, { useState } from 'react';
import { useGameStore, Difficulty } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Stethoscope, ChevronRight, Loader2, AlertCircle, Heart, Gauge, Clock } from 'lucide-react';
import { useAuthStore, AIRecommendation } from '@/lib/auth-store';
import { useTranslation } from '@/lib/i18n';

const DIFFICULTIES = [
    { value: 'Easy', labelKey: 'diff_easy', hintKey: 'diff_easy_hint' },
    { value: 'Medium', labelKey: 'diff_medium', hintKey: 'diff_medium_hint' },
    { value: 'Hard', labelKey: 'diff_hard', hintKey: 'diff_hard_hint' },
] as const;

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
    const { recommendations } = useAuthStore();
    const { t } = useTranslation();
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
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-center">
                        <Heart className="w-5 h-5 text-[var(--color-accent)] animate-heartbeat" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-[var(--color-text)]">MedicAI</h1>
                        <p className="text-xs text-[var(--color-text-3)]">Clinical Simulation</p>
                    </div>
                </div>

                {/* Heading */}
                <h2 className="text-3xl font-bold text-[var(--color-text)] mb-2 leading-tight whitespace-pre-line">
                    {t('hero_title')}
                </h2>
                <p className="text-[var(--color-text-2)] mb-8 text-sm">
                    {t('hero_desc')}
                </p>

                {/* Input form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="relative">
                        <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-3)] pointer-events-none" />
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            onFocus={() => setFocused(true)}
                            onBlur={() => setTimeout(() => setFocused(false), 150)}
                            placeholder={t('topic_placeholder')}
                            className="topic-input pl-12 pr-4"
                            disabled={isGenerating}
                        />
                    </div>

                    {/* Difficulty selector */}
                    <div>
                        <div className="flex items-center gap-1.5 mb-2">
                            <Gauge className="w-3.5 h-3.5 text-[var(--color-text-3)]" />
                            <p className="text-xs text-[var(--color-text-3)] uppercase tracking-wider font-medium">{t('difficulty_label')}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {DIFFICULTIES.map((d) => (
                                <button
                                    key={d.value}
                                    type="button"
                                    onClick={() => setDifficulty(d.value as Difficulty)}
                                    disabled={isGenerating}
                                    className={`flex flex-col items-start px-3 py-2 rounded-lg border text-left transition-all disabled:opacity-40 ${difficulty === d.value
                                        ? 'border-[var(--color-accent)]/50 bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                                        : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-2)] hover:border-[var(--color-border-strong)]'
                                        }`}
                                >
                                    <span className="text-sm font-semibold">{t(d.labelKey as any)}</span>
                                    <span className="text-[10px] text-[var(--color-text-3)]">{t(d.hintKey as any)}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Duration selector */}
                    <div>
                        <div className="flex items-center gap-1.5 mb-2">
                            <Clock className="w-3.5 h-3.5 text-[var(--color-text-3)]" />
                            <p className="text-xs text-[var(--color-text-3)] uppercase tracking-wider font-medium">{t('duration_label')}</p>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {DURATIONS.map((mins) => (
                                <button
                                    key={mins}
                                    type="button"
                                    onClick={() => setDurationMinutes(mins)}
                                    disabled={isGenerating}
                                    className={`px-3 py-2 rounded-lg border text-sm font-semibold transition-all disabled:opacity-40 ${durationMinutes === mins
                                        ? 'border-[var(--color-accent)]/50 bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                                        : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-2)] hover:border-[var(--color-border-strong)]'
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
                                {t('generating_btn')}
                            </>
                        ) : (
                            <>
                                {t('start_btn')}
                                <ChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                {/* Recommendations */}
                {recommendations && recommendations.length > 0 && (
                    <div className="mt-6">
                        <p className="text-xs text-[var(--color-text-3)] mb-3 uppercase tracking-wider font-medium">✨ {t('ai_cases')}</p>
                        <div className="flex flex-col gap-2">
                            {recommendations.map((rec: AIRecommendation, i: number) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setTopic(rec.topic)}
                                    disabled={isGenerating}
                                    className="text-left p-3 rounded-lg border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 hover:border-[var(--color-accent)] transition-all disabled:opacity-40"
                                >
                                    <div className="font-semibold text-sm text-[var(--color-text)] mb-0.5">{rec.topic}</div>
                                    <div className="text-xs text-[var(--color-text-2)]">{rec.description}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

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
                                <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-center mx-auto mb-4">
                                    <Stethoscope className="w-8 h-8 text-[var(--color-accent)]" />
                                </div>
                                <p className="text-[var(--color-accent)] font-bold text-lg mb-1">{t('generating_title')}</p>
                                <p className="text-[var(--color-text-2)] text-sm"><span className="text-[var(--color-text)] font-semibold">{topic}</span> {t('preparing_desc')}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};
