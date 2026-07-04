"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import { Send, Mic, MicOff, Bot, User, Stethoscope } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from '@/lib/types';

function FeedbackBadge({ type }: { type: string }) {
    const map: Record<string, { label: string; cls: string }> = {
        success: { label: 'Correct', cls: 'bg-[#06d6a0]/10 text-[#06d6a0] border-[#06d6a0]/20' },
        error: { label: 'Incorrect', cls: 'bg-[#ef476f]/10 text-[#ef476f] border-[#ef476f]/20' },
        warning: { label: 'Caution', cls: 'bg-[#ffd166]/10 text-[#ffd166] border-[#ffd166]/20' },
        info: { label: 'Info', cls: 'bg-[#73d2de]/10 text-[#73d2de] border-[#73d2de]/20' },
    };
    const { label, cls } = map[type] || map.info;
    return <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cls}`}>{label}</span>;
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
    if (msg.role === 'system') {
        return (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#73d2de]/10 border border-[#73d2de]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Stethoscope className="w-4 h-4 text-[#73d2de]" />
                </div>
                <div className="bubble-system flex-1">
                    <p className="text-[10px] font-bold text-[#73d2de] uppercase tracking-wider mb-1">Initial Presentation</p>
                    <p className="text-sm text-[#f0f0f0] leading-relaxed">{msg.content}</p>
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
                <div className="w-8 h-8 rounded-full bg-[#06d6a0]/10 border border-[#06d6a0]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-[#06d6a0]" />
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
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                feedbackType === 'error' ? 'bg-[#ef476f]/10 border-[#ef476f]/20' :
                feedbackType === 'success' ? 'bg-[#06d6a0]/10 border-[#06d6a0]/20' :
                'bg-[#1a1a1a] border-[rgba(255,255,255,0.08)]'
            }`}>
                <Bot className={`w-4 h-4 ${feedbackType === 'error' ? 'text-[#ef476f]' : feedbackType === 'success' ? 'text-[#06d6a0]' : 'text-[#a0a0a0]'}`} />
            </div>
            <div className={`bubble-ai flex-1 ${borderCls}`}>
                <div className="flex items-center gap-2 mb-2">
                    {feedbackType && <FeedbackBadge type={feedbackType} />}
                    {msg.metadata?.score_impact !== undefined && (
                        <span className={`text-[10px] font-mono font-bold ${msg.metadata.score_impact >= 0 ? 'text-[#06d6a0]' : 'text-[#ef476f]'}`}>
                            {msg.metadata.score_impact >= 0 ? '+' : ''}{msg.metadata.score_impact} pts
                        </span>
                    )}
                </div>
                <p className="text-sm text-[#f0f0f0] leading-relaxed whitespace-pre-line">{msg.content}</p>
            </div>
        </motion.div>
    );
}

export const ChatInterface: React.FC = () => {
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { messages, sendAction, isProcessing, isGameOver, scenario } = useGameStore();

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
                <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between flex-shrink-0">
                    <div>
                        <h3 className="text-sm font-semibold text-[#f0f0f0]">{scenario.title}</h3>
                        <p className="text-xs text-[#606060]">{scenario.difficulty} · {scenario.topic}</p>
                    </div>
                </div>
            )}

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}

                {isProcessing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-[#a0a0a0]" />
                        </div>
                        <div className="bubble-ai">
                            <div className="flex gap-1 items-center">
                                {[0, 0.15, 0.3].map((d, i) => (
                                    <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-[#06d6a0]"
                                        animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: d }} />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {isGameOver && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="p-3 rounded-xl text-center text-sm text-[#a0a0a0] border border-[rgba(255,255,255,0.06)] bg-[#1a1a1a]">
                        Simulation ended
                    </motion.div>
                )}
            </div>

            {/* Input area */}
            <div className="p-3 border-t border-[rgba(255,255,255,0.05)] flex-shrink-0">
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
                        placeholder={isProcessing ? 'Analyzing...' : isGameOver ? 'Simulation ended' : 'Enter action (e.g. Give aspirin 300mg, Check ECG...)'}
                        className="chat-input flex-1"
                        disabled={isGameOver || isProcessing}
                    />
                    <button type="submit" disabled={!input.trim() || isGameOver || isProcessing}
                        className="btn-icon flex-shrink-0 bg-[#06d6a0] border-[#06d6a0] text-[#0f0f0f] hover:bg-[#05c090] disabled:opacity-30 disabled:cursor-not-allowed">
                        <Send className="w-4 h-4" />
                    </button>
                </form>
                <p className="text-[10px] text-[#606060] mt-2 px-1">Type any clinical action — diagnosis, medications, procedures</p>
            </div>
        </div>
    );
};
