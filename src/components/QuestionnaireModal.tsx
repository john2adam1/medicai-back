"use client";

import React, { useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { Loader2, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { supabase } from '@/lib/supabase';
import { useI18n } from '@/lib/i18n';

export default function QuestionnaireModal() {
    const { user, setRecommendations, recommendations } = useAuthStore();

    const [courseLevel, setCourseLevel] = useState('');
    const [isDoctor, setIsDoctor] = useState(false);
    const [weakTopicInput, setWeakTopicInput] = useState('');
    const [weakTopics, setWeakTopics] = useState<string[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const API = process.env.NEXT_PUBLIC_API_URL || '/api';

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setError('');
        setLoading(true);

        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData.session?.access_token;

            // 1. Update user metadata in auth state
            const { data: updatedAuth, error: authError } = await supabase.auth.updateUser({
                data: {
                    course_level: courseLevel,
                    is_doctor: isDoctor,
                    weak_topics: weakTopics
                }
            });
            if (authError) {
                console.error("Auth metadata update error:", authError);
            } else if (updatedAuth?.user) {
                useAuthStore.getState().setUser(updatedAuth.user);
            }

            // 2. Fetch AI Recommendations
            const res = await fetch(`${API}/recommendations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    course_level: courseLevel,
                    is_doctor: isDoctor,
                    weak_topics: weakTopics,
                    language: useI18n.getState().lang
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to fetch recommendations');
            }

            // Expected data.recommendations format from the prompt: array of recommendations, e.g. { topic, description } OR strings. 
            // The prompt says: "Gemini kelajakda ishlash uchun 3 ta "Mukammal Case" (vaziyat) nomini JSON formatda frontendga tavsiya sifatida qaytaradi."
            // Assuming data is an array of strings or objects. I will check the type and map it carefully.

            let recs = data.recommendations || data;
            // if it is an array of strings, convert to objects
            if (Array.isArray(recs) && typeof recs[0] === 'string') {
                recs = recs.map(r => ({ topic: r, description: 'AI recommended scenario' }));
            }

            setRecommendations(recs);
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Only show if user is authenticated and has no recommendations yet
    if (!user || recommendations) {
        return null; // we might want to let the parent handle this, but it's safe to return null here
    }

    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172a]/40 backdrop-blur-sm">
                <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                    className="bg-[var(--color-surface)] w-full max-w-lg p-6 rounded-2xl border border-[var(--color-border)] shadow-xl relative max-h-[90vh] overflow-y-auto">

                    <h2 className="text-xl font-bold text-[var(--color-text)] mb-2">Welcome to MedicAI</h2>
                    <p className="text-sm text-[var(--color-text-2)] mb-6">
                        Please tell us your current medical level and topics you want to improve on. Our AI will generate 3 perfect clinical cases for you.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-rose-500/10 text-rose-600 p-3 rounded-md text-sm border border-rose-500/20">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-2)] mb-1">
                                Course / Medical Level
                            </label>
                            <input
                                type="text"
                                required
                                value={courseLevel}
                                onChange={(e) => setCourseLevel(e.target.value)}
                                placeholder="e.g. 3-kurs student, Resident..."
                                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md shadow-sm placeholder-[var(--color-text-3)] focus:outline-none focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] bg-[var(--color-surface-2)] text-[var(--color-text)] sm:text-sm"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_doctor"
                                checked={isDoctor}
                                onChange={(e) => setIsDoctor(e.target.checked)}
                                className="h-4 w-4 text-[var(--color-accent)] border-[var(--color-border)] rounded focus:ring-[var(--color-accent)] cursor-pointer"
                            />
                            <label htmlFor="is_doctor" className="text-sm font-medium text-[var(--color-text-2)] cursor-pointer select-none">
                                I am already a practicing doctor
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-2)] mb-1">
                                Weak Topics (Press Enter to add)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={weakTopicInput}
                                    onChange={(e) => setWeakTopicInput(e.target.value)}
                                    onKeyDown={addTopic}
                                    placeholder="e.g. kardiologiya, nevrologiya"
                                    className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded-md shadow-sm placeholder-[var(--color-text-3)] focus:outline-none focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] bg-[var(--color-surface-2)] text-[var(--color-text)] sm:text-sm"
                                />
                                <button type="button" onClick={addTopic} className="px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-md hover:bg-[var(--color-border)] transition-colors">
                                    <Plus className="w-5 h-5 text-[var(--color-text-2)]" />
                                </button>
                            </div>
                            {weakTopics.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {weakTopics.map(topic => (
                                        <div key={topic} className="flex items-center gap-1 bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-2 py-1 rounded-full text-xs font-medium">
                                            {topic}
                                            <button type="button" onClick={() => removeTopic(topic)} className="hover:bg-[var(--color-accent)]/20 rounded-full p-0.5 transition-colors">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading || !courseLevel}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent)] disabled:opacity-50 transition-colors"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Generating Perfect Cases...
                                    </span>
                                ) : 'Get My Recommendations'}
                            </button>
                        </div>
                    </form>

                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
