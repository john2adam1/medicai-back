import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AIRecommendation {
    topic: string;
    description: string;
}

interface AuthState {
    user: any | null;
    recommendations: AIRecommendation[] | null;
    setUser: (user: any | null) => void;
    setRecommendations: (recommendations: AIRecommendation[] | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            recommendations: null,
            setUser: (user) => set({ user }),
            setRecommendations: (recommendations) => set({ recommendations }),
            logout: () => set({ user: null, recommendations: null }),
        }),
        {
            name: 'medicai-auth-storage', // name of item in storage
        }
    )
);
