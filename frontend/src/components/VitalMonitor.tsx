"use client";

import React from 'react';
import { Heart, Activity, Wind, Thermometer } from 'lucide-react';
import { PatientStats } from '@/lib/types';
import { getVitalSeverity } from '@/lib/simulation-engine';
import { motion } from 'framer-motion';

interface VitalMonitorProps {
    stats: PatientStats;
}

export const VitalMonitor: React.FC<VitalMonitorProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-2 gap-4 w-full">
            {/* Heart Rate */}
            <VitalCard
                label="Puls (HR)"
                value={stats.hr}
                unit="bpm"
                icon={<Heart className={`w-5 h-5 ${getVitalSeverity('hr', stats.hr) === 'normal' ? 'text-accent-primary animate-heartbeat' : 'text-accent-danger animate-vital-flash'}`} />}
                severity={getVitalSeverity('hr', stats.hr)}
            />

            {/* Blood Pressure */}
            <VitalCard
                label="Arterial Bosim (BP)"
                value={stats.bp}
                unit="mmHg"
                icon={<Activity className="w-5 h-5 text-accent-secondary" />}
                severity={getVitalSeverity('bp', stats.bp)}
            />

            {/* SpO2 */}
            <VitalCard
                label="Saturatsiya (SpO2)"
                value={stats.spo2}
                unit="%"
                icon={<Wind className="w-5 h-5 text-accent-info" />}
                severity={getVitalSeverity('spo2', stats.spo2)}
            />

            {/* Respiratory Rate */}
            <VitalCard
                label="Nafas Soni (RR)"
                value={stats.rr || 0}
                unit="min"
                icon={<Wind className="w-5 h-5 text-blue-400" />}
                severity={getVitalSeverity('rr', stats.rr || 0)}
            />
        </div>
    );
};

interface VitalCardProps {
    label: string;
    value: string | number;
    unit: string;
    icon: React.ReactNode;
    severity: 'normal' | 'warning' | 'danger' | 'critical';
}

const VitalCard: React.FC<VitalCardProps> = ({ label, value, unit, icon, severity }) => {
    const severityClasses = {
        normal: 'vital-card-normal border-green-500/10',
        warning: 'vital-card-warning border-yellow-500/10',
        danger: 'vital-card-danger border-red-500/10 animate-pulse-glow',
        critical: 'vital-card-danger border-red-600/20 animate-vital-flash',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`vital-card glass-card-sm border-t-2 ${severityClasses[severity]}`}
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-text-muted text-[10px] font-black uppercase tracking-widest">{label}</span>
                {icon}
            </div>
            <div className="flex items-baseline gap-1">
                <span className={`text-xl font-bold font-mono ${severity === 'normal' ? 'text-text-primary' :
                    severity === 'warning' ? 'text-accent-warning' : 'text-accent-danger'
                    }`}>
                    {value}
                </span>
                <span className="text-text-muted text-[10px] font-bold uppercase">{unit}</span>
            </div>

            {/* Mini Chart Decoration */}
            <div className="mt-3 h-1 w-full bg-bg-secondary rounded-full overflow-hidden">
                <motion.div
                    className={`h-full rounded-full ${severity === 'normal' ? 'bg-accent-primary' :
                        severity === 'warning' ? 'bg-accent-warning' : 'bg-accent-danger'
                        }`}
                    initial={{ width: 0 }}
                    animate={{ width: '80%' }}
                    transition={{ duration: 1 }}
                />
            </div>
        </motion.div>
    );
};
