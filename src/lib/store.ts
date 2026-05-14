import { create } from 'zustand';
import {
    GameState,
    Scenario,
    PatientStats,
    VisualEngine,
    DrugAction,
    SimulationResponse
} from './types';
import { processAction } from './simulation-engine';

interface GameStore extends GameState {
    // Actions
    setScenario: (scenario: Scenario) => void;
    performAction: (action: DrugAction) => void;
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

    setScenario: (scenario: Scenario) => set({
        scenario,
        currentStats: scenario.initial_stats,
        currentVisual: scenario.initial_visual,
        isAlive: true,
        score: 100, // Start with base score
        totalActions: 0,
        history: [],
        elapsedMinutes: 0,
        isGameOver: false,
        gameOverReason: undefined,
    }),

    performAction: (action: DrugAction) => {
        const state = get();
        if (!state.scenario || state.isGameOver) return;

        // Process the action using simulation engine
        const response = processAction(
            action,
            state.currentStats,
            state.scenario,
            state.elapsedMinutes,
            state.currentVisual
        );

        const newHistory = [...state.history, response];
        const newScore = Math.max(0, state.score + response.score_impact);
        const newTotalActions = state.totalActions + 1;

        set({
            currentStats: response.patient_stats,
            currentVisual: response.visual_engine,
            isAlive: response.is_alive,
            history: newHistory,
            score: newScore,
            totalActions: newTotalActions,
            elapsedMinutes: response.elapsed_time,
            isGameOver: !response.is_alive || response.elapsed_time >= state.scenario.time_limit_minutes,
            gameOverReason: !response.is_alive ? 'Bemor vafot etdi.' :
                response.elapsed_time >= state.scenario.time_limit_minutes ? 'Vaqt tugadi.' : undefined
        });
    },

    updateTime: (minutes: number) => set((state) => ({
        elapsedMinutes: state.elapsedMinutes + minutes
    })),

    resetGame: () => set(initialState),
}));
