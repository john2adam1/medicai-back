export type SplineState = 'Idle' | 'Pain' | 'Unconscious' | 'Seizure' | 'Recovery' | 'Dead';
export type SkinColor = 'normal' | 'pale' | 'cyanotic' | 'flushed' | 'jaundiced';
export type MonitorSound = 'normal_beep' | 'fast_beep' | 'flatline';

export interface PatientStats {
    hr: number;
    bp: string;
    spo2: number;
    rr: number;
    temp: number;
    gcs: number;
}

export interface VisualState {
    spline_state: SplineState;
    skin_color: SkinColor;
    monitor_sound: MonitorSound;
}

export interface AIScenario {
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    initial_presentation: string;
    topic: string;
    patient_stats: PatientStats;
    visual_state: VisualState;
    time_limit_minutes: number;
}

export interface ActionResult {
    simulation_status: 'in_progress' | 'success' | 'failed';
    medical_text: string;
    feedback: string;
    feedback_type: 'success' | 'error' | 'warning' | 'info';
    patient_stats: PatientStats;
    visual_state: VisualState;
    score_impact: number;
    health_bar: number;
    is_alive: boolean;
    game_over: boolean;
    game_over_reason?: string;
}
