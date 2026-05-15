// MedicAI Core Types
// ===== CORE TYPES =====

export type Specialty =
    | 'cardiology'
    | 'neurology'
    | 'pulmonology'
    | 'emergency'
    | 'pediatrics'
    | 'anesthesiology';

export type SplineState = 'Idle' | 'Pain' | 'Seizure' | 'Recovery' | 'Dead';
export type CameraAngle = 'default' | 'zoom_in_face' | 'zoom_in_chest' | 'full_body' | 'side_view';
export type SkinColor = 'normal' | 'pale' | 'cyanotic' | 'flushed' | 'jaundiced';
export type Severity = 'normal' | 'warning' | 'danger' | 'critical';

export interface PatientStats {
    hr: number;       // Heart rate
    bp: string;       // Blood pressure  "120/80"
    spo2: number;     // Oxygen saturation
    rr?: number;      // Respiratory rate
    temp?: number;    // Temperature
    gcs?: number;     // Glasgow Coma Scale
}

export interface VisualEngine {
    spline_state: SplineState;
    camera_angle: CameraAngle;
    skin_color: SkinColor;
}

export interface SimulationResponse {
    medical_text: string;
    feedback: string;
    feedback_type: 'success' | 'error' | 'warning' | 'info';
    patient_stats: PatientStats;
    visual_engine: VisualEngine;
    is_alive: boolean;
    score_impact: number;
    elapsed_time: number; // minutes since start
}

export interface DrugAction {
    drug_name: string;
    dose: string;
    route: 'IV' | 'IM' | 'PO' | 'SC' | 'Inhaler' | 'Sublingual';
}

export interface Scenario {
    id: string;
    specialty: Specialty;
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    initial_presentation: string;
    initial_stats: PatientStats;
    initial_visual: VisualEngine;
    expected_actions: string[];
    time_limit_minutes: number;
}

export interface GameState {
    scenario: Scenario | null;
    currentStats: PatientStats;
    currentVisual: VisualEngine;
    isAlive: boolean;
    score: number;
    totalActions: number;
    history: SimulationResponse[];
    elapsedMinutes: number;
    isGameOver: boolean;
    gameOverReason?: string;
}

export interface SpecialtyInfo {
    id: Specialty;
    name: string;
    nameUz: string;
    icon: string;
    description: string;
    color: string;
    gradient: string;
    scenarios: number;
}
