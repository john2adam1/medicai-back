"use client";

import React, { useEffect, useRef } from 'react';
import { useGameStore } from '@/lib/store';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { AlertTriangle, Zap, HeartPulse, CheckCircle2 } from 'lucide-react';

function getSkinColors(color: string): [string, string] {
    switch (color) {
        case 'pale': return ['#d8d8d8', '#b8b8b8'];
        case 'cyanotic': return ['#a8c8e8', '#6898c0'];
        case 'flushed': return ['#f0a090', '#d07060'];
        case 'jaundiced': return ['#e8d878', '#c8b840'];
        default: return ['#fde8c8', '#f0c898'];
    }
}

const ECG_FLATLINE = "M0,28 L300,28";
const ECG_NORMAL = "M0,28 L20,28 L25,28 L32,5 L37,50 L42,28 L60,28 L65,28 L72,5 L77,50 L82,28 L100,28 L105,28 L112,5 L117,50 L122,28 L140,28 L145,28 L152,5 L157,50 L162,28 L180,28 L185,28 L192,5 L197,50 L202,28 L220,28 L225,28 L232,5 L237,50 L242,28 L260,28 L265,28 L272,5 L277,50 L282,28 L300,28";
const ECG_FAST = "M0,28 L12,28 L15,28 L20,5 L25,50 L30,28 L42,28 L45,28 L50,5 L55,50 L60,28 L72,28 L75,28 L80,5 L85,50 L90,28 L102,28 L105,28 L110,5 L115,50 L120,28 L132,28 L135,28 L140,5 L145,50 L150,28 L162,28 L165,28 L170,5 L175,50 L180,28 L192,28 L195,28 L200,5 L205,50 L210,28 L222,28 L225,28 L230,5 L235,50 L240,28 L252,28 L255,28 L260,5 L265,50 L270,28 L282,28 L285,28 L290,5 L295,50 L300,28";

