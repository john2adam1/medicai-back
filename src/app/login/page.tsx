"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { supabase } from '@/lib/supabase';
import { Heart, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const setUser = useAuthStore((state) => state.setUser);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data, error: sbError } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (sbError) throw sbError;
            if (data.session) {
                setUser(data.user);
                router.push('/');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred during login');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-[var(--color-bg)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-center">
                        <Heart className="w-6 h-6 text-[var(--color-accent)] animate-heartbeat" />
                    </div>
                </div>
                <h2 className="mt-2 text-center text-3xl font-extrabold text-[var(--color-text)]">
                    Sign in to MedicAI
                </h2>
                <p className="mt-2 text-center text-sm text-[var(--color-text-2)]">
                    Or <Link href="/register" className="font-medium text-[var(--color-accent-blue)] hover:text-[var(--color-accent-blue)]/80">register for a new account</Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-[var(--color-surface)] py-8 px-4 shadow rounded-xl border border-[var(--color-border)] sm:px-10">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        {error && (
                            <div className="bg-rose-500/10 text-rose-600 p-3 rounded-md text-sm border border-rose-500/20">
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-2)] mb-1">
                                Email address
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md shadow-sm placeholder-[var(--color-text-3)] focus:outline-none focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] bg-[var(--color-surface-2)] text-[var(--color-text)] sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-2)] mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md shadow-sm placeholder-[var(--color-text-3)] focus:outline-none focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] bg-[var(--color-surface-2)] text-[var(--color-text)] sm:text-sm"
                            />
                        </div>

                        <div className="space-y-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-[var(--color-bg)] bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent)] disabled:opacity-50 transition-colors"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log in securely'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
