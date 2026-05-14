"use client";

import React, { useState } from 'react';
import { Send, Search, Beaker, ChevronDown, Activity } from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { DrugAction } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

export const ActionPanel: React.FC = () => {
    const [drug, setDrug] = useState('');
    const [dose, setDose] = useState('');
    const [route, setRoute] = useState<DrugAction['route']>('IV');
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    const performAction = useGameStore(state => state.performAction);
    const history = useGameStore(state => state.history);
    const isGameOver = useGameStore(state => state.isGameOver);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!drug || !dose || isGameOver) return;

        performAction({
            drug_name: drug,
            dose: dose,
            route: route
        });

        setDrug('');
        setDose('');
    };

    const routes: DrugAction['route'][] = ['IV', 'IM', 'PO', 'SC', 'Inhaler', 'Sublingual'];

    return (
        <div className="flex flex-col gap-4 w-full h-full">
            <div className="glass-card p-5 border-border-glow">
                <div className="flex items-center gap-2 mb-4">
                    <Beaker className="w-5 h-5 text-accent-primary" />
                    <h3 className="font-bold text-lg">Dori Berish / Muolaja</h3>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs text-text-muted font-bold uppercase ml-1">Dori Nomi</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Masalan: Adrenalin, Aspirin..."
                                    value={drug}
                                    onChange={(e) => setDrug(e.target.value)}
                                    className="drug-input pl-10"
                                    disabled={isGameOver}
                                />
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-text-muted font-bold uppercase ml-1">Doza</label>
                            <input
                                type="text"
                                placeholder="Masalan: 0.5mg, 325mg..."
                                value={dose}
                                onChange={(e) => setDose(e.target.value)}
                                className="drug-input"
                                disabled={isGameOver}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 space-y-1.5 w-full">
                            <label className="text-xs text-text-muted font-bold uppercase ml-1">Yuborish Yo'li</label>
                            <div className="flex flex-wrap gap-2">
                                {routes.map(r => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setRoute(r)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${route === r
                                            ? 'bg-accent-primary text-bg-primary'
                                            : 'bg-bg-secondary text-text-secondary hover:bg-bg-card-hover'
                                            }`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!drug || !dose || isGameOver}
                            className="btn-primary flex items-center justify-center gap-2 w-full md:w-auto"
                        >
                            <span>Yuborish</span>
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            </div>

            {/* History Log */}
            <div className="flex-1 glass-card overflow-hidden flex flex-col">
                <button
                    onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5"
                >
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-accent-info" />
                        <h4 className="font-bold text-sm">Harakatlar Tarixi</h4>
                    </div>
                    <span className="bg-bg-secondary px-2 py-0.5 rounded text-[10px] font-bold text-text-muted">
                        {history.length}
                    </span>
                </button>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {history.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-text-muted text-sm italic opacity-50">
                            Hali harakatlar bajarilmagan
                        </div>
                    ) : (
                        [...history].reverse().map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`feedback-bubble ${item.feedback_type === 'success' ? 'feedback-success' :
                                    item.feedback_type === 'error' ? 'feedback-error' :
                                        item.feedback_type === 'warning' ? 'feedback-warning' : 'feedback-info'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1 text-[10px] font-bold">
                                    <span className={
                                        item.feedback_type === 'success' ? 'text-accent-primary' :
                                            item.feedback_type === 'error' ? 'text-accent-danger' :
                                                item.feedback_type === 'warning' ? 'text-accent-warning' : 'text-accent-info'
                                    }>
                                        AGENT: {item.feedback_type.toUpperCase()}
                                    </span>
                                    <span className="text-text-muted">+{item.elapsed_time} min</span>
                                </div>
                                <p className="text-xs font-semibold mb-1">{item.medical_text}</p>
                                <p className="text-[11px] text-text-secondary italic">{item.feedback}</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className={`score-badge ${item.score_impact >= 0 ? 'score-positive' : 'score-negative'}`}>
                                        {item.score_impact >= 0 ? `+${item.score_impact}` : item.score_impact} ball
                                    </span>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
