"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Settings, CreditCard, Palette, Globe, Award, Loader2, ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation, useI18n, Language } from '@/lib/i18n';
import { useAuthStore } from '@/lib/auth-store';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
    const router = useRouter();
    const { t } = useTranslation();
    const { lang, setLang } = useI18n();
    const { user, setUser } = useAuthStore();

    const [isPersonalOpen, setIsPersonalOpen] = useState(true);
    const [fullName, setFullName] = useState(user?.user_metadata?.full_name || user?.user_metadata?.first_name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [courseLevel, setCourseLevel] = useState(user?.user_metadata?.course_level || '3-kurs student');
    const [isDoctor, setIsDoctor] = useState<boolean>(Boolean(user?.user_metadata?.is_doctor));
    const [weakTopics, setWeakTopics] = useState<string[]>(user?.user_metadata?.weak_topics || []);
    const [weakTopicInput, setWeakTopicInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user) {
            setFullName(user?.user_metadata?.full_name || user?.user_metadata?.first_name || '');
            setEmail(user?.email || '');
            setCourseLevel(user?.user_metadata?.course_level || '3-kurs student');
            setIsDoctor(Boolean(user?.user_metadata?.is_doctor));
            setWeakTopics(user?.user_metadata?.weak_topics || []);
        }
    }, [user]);

    const userPoints = user?.user_metadata?.points || 0;

    const addTopic = (e: React.KeyboardEvent | React.MouseEvent) => {
        if ('key' in e && e.key !== 'Enter') return;
        e.preventDefault();
        const topic = weakTopicInput.trim();
        if (topic && !weakTopics.includes(topic)) {
            setWeakTopics([...weakTopics, topic]);
        }
        setWeakTopicInput('');
    };

    const removeTopic = (topicToRemove: string) => {
        setWeakTopics(weakTopics.filter(t => t !== topicToRemove));
    };

    const handleSavePersonalInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ type: '', text: '' });

        try {
            // Update auth email
            if (email !== user?.email) {
                const { error: emailError } = await supabase.auth.updateUser({ email });
                if (emailError) throw emailError;
            }

            // Update auth metadata
            const { data, error: metaError } = await supabase.auth.updateUser({
                data: {
                    full_name: fullName.trim(),
                    course_level: courseLevel,
                    is_doctor: isDoctor,
                    weak_topics: weakTopics
                }
            });
            if (metaError) throw metaError;

            if (data.user) {
                setUser(data.user);
            }
            setMsg({ type: 'success', text: 'Ma\'lumotlar muvaffaqiyatli saqlandi!' });
            setTimeout(() => { setMsg({ type: '', text: '' }); }, 3000);
        } catch (err: any) {
            setMsg({ type: 'error', text: err.message || 'Xatolik yuz berdi' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex justify-center p-6">
            <div className="w-full max-w-2xl">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm text-[var(--color-text-3)] hover:text-[var(--color-text)] mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> {t('back')}
                </button>

                <h1 className="text-2xl font-bold mb-8">{t('settings')}</h1>

                <div className="space-y-4">
                    <div className="card p-5 border border-[var(--color-border)] flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                <Globe className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">{t('language')}</h3>
                            </div>
                        </div>
                        <select
                            value={lang}
                            onChange={(e) => setLang(e.target.value as Language)}
                            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-sm"
                        >
                            <option value="uz">O'zbek</option>
                            <option value="en">English</option>
                            <option value="ru">Русский</option>
                        </select>
                    </div>

                    <div className="card p-5 border border-[var(--color-border)] flex items-center justify-between bg-gradient-to-r from-[var(--color-accent)]/5 to-transparent">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)]">
                                <Award className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">{t('accumulated_points')}</h3>
                                <p className="text-xs text-[var(--color-text-3)] mt-0.5">{t('discount_info')}</p>
                            </div>
                        </div>
                        <div className="text-xl font-bold text-[var(--color-accent)] shrink-0 pl-4 border-l border-[var(--color-border)] flex flex-col items-center justify-center min-w-[80px]">
                            {userPoints}
                            <span className="text-[10px] uppercase font-medium text-[var(--color-accent)]/70">{t('pts')}</span>
                        </div>
                    </div>

                    <div className="card border border-[var(--color-border)] overflow-hidden transition-all">
                        <div
                            className="p-5 hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer flex items-center justify-between"
                            onClick={() => setIsPersonalOpen(!isPersonalOpen)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm">{t('personal_info')}</h3>
                                    <p className="text-xs text-[var(--color-text-3)]">{t('personal_desc')}</p>
                                </div>
                            </div>
                            {isPersonalOpen ? <ChevronUp className="w-5 h-5 text-[var(--color-text-3)]" /> : <ChevronDown className="w-5 h-5 text-[var(--color-text-3)]" />}
                        </div>

                        {isPersonalOpen && (
                            <form onSubmit={handleSavePersonalInfo} className="p-5 border-t border-[var(--color-border)] bg-[var(--color-surface)]/50 space-y-4">
                                {msg.text && (
                                    <div className={`p-3 rounded-md text-sm border ${msg.type === 'error' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'}`}>
                                        {msg.text}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-2)] mb-1">To'liq ism / Familiya</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={e => setFullName(e.target.value)}
                                        className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] bg-[var(--color-bg)] text-[var(--color-text)] sm:text-sm"
                                        placeholder="Ism va Familiyangiz"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-2)] mb-1">Email manzili</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] bg-[var(--color-bg)] text-[var(--color-text)] sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-2)] mb-1">Tibbiy daraja / Kurs</label>
                                    <input
                                        type="text"
                                        value={courseLevel}
                                        onChange={e => setCourseLevel(e.target.value)}
                                        placeholder="masalan: 3-kurs student, Resident..."
                                        className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] bg-[var(--color-bg)] text-[var(--color-text)] sm:text-sm"
                                    />
                                </div>

                                <div className="flex items-center gap-2 pt-1">
                                    <input
                                        type="checkbox"
                                        id="profile_is_doctor"
                                        checked={isDoctor}
                                        onChange={e => setIsDoctor(e.target.checked)}
                                        className="h-4 w-4 text-[var(--color-accent)] border-[var(--color-border)] rounded focus:ring-[var(--color-accent)] cursor-pointer"
                                    />
                                    <label htmlFor="profile_is_doctor" className="text-sm font-medium text-[var(--color-text-2)] cursor-pointer select-none">
                                        Amaliyotchi shifokorman (Practicing doctor)
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-2)] mb-1">
                                        Zaif mavzular (Weak topics)
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={weakTopicInput}
                                            onChange={e => setWeakTopicInput(e.target.value)}
                                            onKeyDown={addTopic}
                                            placeholder="masalan: kardiologiya, nevrologiya"
                                            className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] bg-[var(--color-bg)] text-[var(--color-text)] sm:text-sm"
                                        />
                                        <button type="button" onClick={addTopic} className="px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-md hover:bg-[var(--color-border)] transition-colors">
                                            <Plus className="w-5 h-5 text-[var(--color-text-2)]" />
                                        </button>
                                    </div>
                                    {weakTopics.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {weakTopics.map(topic => (
                                                <div key={topic} className="flex items-center gap-1 bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-2.5 py-1 rounded-full text-xs font-medium">
                                                    {topic}
                                                    <button type="button" onClick={() => removeTopic(topic)} className="hover:bg-[var(--color-accent)]/20 rounded-full p-0.5 transition-colors">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent)] disabled:opacity-50 transition-colors"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Saqlash'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    <div className="card p-5 border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-colors cursor-pointer flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-accent-yellow)]/10 flex items-center justify-center text-[var(--color-accent-yellow)]">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">{t('payment')}</h3>
                            <p className="text-xs text-[var(--color-text-3)]">{t('payment_desc')}</p>
                        </div>
                    </div>


                </div>
            </div>
        </main>
    );
}