export const PatientVisualizer: React.FC = () => {
    const { currentVisual, isAlive, currentStats } = useGameStore();
    const state = currentVisual.spline_state;
    const skin = currentVisual.skin_color;
    const hr = currentStats.hr;
    const rr = currentStats.rr || 16;
    const [skinLight, skinDark] = getSkinColors(skin);

    const breathDuration = Math.max(1.5, 60 / rr);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getBodyAnim = (): any => {
        if (!isAlive || state === 'Dead') return { opacity: 0.5 };
        switch (state) {
            case 'Seizure': return {
                x: [-5, 5, -4, 4, -5, 5, -3, 3, 0],
                y: [-3, 3, -3, 3, -2, 2, 0],
                rotate: [-3, 3, -2, 2, -3, 3, 0],
                transition: { repeat: Infinity, duration: 0.2 }
            };
            case 'Pain': return {
                y: [0, -5, 2, -3, 0],
                transition: { repeat: Infinity, duration: 1.5 }
            };
            default: return {};
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getChestAnim = (): any => {
        if (!isAlive || state === 'Dead') return { scaleX: 1, scaleY: 1 };
        if (state === 'Seizure') return {
            scaleX: [1, 1.08, 0.96, 1.06, 1],
            scaleY: [1, 1.06, 0.96, 1.04, 1],
            transition: { repeat: Infinity, duration: 0.35 }
        };
        const speed = state === 'Unconscious' ? breathDuration * 1.8 : state === 'Pain' ? breathDuration * 0.6 : breathDuration;
        return {
            scaleX: [1, 1.07, 1],
            scaleY: [1, 1.05, 1],
            transition: { repeat: Infinity, duration: speed }
        };
    };

    const eyeScaleY = state === 'Dead' ? 0.1 : state === 'Unconscious' ? 0.15 : 1;

    const ecgPath = !isAlive || state === 'Dead'
        ? ECG_FLATLINE
        : (hr > 110 ? ECG_FAST : ECG_NORMAL);
    const ecgColor = !isAlive ? '#555' : hr > 120 ? '#ef476f' : '#06d6a0';
    const ecgSpeed = !isAlive ? '0s' : hr > 0 ? `${Math.max(1, 180 / hr)}s` : '3s';

    const stateColor = !isAlive ? '#555' :
        state === 'Recovery' ? '#06d6a0' :
        state === 'Pain' || state === 'Seizure' ? '#ef476f' :
        state === 'Unconscious' ? '#ffd166' : '#73d2de';

    return (
        <div className="patient-container select-none">
            <div className="p-4 flex flex-col items-center gap-3">
                {/* State badge */}
                <div className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`status-dot ${!isAlive ? 'status-dead' : state === 'Seizure' || state === 'Pain' ? 'status-critical' : state === 'Unconscious' ? 'status-warning' : 'status-alive'}`} />
                        <span className="text-xs font-semibold text-[#a0a0a0]">{state}</span>
                    </div>
                    <AnimatePresence mode="wait">
                        {state === 'Pain' && <motion.div key="pain" initial={{scale:0}} animate={{scale:1}} exit={{scale:0}}><AlertTriangle className="w-4 h-4 text-[#ef476f]" /></motion.div>}
                        {state === 'Seizure' && <motion.div key="seiz" initial={{scale:0}} animate={{scale:1,rotate:[0,15,-15,0]}} transition={{rotate:{repeat:Infinity,duration:0.3}}} exit={{scale:0}}><Zap className="w-4 h-4 text-[#ffd166] fill-[#ffd166]" /></motion.div>}
                        {state === 'Recovery' && <motion.div key="rec" initial={{scale:0}} animate={{scale:1,y:[0,-3,0]}} transition={{y:{repeat:Infinity,duration:1.5}}} exit={{scale:0}}><CheckCircle2 className="w-4 h-4 text-[#06d6a0]" /></motion.div>}
                        {(state === 'Idle' || state === 'Unconscious') && <motion.div key="idle" initial={{scale:0}} animate={{scale:1}} exit={{scale:0}}><HeartPulse className="w-4 h-4" style={{color: stateColor}} /></motion.div>}
                    </AnimatePresence>
                </div>

                {/* Patient figure */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={state}
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.35 }}
                        className="relative"
                        style={{ filter: !isAlive ? 'grayscale(0.85)' : 'none' }}
                    >
                        <motion.div animate={getBodyAnim()} className="relative">
                            <svg viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg" width="150" height="200">
                                <defs>
                                    <radialGradient id="skinGrad" cx="50%" cy="40%" r="55%">
                                        <stop offset="0%" stopColor={skinLight} />
                                        <stop offset="100%" stopColor={skinDark} />
                                    </radialGradient>
                                    {(state === 'Pain' || state === 'Seizure') && (
                                        <radialGradient id="sweatGrad" cx="50%" cy="50%" r="50%">
                                            <stop offset="0%" stopColor="rgba(180,220,255,0.9)" />
                                            <stop offset="100%" stopColor="rgba(140,200,255,0)" />
                                        </radialGradient>
                                    )}
                                </defs>

                                {/* Head */}
                                <ellipse cx="60" cy="38" rx="26" ry="30" fill="url(#skinGrad)" />

                                {/* Hair */}
                                <ellipse cx="60" cy="14" rx="26" ry="12" fill="#3a2a1a" />

                                {/* Eyes */}
                                <motion.ellipse
                                    cx="48" cy="35"
                                    rx="5" ry={eyeScaleY === 1 ? undefined : eyeScaleY * 5}
                                    animate={isAlive && state !== 'Unconscious' && state !== 'Dead' ? {
                                        ry: [5, 5, 0.5, 5, 5, 5, 0.5, 5],
                                        transition: { repeat: Infinity, duration: 4.5, times: [0,0.3,0.35,0.4,0.7,0.75,0.8,1] }
                                    } : { ry: eyeScaleY * 5 }}
                                    fill="#1a1a2e"
                                />
                                <motion.ellipse
                                    cx="72" cy="35"
                                    rx="5" ry={eyeScaleY === 1 ? undefined : eyeScaleY * 5}
                                    animate={isAlive && state !== 'Unconscious' && state !== 'Dead' ? {
                                        ry: [5, 5, 5, 0.5, 5, 5, 5, 0.5, 5],
                                        transition: { repeat: Infinity, duration: 5, times: [0,0.25,0.35,0.4,0.45,0.7,0.8,0.85,1] }
                                    } : { ry: eyeScaleY * 5 }}
                                    fill="#1a1a2e"
                                />

                                {/* Eye shine */}
                                {isAlive && state !== 'Dead' && (
                                    <>
                                        <circle cx="50" cy="33" r="1.5" fill="rgba(255,255,255,0.7)" />
                                        <circle cx="74" cy="33" r="1.5" fill="rgba(255,255,255,0.7)" />
                                    </>
                                )}

                                {/* Mouth */}
                                {state === 'Pain' && <path d="M50,52 Q60,46 70,52" stroke="#666" strokeWidth="2" fill="none" strokeLinecap="round" />}
                                {state === 'Seizure' && <path d="M52,50 L68,50" stroke="#888" strokeWidth="2.5" strokeLinecap="round" />}
                                {state === 'Dead' && <path d="M53,50 Q60,46 67,50" stroke="#666" strokeWidth="1.5" fill="none" />}
                                {state === 'Unconscious' && <path d="M54,51 Q60,53 66,51" stroke="#888" strokeWidth="1.5" fill="none" />}
                                {(state === 'Idle' || state === 'Recovery') && <path d="M52,50 Q60,56 68,50" stroke="#888" strokeWidth="1.5" fill="none" strokeLinecap="round" />}

                                {/* Neck */}
                                <rect x="52" y="66" width="16" height="12" rx="4" fill="url(#skinGrad)" />

                                {/* Torso — animated breathing */}
                                <motion.rect
                                    x="28" y="78" width="64" height="68" rx="10"
                                    fill="url(#skinGrad)"
                                    style={{ transformOrigin: '60px 112px' }}
                                    animate={getChestAnim()}
                                />

                                {/* Hospital gown lines */}
                                <line x1="60" y1="80" x2="60" y2="144" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                                <line x1="35" y1="100" x2="85" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                                <line x1="35" y1="120" x2="85" y2="120" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

                                {/* Heartbeat pulse on chest */}
                                {isAlive && state !== 'Dead' && (
                                    <motion.circle
                                        cx="60" cy="95" r="6"
                                        fill="none"
                                        stroke={hr > 120 ? '#ef476f' : '#06d6a0'}
                                        strokeWidth="1.5"
                                        animate={{
                                            scale: [1, 1.8, 1],
                                            opacity: [0.8, 0, 0.8],
                                        }}
                                        transition={{ repeat: Infinity, duration: hr > 0 ? 60 / hr : 1, ease: 'easeOut' }}
                                        style={{ transformOrigin: '60px 95px' }}
                                    />
                                )}

                                {/* Arms */}
                                <motion.rect
                                    x="8" y="80" width="20" height="52" rx="10"
                                    fill="url(#skinGrad)"
                                    animate={state === 'Pain' ? { rotate: [-5, 5, -5], transition: { repeat: Infinity, duration: 1.5 } } : {}}
                                    style={{ transformOrigin: '18px 80px' }}
                                />
                                <motion.rect
                                    x="92" y="80" width="20" height="52" rx="10"
                                    fill="url(#skinGrad)"
                                    animate={state === 'Pain' ? { rotate: [5, -5, 5], transition: { repeat: Infinity, duration: 1.5 } } : {}}
                                    style={{ transformOrigin: '102px 80px' }}
                                />

                                {/* Legs */}
                                <rect x="34" y="145" width="22" height="48" rx="10" fill="url(#skinGrad)" />
                                <rect x="64" y="145" width="22" height="48" rx="10" fill="url(#skinGrad)" />

                                {/* Sweat drops in pain/seizure */}
                                {(state === 'Pain' || state === 'Seizure') && (
                                    <>
                                        <motion.ellipse cx="82" cy="30" rx="2" ry="4" fill="rgba(160,210,240,0.7)" animate={{ y: [0, 15], opacity: [0.7, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} />
                                        <motion.ellipse cx="38" cy="28" rx="1.5" ry="3" fill="rgba(160,210,240,0.6)" animate={{ y: [0, 12], opacity: [0.6, 0] }} transition={{ repeat: Infinity, duration: 1.8, delay: 0.4 }} />
                                        <motion.ellipse cx="74" cy="42" rx="1.5" ry="3" fill="rgba(160,210,240,0.5)" animate={{ y: [0, 10], opacity: [0.5, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 0.8 }} />
                                    </>
                                )}

                                {/* Dead X eyes */}
                                {state === 'Dead' && (
                                    <>
                                        <line x1="44" y1="31" x2="52" y2="39" stroke="#555" strokeWidth="2.5" strokeLinecap="round" />
                                        <line x1="52" y1="31" x2="44" y2="39" stroke="#555" strokeWidth="2.5" strokeLinecap="round" />
                                        <line x1="68" y1="31" x2="76" y2="39" stroke="#555" strokeWidth="2.5" strokeLinecap="round" />
                                        <line x1="76" y1="31" x2="68" y2="39" stroke="#555" strokeWidth="2.5" strokeLinecap="round" />
                                    </>
                                )}

                                {/* IV line for treatment */}
                                {(state === 'Recovery' || state === 'Idle') && (
                                    <g opacity="0.5">
                                        <line x1="8" y1="100" x2="28" y2="105" stroke="#73d2de" strokeWidth="1.5" strokeDasharray="3,2" />
                                        <circle cx="8" cy="98" r="3" fill="#73d2de" opacity="0.6" />
                                    </g>
                                )}
                            </svg>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>

                {/* ECG display */}
                <div className="ecg-wrapper w-full">
                    <svg
                        className="ecg-line"
                        viewBox="0 0 300 56"
                        preserveAspectRatio="none"
                        style={{ animationDuration: ecgSpeed, animationPlayState: !isAlive ? 'paused' : 'running' }}
                    >
                        <path d={ecgPath} stroke={ecgColor} strokeWidth="2" fill="none" opacity="0.9" />
                        <path d={ecgPath} stroke={ecgColor} strokeWidth="2" fill="none" opacity="0.9" transform="translate(300,0)" />
                    </svg>
                    <div className="absolute bottom-1 right-2 text-[10px] font-mono" style={{ color: ecgColor }}>
                        {isAlive ? `${hr} bpm` : 'FLATLINE'}
                    </div>
                </div>

                {/* Skin info */}
                <div className="w-full flex items-center justify-between text-xs text-[#606060]">
                    <span>Skin: <span className="text-[#a0a0a0] capitalize">{skin}</span></span>
                    <span>SpO2: <span className={currentStats.spo2 < 90 ? 'text-[#ef476f]' : 'text-[#06d6a0]'}>{currentStats.spo2}%</span></span>
                </div>
            </div>
        </div>
    );
};
