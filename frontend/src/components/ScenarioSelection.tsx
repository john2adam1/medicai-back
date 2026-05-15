"use client";

import React, { useState } from 'react';
import { useGameStore } from '@/lib/store';
import { Specialty, Scenario } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight,
    Star,
    Clock,
    Activity,
    Play,
    ArrowLeft,
    CheckCircle2,
    Calendar,
    Stethoscope,
    Loader2
} from 'lucide-react';

interface ScenarioSelectionProps {
    onSelect: (scenario: Scenario) => void;
}

export const ScenarioSelection: React.FC<ScenarioSelectionProps> = ({ onSelect }) => {
    const [step, setStep] = useState(1);
    const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
    const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
    const [isStarting, setIsStarting] = useState(false);

    const { specialties, scenarios, isLoading, error } = useGameStore();

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
            if (step === 2) setSelectedSpecialty(null);
            if (step === 3) setSelectedScenario(null);
        }
    };

    const handleStart = () => {
        if (!selectedScenario) return;
        setIsStarting(true);
        setTimeout(() => {
            onSelect(selectedScenario);
        }, 2000); // Animation duration
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <Loader2 className="w-12 h-12 text-accent-primary animate-spin" />
                <p className="text-text-secondary font-bold uppercase tracking-widest text-xs">Ma'lumotlar yuklanmoqda...</p>
            </div>
        );
    }

    if (error || !specialties || !scenarios) {
        return (
            <div className="text-center p-20 space-y-6">
                <div className="w-20 h-20 bg-accent-danger/10 text-accent-danger rounded-full flex items-center justify-center mx-auto">
                    <Stethoscope className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-white">Xatolik yuz berdi</h2>
                <p className="text-text-secondary">{error || "Server bilan bog'lanishda xatolik."}</p>
                <button onClick={() => window.location.reload()} className="btn-primary">Qayta urinish</button>
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        show: {
            opacity: 1,
            y: 0,
            transition: { staggerChildren: 0.1 }
        },
        exit: { opacity: 0, y: -20 }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="max-w-6xl mx-auto px-4">
            <AnimatePresence mode="wait">
                {isStarting && (
                    <motion.div
                        key="starting-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="simulation-start-overlay"
                    >
                        <div className="text-center space-y-8 relative z-50">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="w-32 h-32 rounded-full border-4 border-accent-primary flex items-center justify-center mx-auto"
                            >
                                <Play className="w-16 h-16 text-accent-primary fill-accent-primary" />
                            </motion.div>
                            <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">
                                Simulyatsiya Yuklanmoqda...
                            </h2>
                            <div className="flex justify-center gap-4">
                                <div className="h-1 w-24 bg-accent-primary rounded-full animate-pulse" />
                                <div className="h-1 w-24 bg-accent-info rounded-full animate-pulse delay-75" />
                                <div className="h-1 w-24 bg-accent-secondary rounded-full animate-pulse delay-150" />
                            </div>
                        </div>
                        <div className="scan-line" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stepper Header */}
            <div className="mb-12">
                <div className="flex items-center justify-between mb-8">
                    {step > 1 ? (
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors font-bold uppercase text-xs tracking-widest"
                        >
                            <ArrowLeft className="w-4 h-4" /> Ortga
                        </button>
                    ) : <div />}

                    <div className="flex items-center gap-4">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${step >= s ? 'bg-accent-primary text-bg-primary' : 'bg-bg-secondary text-text-muted border border-border'
                                    }`}>
                                    {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                                </div>
                                {s < 3 && (
                                    <div className={`w-12 h-0.5 mx-2 ${step > s ? 'bg-accent-primary' : 'bg-border'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-black mb-4">
                        {step === 1 && "Yo'nalishni Tanlang"}
                        {step === 2 && "Ssenariyni Tanlang"}
                        {step === 3 && "Simulyatsiya Parametrlari"}
                    </h1>
                    <p className="text-text-secondary max-w-xl mx-auto">
                        {step === 1 && "Bemor turiga qarab ixtisoslikni tanlang"}
                        {step === 2 && selectedSpecialty && `${specialties[selectedSpecialty].nameUz} bo'yicha klinik holatni tanlang`}
                        {step === 3 && "Tayyor bo'lsangiz, simulyatshiyani boshlang"}
                    </p>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {Object.entries(specialties).map(([id, info]: [string, any]) => (
                            <motion.div
                                key={id}
                                variants={itemVariants}
                                onClick={() => { setSelectedSpecialty(id); setStep(2); }}
                                className="specialty-card glass-card group"
                                style={{ '--hover-color': info.color } as any}
                            >
                                <div className="flex flex-col items-center text-center gap-6">
                                    <div
                                        className="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12"
                                        style={{ background: info.gradient, boxShadow: `0 10px 30px ${info.color}33` }}
                                    >
                                        {info.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold mb-2">{info.nameUz}</h3>
                                        <p className="text-text-muted text-sm">{info.description}</p>
                                    </div>
                                </div>
                                <div className={`absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity blur-xl`} style={{ background: info.gradient }} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {step === 2 && selectedSpecialty && (
                    <motion.div
                        key="step2"
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {scenarios[selectedSpecialty].map((scenario) => (
                            <motion.div
                                key={scenario.id}
                                variants={itemVariants}
                                onClick={() => { setSelectedScenario(scenario); setStep(3); }}
                                className="glass-card p-8 cursor-pointer border-l-4 border-transparent hover:border-accent-primary transition-all group flex gap-6"
                            >
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${scenario.difficulty === 'Easy' ? 'bg-accent-primary/10 text-accent-primary' :
                                            scenario.difficulty === 'Medium' ? 'bg-accent-warning/10 text-accent-warning' :
                                                'bg-accent-danger/10 text-accent-danger'
                                            }`}>
                                            {scenario.difficulty === 'Easy' ? 'Oson' : scenario.difficulty === 'Medium' ? 'O\'rta' : 'Qiyin'}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3 group-hover:text-accent-primary transition-colors">{scenario.title}</h3>
                                    <p className="text-text-secondary text-sm line-clamp-2">{scenario.description}</p>
                                </div>
                                <div className="flex flex-col justify-between items-end border-l border-white/5 pl-6">
                                    <div className="flex gap-1">
                                        {[...Array(scenario.difficulty === 'Easy' ? 1 : scenario.difficulty === 'Medium' ? 2 : 3)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-current text-accent-warning" />
                                        ))}
                                    </div>
                                    <ChevronRight className="w-8 h-8 text-text-muted group-hover:text-accent-primary transition-colors" />
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {step === 3 && selectedScenario && (
                    <motion.div
                        key="step3"
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                        className="max-w-2xl mx-auto w-full"
                    >
                        <div className="glass-card p-8 border-t-4 border-accent-primary overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Stethoscope className="w-40 h-40" />
                            </div>

                            <div className="relative z-10 space-y-8">
                                <div>
                                    <div className="flex items-center gap-2 mb-2 text-accent-primary font-bold text-xs uppercase tracking-widest">
                                        <CheckCircle2 className="w-4 h-4" /> Tanlangan Ssenariy
                                    </div>
                                    <h2 className="text-3xl font-black">{selectedScenario.title}</h2>
                                    <p className="text-text-secondary mt-2">{selectedScenario.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/5 rounded-2xl flex items-center gap-4 border border-white/5">
                                        <div className="w-12 h-12 rounded-xl bg-accent-info/20 flex items-center justify-center text-accent-info">
                                            <Clock className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-text-muted font-bold uppercase">Vaqt Chegarasi</div>
                                            <div className="text-xl font-mono font-black">{selectedScenario.time_limit_minutes} daq</div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl flex items-center gap-4 border border-white/5">
                                        <div className="w-12 h-12 rounded-xl bg-accent-warning/20 flex items-center justify-center text-accent-warning">
                                            <Activity className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-text-muted font-bold uppercase">Murakkablik</div>
                                            <div className="text-lg font-black">{selectedScenario.difficulty}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-accent-primary/5 rounded-2xl border border-accent-primary/20">
                                    <div className="flex items-start gap-4">
                                        <Calendar className="w-5 h-5 text-accent-primary mt-1" />
                                        <div>
                                            <h4 className="font-bold text-accent-primary mb-1">Ko'rsatma</h4>
                                            <p className="text-sm text-text-secondary">
                                                Simulyatsiya boshlangandan so'ng sizga bemorning holati tasvirlanadi.
                                                Chatbot orqali dori nomlari va dozalarini yozib bemorni davolang.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleStart}
                                    className="btn-primary w-full py-5 text-xl flex items-center justify-center gap-3 relative group overflow-hidden"
                                >
                                    <span className="relative z-10">SIMULYATSIYANI BOSHLASH</span>
                                    <Play className="w-6 h-6 relative z-10 fill-current" />
                                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
