import { create } from 'zustand';
import { AIScenario, PatientStats, VisualState, ChatMessage, ActionResult } from './types';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002/api';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export const getGrade = (score: number) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
};

interface GameStore {
    // Setup
    topic: string;
    difficulty: Difficulty;
    durationMinutes: number;
    isGenerating: boolean;
    generateError: string | null;

    // Simulation state
    scenario: AIScenario | null;
    currentStats: PatientStats;
    currentVisual: VisualState;
    healthBar: number;
    score: number;
    elapsedMinutes: number;
    isAlive: boolean;
    simulationStatus: 'in_progress' | 'success' | 'failed';
    isGameOver: boolean;
    gameOverReason?: string;

    // Chat
    messages: ChatMessage[];
    isProcessing: boolean;
    actionHistory: string[];

    // Actions
    setTopic: (topic: string) => void;
    setDifficulty: (difficulty: Difficulty) => void;
    setDurationMinutes: (minutes: number) => void;
    startSimulation: () => Promise<void>;
    sendAction: (action: string) => Promise<void>;
    updateTime: (minutes: number) => void;
    resetGame: () => void;
}

const defaultStats: PatientStats = { hr: 0, bp: '0/0', spo2: 0, rr: 0, temp: 0, gcs: 15 };
const defaultVisual: VisualState = { spline_state: 'Idle', skin_color: 'normal', monitor_sound: 'normal_beep' };

function uid() {
    return Math.random().toString(36).slice(2);
}

export const useGameStore = create<GameStore>((set, get) => ({
    topic: '',
    difficulty: 'Medium',
    durationMinutes: 30,
    isGenerating: false,
    generateError: null,
    scenario: null,
    currentStats: defaultStats,
    currentVisual: defaultVisual,
    healthBar: 100,
    score: 100,
    elapsedMinutes: 0,
    isAlive: true,
    simulationStatus: 'in_progress',
    isGameOver: false,
    gameOverReason: undefined,
    messages: [],
    isProcessing: false,
    actionHistory: [],

    setTopic: (topic) => set({ topic, generateError: null }),
    setDifficulty: (difficulty) => set({ difficulty }),
    setDurationMinutes: (durationMinutes) => set({ durationMinutes }),

    startSimulation: async () => {
        const { topic, difficulty, durationMinutes } = get();
        if (!topic.trim()) return;
        set({ isGenerating: true, generateError: null });
        try {
            const res = await fetch(`${API}/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: topic.trim(),
                    difficulty,
                    timeLimitMinutes: durationMinutes,
                }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const scenario: AIScenario = await res.json();
            const systemMsg: ChatMessage = {
                id: uid(),
                role: 'system',
                content: scenario.initial_presentation,
            };
            set({
                isGenerating: false,
                scenario,
                currentStats: scenario.patient_stats,
                currentVisual: scenario.visual_state,
                healthBar: 100,
                score: 100,
                elapsedMinutes: 0,
                isAlive: true,
                simulationStatus: 'in_progress',
                isGameOver: false,
                gameOverReason: undefined,
                messages: [systemMsg],
                actionHistory: [],
            });
        } catch (err) {
            console.error(err);
            set({ isGenerating: false, generateError: 'Failed to generate scenario. Check that the backend is running.' });
        }
    },

    sendAction: async (action: string) => {
        const state = get();
        if (!state.scenario || state.isGameOver || state.isProcessing || !action.trim()) return;

        const userMsg: ChatMessage = { id: uid(), role: 'user', content: action.trim() };
        set({ isProcessing: true, messages: [...state.messages, userMsg], actionHistory: [...state.actionHistory, action.trim()] });

        try {
            const res = await fetch(`${API}/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: action.trim(),
                    scenario: state.scenario,
                    currentStats: state.currentStats,
                    currentVisual: state.currentVisual,
                    healthBar: state.healthBar,
                    elapsedMinutes: state.elapsedMinutes,
                    actionHistory: state.actionHistory.slice(-5),
                }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const result: ActionResult = await res.json();

            const aiMsg: ChatMessage = {
                id: uid(),
                role: 'assistant',
                content: `${result.medical_text}\n\n${result.feedback}`,
                metadata: {
                    feedback_type: result.feedback_type,
                    score_impact: result.score_impact,
                    health_bar: result.health_bar,
                },
            };

            set((s) => ({
                isProcessing: false,
                currentStats: result.patient_stats,
                currentVisual: result.visual_state,
                healthBar: result.health_bar,
                score: Math.max(0, s.score + result.score_impact),
                simulationStatus: result.simulation_status,
                isAlive: result.is_alive,
                isGameOver: result.game_over,
                gameOverReason: result.game_over_reason,
                messages: [...s.messages, aiMsg],
            }));
        } catch (err) {
            console.error(err);
            const errMsg: ChatMessage = { id: uid(), role: 'assistant', content: 'Error processing action. Please try again.', metadata: { feedback_type: 'error' } };
            set((s) => ({ isProcessing: false, messages: [...s.messages, errMsg] }));
        }
    },

    updateTime: (minutes: number) => {
        const { scenario, isGameOver } = get();
        if (!scenario || isGameOver) return;
        set((s) => {
            const newElapsed = s.elapsedMinutes + minutes;
            const timeExpired = newElapsed >= scenario.time_limit_minutes;
            return {
                elapsedMinutes: newElapsed,
                isGameOver: timeExpired,
                gameOverReason: timeExpired ? 'Time limit reached.' : undefined,
            };
        });
    },

    resetGame: () => set({
        topic: '',
        difficulty: 'Medium',
        durationMinutes: 30,
        isGenerating: false,
        generateError: null,
        scenario: null,
        currentStats: defaultStats,
        currentVisual: defaultVisual,
        healthBar: 100,
        score: 100,
        elapsedMinutes: 0,
        isAlive: true,
        simulationStatus: 'in_progress',
        isGameOver: false,
        gameOverReason: undefined,
        messages: [],
        isProcessing: false,
        actionHistory: [],
    }),
}));
