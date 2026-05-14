"use client";

import React from 'react';
import { SPECIALTIES, SCENARIOS } from '@/lib/scenarios';
import { Specialty, Scenario } from '@/lib/types';
import { useGameStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { ChevronRight, Star, Clock, Activity } from 'lucide-react';

interface ScenarioSelectionProps {
    onSelect: (scenario: Scenario) => void;
}

export const ScenarioSelection: React.FC<ScenarioSelectionProps> = ({ onSelect }) => {
    const [selectedSpecialty, setSelectedSpecialty] = React.useState<Specialty | null>(null);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (selectedSpecialty) {
        const specialtyInfo = SPECIALTIES[selectedSpecialty];
        const scenarios = SCENARIOS[selectedSpecialty];

        return (
            <div className="space-y-8 animate-fade-in-up">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSelectedSpecialty(null)}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors"
                    >
                        <ChevronRight className="w-6 h-6 rotate-180" />
                    </button>
                    <div>
                        <h2 className="text-3xl font-bold flex items-center gap-3">
                            <span className="text-4xl">{specialtyInfo.icon}</span>
                            {specialtyInfo.nameUz}
                        </h2>
                        <p className="text-text-secondary">{specialtyInfo.description}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {scenarios.map((scenario) => (
                        <motion.div
                            key={scenario.id}
                            whileHover={{ y: -5 }}
                            onClick={() => onSelect(scenario)}
                            className="glass-card p-6 cursor-pointer border-l-4 border-transparent hover:border-accent-primary transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${scenario.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400' :
                                        scenario.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' :
                                            'bg-red-500/10 text-red-400'
                                    }`}>
                                    {scenario.difficulty}
                                </span>
                                <div className="flex gap-1">
                                    {[...Array(scenario.difficulty === 'Easy' ? 1 : scenario.difficulty === 'Medium' ? 2 : 3)].map((_, i) => (
                                        <Star key={i} className="w-3 h-3 fill-current text-accent-warning" />
                                    ))}
                                </div>
                            </div>

                            <h3 className="text-xl font-bold mb-2 group-hover:text-accent-primary transition-colors">{scenario.title}</h3>
                            <p className="text-sm text-text-secondary mb-6 line-clamp-2">{scenario.description}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="flex items-center gap-2 text-text-muted text-xs">
                                    <Clock className="w-4 h-4" />
                                    <span>{scenario.time_limit_minutes} daqiqa</span>
                                </div>
                                <div className="flex items-center gap-2 text-text-muted text-xs">
                                    <Activity className="w-4 h-4" />
                                    <span>Klinik holat</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <div className="text-center space-y-4">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-r from-accent-primary via-accent-info to-accent-secondary bg-clip-text text-transparent"
                >
                    MEDICAI SIMULATOR
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl text-text-secondary max-w-2xl mx-auto"
                >
                    Klinik fikrlashingizni oshiring. Yo'nalishni tanlang va real vaqtdagi simulyatsiyani boshlang.
                </motion.p>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {(Object.entries(SPECIALTIES) as [Specialty, any][]).map(([id, info]) => (
                    <motion.div
                        key={id}
                        variants={item}
                        onClick={() => setSelectedSpecialty(id)}
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
                            <div className="mt-4 flex items-center gap-2 text-accent-primary font-bold text-sm opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                Ssenariylarni ko'rish <ChevronRight className="w-4 h-4" />
                            </div>
                        </div>

                        {/* Glow Effect */}
                        <div className={`absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity blur-xl`} style={{ background: info.gradient }} />
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};
