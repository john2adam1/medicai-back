"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import { Send, Mic, MicOff, Bot, User, Stethoscope, Power } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';

function FeedbackBadge({ type }: { type: string }) {
    const { t } = useTranslation();
    const map: Record<string, { labelKey: string; cls: string }> = {
        success: { labelKey: 'feedback_correct', cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
        error: { labelKey: 'feedback_incorrect', cls: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
        warning: { labelKey: 'feedback_caution', cls: 'bg-amber-500/10 text-amber-700 border-amber-500/20' },
        info: { labelKey: 'feedback_info', cls: 'bg-[#0284c7]/10 text-[#0284c7] border-[#0284c7]/20' },
    };
    const { labelKey, cls } = map[type] || map.info;
    return <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cls}`}>{t(labelKey as any)}</span>;
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
    const { t } = useTranslation();

    if (msg.role === 'system') {
        return (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0284c7]/10 border border-[#0284c7]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Stethoscope className="w-4 h-4 text-[#0284c7]" />
                </div>
                <div className="bubble-system flex-1">
                    <p className="text-[10px] font-bold text-[#0284c7] uppercase tracking-wider mb-1">{t('initial_present')}</p>
                    <p className="text-sm text-[var(--color-text)] leading-relaxed">{msg.content}</p>
                </div>
            </motion.div>
        );
    }

    if (msg.role === 'user') {
        return (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3 justify-end">
                <div className="bubble-user">
                    <p className="text-sm">{msg.content}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-[var(--color-accent)]" />
                </div>
            </motion.div>
        );
    }

    const feedbackType = msg.metadata?.feedback_type;
    const borderCls = feedbackType === 'success' ? 'border-[#06d6a0]/20' :
        feedbackType === 'error' ? 'border-[#ef476f]/20' :
            feedbackType === 'warning' ? 'border-[#ffd166]/20' : '';

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border ${feedbackType === 'error' ? 'bg-rose-500/10 border-rose-500/20' :
                feedbackType === 'success' ? 'bg-emerald-500/10 border-emerald-500/20' :
                    'bg-[var(--color-surface-2)] border-[var(--color-border)]'
                }`}>
                <Bot className={`w-4 h-4 ${feedbackType === 'error' ? 'text-rose-600' : feedbackType === 'success' ? 'text-emerald-500' : 'text-[var(--color-text-3)]'}`} />
            </div>
            <div className={`bubble-ai flex-1 ${borderCls}`}>
                <div className="flex items-center gap-2 mb-2">
                    {feedbackType && <FeedbackBadge type={feedbackType} />}
                    {msg.metadata?.score_impact !== undefined && (
                        <span className={`text-[10px] font-mono font-bold ${msg.metadata.score_impact >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {msg.metadata.score_impact >= 0 ? '+' : ''}{msg.metadata.score_impact} pts
                        </span>
                    )}
                </div>
                <p className="text-sm text-[var(--color-text)] leading-relaxed whitespace-pre-line">{msg.content}</p>
            </div>
        </motion.div>
    );
}

export const ChatInterface: React.FC = () => {
    const { t } = useTranslation();
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { messages, sendAction, endSimulation, isProcessing, isGameOver, scenario } = useGameStore();

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, isProcessing]);

    const handleSend = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || isGameOver || isProcessing) return;
        sendAction(input.trim());
        setInput('');
        inputRef.current?.focus();
    };

    const toggleVoice = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;
        if (isListening) { setIsListening(false); return; }
        const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const r = new SR();
        r.lang = 'en-US';
        r.continuous = false;
        r.interimResults = false;
        r.onstart = () => setIsListening(true);
        r.onend = () => setIsListening(false);
        r.onerror = () => setIsListening(false);
        r.onresult = (e: any) => { setInput(e.results[0][0].transcript); setIsListening(false); };
        r.start();
    };

    return (
        <div className="flex flex-col h-full">
            {/* Scenario header */}
            {scenario && (
                <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between flex-shrink-0">
                    <div>
                        <h3 className="text-sm font-semibold text-[var(--color-text)]">{scenario.title}</h3>
                        <p className="text-xs text-[var(--color-text-3)]">{scenario.difficulty} · {scenario.topic}</p>
                    </div>
                    <button
                        onClick={endSimulation}
                        disabled={isGameOver || isProcessing}
                        className="btn-icon w-8 h-8 hover:bg-rose-500/10 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed text-rose-500/70"
                        title="End Simulation">
                        <Power className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}

                {isProcessing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-[var(--color-text-3)]" />
                        </div>
                        <div className="bubble-ai">
                            <div className="flex gap-1 items-center">
                                {[0, 0.15, 0.3].map((d, i) => (
                                    <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]"
                                        animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: d }} />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {isGameOver && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="p-3 rounded-xl text-center text-sm text-[var(--color-text-2)] border border-[var(--color-border)] bg-[var(--color-surface-2)]">
                        {t('sim_ended')}
                    </motion.div>
                )}
            </div>

            {/* Input area */}
            <div className="p-3 border-t border-[var(--color-border)] flex-shrink-0">
                <form onSubmit={handleSend} className="flex gap-2">
                    <button type="button" onClick={toggleVoice}
                        className={`btn-icon flex-shrink-0 ${isListening ? 'bg-[#ef476f]/20 border-[#ef476f]/40 text-[#ef476f]' : ''}`}
                        title="Voice input">
                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isProcessing ? t('analyzing') : isGameOver ? t('sim_ended') : t('action_placeholder')}
                        className="chat-input flex-1"
                        disabled={isGameOver || isProcessing}
                    />
                    <button type="submit" disabled={!input.trim() || isGameOver || isProcessing}
                        className="btn-icon flex-shrink-0 bg-[var(--color-accent)] border-[var(--color-accent)] text-[#ffffff] hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed">
                        <Send className="w-4 h-4" />
                    </button>
                </form>
                <p className="text-[10px] text-[var(--color-text-3)] mt-2 px-1">{t('action_hint')}</p>
            </div>
        </div>
    );
};
