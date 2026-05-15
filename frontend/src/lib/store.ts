import { create } from 'zustand';
import {
    GameState,
    Scenario,
    PatientStats,
    DrugAction,
    SimulationResponse,
    Specialty
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface GameStore extends GameState {
    // Metadata
    specialties: Record<string, any> | null;
    scenarios: Record<string, Scenario[]> | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    initialize: () => Promise<void>;
    setScenario: (scenario: Scenario) => void;
    performAction: (action: DrugAction) => Promise<void>;
    resetGame: () => void;
    updateTime: (minutes: number) => void;
}

const initialState: GameState = {
    scenario: null,
    currentStats: { hr: 0, bp: '0/0', spo2: 0, rr: 0, temp: 0 },
    currentVisual: { spline_state: 'Idle', camera_angle: 'default', skin_color: 'normal' },
    isAlive: true,
    score: 0,
    totalActions: 0,
    history: [],
    elapsedMinutes: 0,
    isGameOver: false,
};

export const useGameStore = create<GameStore>((set, get) => ({
    ...initialState,
    specialties: null,
    scenarios: null,
    isLoading: false,
    error: null,

    initialize: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(`${API_BASE_URL}/metadata`);
            const data = await response.json();
            set({
                specialties: data.specialties,
                scenarios: data.scenarios,
                isLoading: false
            });
        } catch (err) {
            set({ error: 'Failed to load simulation data', isLoading: false });
        }
    },

    setScenario: (scenario: Scenario) => set({
        scenario,
        currentStats: scenario.initial_stats,
        currentVisual: scenario.initial_visual,
        isAlive: true,
        score: 100,
        totalActions: 0,
        history: [],
        elapsedMinutes: 0,
        isGameOver: false,
        gameOverReason: undefined,
    }),

    performAction: async (action: DrugAction) => {
        const state = get();
        if (!state.scenario || state.isGameOver) return;

        try {
            const response = await fetch(`${API_BASE_URL}/simulate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    currentStats: state.currentStats,
                    scenario: state.scenario,
                    elapsedMinutes: state.elapsedMinutes,
                    currentVisual: state.currentVisual
                })
            });

            const simulationResult: SimulationResponse = await response.json();

            const newHistory = [...state.history, simulationResult];
            const newScore = Math.max(0, state.score + simulationResult.score_impact);
            const newTotalActions = state.totalActions + 1;

            set({
                currentStats: simulationResult.patient_stats,
                currentVisual: simulationResult.visual_engine,
                isAlive: simulationResult.is_alive,
                history: newHistory,
                score: newScore,
                totalActions: newTotalActions,
                elapsedMinutes: simulationResult.elapsed_time,
                isGameOver: !simulationResult.is_alive || simulationResult.elapsed_time >= state.scenario.time_limit_minutes,
                gameOverReason: !simulationResult.is_alive ? 'Bemor vafot etdi.' :
                    simulationResult.elapsed_time >= state.scenario.time_limit_minutes ? 'Vaqt tugadi.' : undefined
            });
        } catch (err) {
            console.error('Simulation error:', err);
        }
    },

    updateTime: (minutes: number) => set((state) => ({
        elapsedMinutes: state.elapsedMinutes + minutes
    })),

    resetGame: () => set(prev => ({
        ...initialState,
        specialties: prev.specialties,
        scenarios: prev.scenarios
    })),
}));
