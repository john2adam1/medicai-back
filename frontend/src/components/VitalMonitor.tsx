"use client";

import React from 'react';
import { useGameStore } from '@/lib/store';
import { Heart, Activity, Wind, Thermometer } from 'lucide-react';

function getSeverity(type: 'hr' | 'spo2' | 'bp' | 'rr', value: number): 'normal' | 'warning' | 'danger' | 'critical' {
    if (type === 'hr') {
        if (value >= 60 && value <= 100) return 'normal';
        if ((value >= 50 && value < 60) || (value > 100 && value <= 120)) return 'warning';
        if ((value >= 40 && value < 50) || (value > 120 && value <= 150)) return 'danger';
        return 'critical';
    }
    if (type === 'spo2') {
        if (value >= 95) return 'normal';
        if (value >= 90) return 'warning';
        if (value >= 85) return 'danger';
        return 'critical';
    }
    if (type === 'bp') {
        if (value >= 90 && value <= 140) return 'normal';
        if ((value >= 80 && value < 90) || (value > 140 && value <= 180)) return 'warning';
        if ((value >= 70 && value < 80) || (value > 180 && value <= 210)) return 'danger';
        return 'critical';
    }
    if (type === 'rr') {
        if (value >= 12 && value <= 20) return 'normal';
        if ((value >= 8 && value < 12) || (value > 20 && value <= 28)) return 'warning';
        return 'danger';
    }
    return 'normal';
}

const severityColor = {
    normal: '#06d6a0',
    warning: '#ffd166',
    danger: '#ef476f',
    critical: '#ef476f',
};

interface VitalRowProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    severity: 'normal' | 'warning' | 'danger' | 'critical';
}

function VitalRow({ icon, label, value, severity }: VitalRowProps) {
    const color = severityColor[severity];
    return (
        <div className={`vital-card vital-card-${severity === 'normal' ? '' : severity}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span style={{ color }} className="flex-shrink-0">{icon}</span>
                    <span className="text-xs text-[#606060] font-medium">{label}</span>
                </div>
                <span className="font-mono font-bold text-sm" style={{ color }}>{value}</span>
            </div>
        </div>
    );
}

export const VitalMonitor: React.FC = () => {
    const { currentStats, healthBar, score, elapsedMinutes, scenario } = useGameStore();
    const sys = parseInt(currentStats.bp.split('/')[0]) || 0;

    const hrSev = getSeverity('hr', currentStats.hr);
    const spo2Sev = getSeverity('spo2', currentStats.spo2);
    const bpSev = getSeverity('bp', sys);
    const rrSev = getSeverity('rr', currentStats.rr);

    const hpColor = healthBar > 60 ? '#06d6a0' : healthBar > 30 ? '#ffd166' : '#ef476f';
    const timeProgress = scenario ? Math.min(100, (elapsedMinutes / scenario.time_limit_minutes) * 100) : 0;

    return (
        <div className="space-y-2">
            {/* Health & Score */}
            <div className="card p-3 space-y-3">
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[#606060]">Patient Health</span>
                        <span className="text-xs font-mono font-bold" style={{ color: hpColor }}>{healthBar}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#222] overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${healthBar}%`, background: hpColor }}
                        />
                    </div>
                </div>

                {scenario && (
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-[#606060]">Time</span>
                            <span className="text-xs font-mono text-[#a0a0a0]">{Math.floor(elapsedMinutes)}/{scenario.time_limit_minutes}m</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[#222] overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-700 bg-[#73d2de]"
                                style={{ width: `${timeProgress}%` }}
                            />
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-[rgba(255,255,255,0.05)]">
                    <span className="text-xs text-[#606060]">Score</span>
                    <span className="text-xs font-mono font-bold text-[#ffd166]">{score}</span>
                </div>
            </div>

            {/* Vitals */}
            <div className="space-y-1.5">
                <VitalRow icon={<Heart className="w-3.5 h-3.5" />} label="Heart Rate" value={`${currentStats.hr} bpm`} severity={hrSev} />
                <VitalRow icon={<Activity className="w-3.5 h-3.5" />} label="Blood Pressure" value={currentStats.bp} severity={bpSev} />
                <VitalRow icon={<Wind className="w-3.5 h-3.5" />} label="SpO2" value={`${currentStats.spo2}%`} severity={spo2Sev} />
                <VitalRow icon={<Wind className="w-3.5 h-3.5" />} label="Resp. Rate" value={`${currentStats.rr}/min`} severity={rrSev} />
                {currentStats.gcs < 15 && (
                    <VitalRow icon={<Thermometer className="w-3.5 h-3.5" />} label="GCS" value={`${currentStats.gcs}/15`} severity={currentStats.gcs < 9 ? 'critical' : currentStats.gcs < 13 ? 'danger' : 'warning'} />
                )}
            </div>
        </div>
    );
};
