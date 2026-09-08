"use client";

import React from 'react';
import { User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/lib/auth-store';

export default function ProfileWidget({ className = "" }: { className?: string }) {
    const router = useRouter();
    const { t } = useTranslation();
    const { user } = useAuthStore();

    const displayName = user?.user_metadata?.full_name || user?.user_metadata?.first_name || user?.email?.split('@')[0] || t('profile');
    const displayRole = user?.user_metadata?.course_level || (user?.email ? t('profile') : "Tibbiyot Xodimi");

    return (
        <div
            onClick={() => router.push('/profile')}
            className={`p-4 bg-gradient-to-r from-[var(--color-surface-2)] to-[var(--color-surface)] cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border border-[var(--color-border)] rounded-2xl sm:rounded-none sm:border-x-0 sm:border-b-0 relative overflow-hidden ${className}`}
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-accent)]/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-accent)]/80 to-[var(--color-accent)] flex items-center justify-center shadow-inner shadow-[var(--color-accent)]/50">
                        <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col max-w-[120px]">
                        <p className="text-sm font-bold text-[var(--color-text)] truncate" title={displayName}>{displayName}</p>
                        <p className="text-[10px] text-[var(--color-text-3)] font-medium truncate uppercase tracking-wider">{displayRole}</p>
                    </div>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); router.push('/profile?tab=subscription'); }}
                    className="text-[11px] font-bold text-white px-3 py-1.5 rounded-lg bg-gradient-to-r from-[var(--color-accent-yellow)] to-[#f59e0b] hover:shadow-md hover:shadow-[var(--color-accent-yellow)]/20 transition-all active:scale-95"
                >
                    {t('subscribe')}
                </button>
            </div>
        </div>
    );
}
