"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Stethoscope, User, Bot, AlertCircle } from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';

export const ChatInterface: React.FC = () => {
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const {
        scenario,
        history,
        performAction,
        isGameOver
    } = useGameStore();

    // Auto scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history, input]);

    const handleSend = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || isGameOver) return;

        // Simple parsing logic
        // In a real app, this would be an AI call or complex regex
        // For now, let's try to extract drug name and dose
        const parts = input.toLowerCase().split(' ');
        let drugName = '';
        let dose = '1 dose';
        let route: any = 'IV';

        // Very basic extraction for the demo
        if (parts.length > 0) {
            drugName = parts[0];
            if (parts.length > 1) dose = parts[1];
            if (input.toLowerCase().includes('im')) route = 'IM';
            if (input.toLowerCase().includes('po')) route = 'PO';
        }

        performAction({
            drug_name: drugName,
            dose: dose,
            route: route
        });

        setInput('');
    };

    const toggleVoice = () => {
        if (!('webkitSpeechRecognition' in window) && !('speechRecognition' in window)) {
            alert('Brauzeringiz ovozli qidiruvni qo\'llab-quvvatlamaydi.');
            return;
        }

        if (isListening) {
            setIsListening(false);
            return;
        }

        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).speechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'uz-UZ';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            setIsListening(false);
        };

        recognition.start();
    };

    return (
        <div className="flex flex-col h-full glass-card overflow-hidden">
            {/* Chat Messages */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
            >
                {/* Initial Presentation (Bot) */}
                {scenario && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start gap-4"
                    >
                        <div className="w-10 h-10 rounded-full bg-accent-info/20 flex items-center justify-center flex-shrink-0 border border-accent-info/30">
                            <Bot className="w-5 h-5 text-accent-info" />
                        </div>
                        <div className="chat-bubble-ai">
                            <div className="text-[10px] font-black text-accent-info uppercase tracking-widest mb-1">MedicAI • Boshlang'ich Holat</div>
                            <p className="text-sm leading-relaxed">{scenario.initial_presentation}</p>
                        </div>
                    </motion.div>
                )}

                {/* History */}
                {history.map((msg, idx) => (
                    <React.Fragment key={idx}>
                        {/* User "Action" Message */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-start gap-4 justify-end"
                        >
                            <div className="chat-bubble-user">
                                <p className="text-sm italic opacity-80 mb-1">Dori yuborish:</p>
                                <p className="text-sm font-bold">{msg.medical_text.split(' berildi')[0]}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center flex-shrink-0 border border-accent-primary/30">
                                <User className="w-5 h-5 text-accent-primary" />
                            </div>
                        </motion.div>

                        {/* Bot "Feedback" Message */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-start gap-4"
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border ${msg.feedback_type === 'error' ? 'bg-accent-danger/20 border-accent-danger/30 text-accent-danger' :
                                    msg.feedback_type === 'success' ? 'bg-accent-primary/20 border-accent-primary/30 text-accent-primary' :
                                        'bg-accent-info/20 border-accent-info/30 text-accent-info'
                                }`}>
                                <Bot className="w-5 h-5" />
                            </div>
                            <div className={`chat-bubble-ai ${msg.feedback_type === 'error' ? 'border-accent-danger/30' :
                                    msg.feedback_type === 'success' ? 'border-accent-primary/30' : ''
                                }`}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${msg.feedback_type === 'error' ? 'text-accent-danger' :
                                            msg.feedback_type === 'success' ? 'text-accent-primary' : 'text-accent-info'
                                        }`}>
                                        MedicAI • {msg.feedback_type.toUpperCase()}
                                    </span>
                                    <span className="text-[10px] text-text-muted font-bold">+{msg.elapsed_time} daq</span>
                                </div>
                                <p className="text-sm leading-relaxed mb-2">{msg.feedback}</p>
                                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black ${msg.score_impact >= 0 ? 'bg-accent-primary/10 text-accent-primary' : 'bg-accent-danger/10 text-accent-danger'
                                    }`}>
                                    {msg.score_impact >= 0 ? '+' : ''}{msg.score_impact} Ball
                                </div>
                            </div>
                        </motion.div>
                    </React.Fragment>
                ))}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/5 bg-bg-secondary/50">
                <form onSubmit={handleSend} className="flex gap-3">
                    <button
                        type="button"
                        onClick={toggleVoice}
                        className={`voice-btn flex-shrink-0 ${isListening ? 'active' : ''}`}
                        title="Ovozli kiritish"
                    >
                        {isListening ? <Mic className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>

                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Masalan: Adrenalin 1mg IV yoki Kislorod..."
                            className="drug-input pr-12 h-12"
                            disabled={isGameOver}
                        />
                        <button
                            type="submit"
                            disabled={!input || isGameOver}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-accent-primary text-bg-primary flex items-center justify-center transition-all hover:scale-110 disabled:opacity-30"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </form>
                <div className="mt-2 flex items-center gap-4 text-[10px] text-text-muted font-bold uppercase tracking-widest px-2">
                    <div className="flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Dori nomi va dozani kiriting</div>
                    <div className="flex items-center gap-1"><Mic className="w-3 h-3" /> Ovoz orqali gapiring</div>
                </div>
            </div>
        </div>
    );
};
