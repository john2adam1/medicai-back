import {
    DrugAction,
    PatientStats,
    SimulationResponse,
    SplineState,
    CameraAngle,
    SkinColor,
    Scenario,
    Severity,
} from './types';

// ===== DRUG DATABASE =====

interface DrugEffect {
    hr_change: number;
    bp_sys_change: number;
    bp_dia_change: number;
    spo2_change: number;
    rr_change: number;
    onset_minutes: number;
    is_correct_for?: string[]; // scenario IDs where this drug is correct
    contraindications?: string[];
    lethal_dose?: number; // mg - above this is dangerous
}

const DRUG_DATABASE: Record<string, DrugEffect> = {
    // Cardiac drugs
    'aspirin': { hr_change: 0, bp_sys_change: 0, bp_dia_change: 0, spo2_change: 0, rr_change: 0, onset_minutes: 15, is_correct_for: ['card-001', 'neuro-001'] },
    'clopidogrel': { hr_change: 0, bp_sys_change: 0, bp_dia_change: 0, spo2_change: 0, rr_change: 0, onset_minutes: 30, is_correct_for: ['card-001'] },
    'heparin': { hr_change: 0, bp_sys_change: 0, bp_dia_change: 0, spo2_change: 0, rr_change: 0, onset_minutes: 5, is_correct_for: ['card-001'] },
    'nitroglycerin': { hr_change: 5, bp_sys_change: -20, bp_dia_change: -10, spo2_change: 1, rr_change: -1, onset_minutes: 2, is_correct_for: ['card-001', 'card-003'], contraindications: ['low_bp'] },
    'morphine': { hr_change: -5, bp_sys_change: -10, bp_dia_change: -5, spo2_change: -1, rr_change: -3, onset_minutes: 5, is_correct_for: ['card-001'], lethal_dose: 30 },
    'metoprolol': { hr_change: -25, bp_sys_change: -15, bp_dia_change: -10, spo2_change: 0, rr_change: -1, onset_minutes: 5, is_correct_for: ['card-002'], contraindications: ['low_hr', 'low_bp'] },
    'diltiazem': { hr_change: -20, bp_sys_change: -10, bp_dia_change: -8, spo2_change: 0, rr_change: 0, onset_minutes: 5, is_correct_for: ['card-002'] },
    'amiodarone': { hr_change: -15, bp_sys_change: -10, bp_dia_change: -5, spo2_change: 0, rr_change: 0, onset_minutes: 15, is_correct_for: ['card-002'] },
    'nitroprusside': { hr_change: 5, bp_sys_change: -40, bp_dia_change: -25, spo2_change: 1, rr_change: -1, onset_minutes: 1, is_correct_for: ['card-003'] },
    'labetalol': { hr_change: -10, bp_sys_change: -30, bp_dia_change: -15, spo2_change: 0, rr_change: 0, onset_minutes: 5, is_correct_for: ['card-003'] },
    'furosemide': { hr_change: 0, bp_sys_change: -10, bp_dia_change: -5, spo2_change: 1, rr_change: -1, onset_minutes: 15, is_correct_for: ['card-003'] },

    // Neurological drugs
    'alteplase': { hr_change: 0, bp_sys_change: -5, bp_dia_change: -3, spo2_change: 1, rr_change: 0, onset_minutes: 10, is_correct_for: ['neuro-001'], contraindications: ['bleeding'] },
    'diazepam': { hr_change: -5, bp_sys_change: -5, bp_dia_change: -3, spo2_change: -2, rr_change: -4, onset_minutes: 2, is_correct_for: ['neuro-002'], lethal_dose: 50 },
    'lorazepam': { hr_change: -5, bp_sys_change: -5, bp_dia_change: -3, spo2_change: -1, rr_change: -3, onset_minutes: 2, is_correct_for: ['neuro-002'] },
    'phenytoin': { hr_change: -10, bp_sys_change: -10, bp_dia_change: -5, spo2_change: 0, rr_change: 0, onset_minutes: 15, is_correct_for: ['neuro-002'] },

    // Pulmonary drugs
    'salbutamol': { hr_change: 10, bp_sys_change: 0, bp_dia_change: 0, spo2_change: 4, rr_change: -4, onset_minutes: 5, is_correct_for: ['pulmo-001'] },
    'ipratropium': { hr_change: 5, bp_sys_change: 0, bp_dia_change: 0, spo2_change: 3, rr_change: -3, onset_minutes: 10, is_correct_for: ['pulmo-001'] },
    'prednizolon': { hr_change: 0, bp_sys_change: 0, bp_dia_change: 0, spo2_change: 2, rr_change: -2, onset_minutes: 30, is_correct_for: ['pulmo-001'] },
    'magnesium_sulfate': { hr_change: -5, bp_sys_change: -5, bp_dia_change: -3, spo2_change: 3, rr_change: -3, onset_minutes: 15, is_correct_for: ['pulmo-001'] },

    // Emergency drugs  
    'adrenalin': { hr_change: 30, bp_sys_change: 40, bp_dia_change: 20, spo2_change: 5, rr_change: 2, onset_minutes: 1, is_correct_for: ['emrg-001'] },
    'difenhidramin': { hr_change: 0, bp_sys_change: 0, bp_dia_change: 0, spo2_change: 1, rr_change: -1, onset_minutes: 10, is_correct_for: ['emrg-001'] },
    'deksametazon': { hr_change: 0, bp_sys_change: 5, bp_dia_change: 2, spo2_change: 2, rr_change: -1, onset_minutes: 20, is_correct_for: ['emrg-001', 'pulmo-001'] },
    'noradrenalin': { hr_change: -5, bp_sys_change: 35, bp_dia_change: 15, spo2_change: 2, rr_change: 0, onset_minutes: 1, is_correct_for: ['emrg-002'] },

    // Pediatric drugs
    'ampicillin': { hr_change: 0, bp_sys_change: 0, bp_dia_change: 0, spo2_change: 1, rr_change: -2, onset_minutes: 30, is_correct_for: ['ped-001'] },
    'gentamicin': { hr_change: 0, bp_sys_change: 0, bp_dia_change: 0, spo2_change: 1, rr_change: -1, onset_minutes: 30, is_correct_for: ['ped-001'] },

    // Anesthesiology drugs
    'sugammadeks': { hr_change: 0, bp_sys_change: 0, bp_dia_change: 0, spo2_change: 0, rr_change: 0, onset_minutes: 3, is_correct_for: ['anes-001'] },
    'propofol': { hr_change: -10, bp_sys_change: -20, bp_dia_change: -10, spo2_change: -3, rr_change: -5, onset_minutes: 1, contraindications: ['low_bp'], lethal_dose: 300 },
    'ketamin': { hr_change: 15, bp_sys_change: 10, bp_dia_change: 5, spo2_change: 0, rr_change: 0, onset_minutes: 1 },
    'atropin': { hr_change: 20, bp_sys_change: 5, bp_dia_change: 3, spo2_change: 0, rr_change: 0, onset_minutes: 2 },
    'nalokson': { hr_change: 10, bp_sys_change: 10, bp_dia_change: 5, spo2_change: 3, rr_change: 5, onset_minutes: 2 },

    // General
    'kislorod': { hr_change: 0, bp_sys_change: 0, bp_dia_change: 0, spo2_change: 5, rr_change: -2, onset_minutes: 1, is_correct_for: ['pulmo-001', 'pulmo-002', 'emrg-001', 'emrg-002', 'anes-001', 'neuro-002'] },
    'iv_suyuqlik': { hr_change: -5, bp_sys_change: 15, bp_dia_change: 8, spo2_change: 1, rr_change: -1, onset_minutes: 10, is_correct_for: ['emrg-001', 'emrg-002', 'ped-001'] },
};

// ===== AGENT 1: ANALYST =====
// Validates drug actions, checks doses, routes, contraindications

function agentAnalyst(
    action: DrugAction,
    currentStats: PatientStats,
    scenario: Scenario
): { isValid: boolean; feedback: string; feedbackType: 'success' | 'error' | 'warning' | 'info'; scoreImpact: number } {
    const drugKey = action.drug_name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z_]/g, '');
    const drug = DRUG_DATABASE[drugKey];

    if (!drug) {
        return {
            isValid: false,
            feedback: `"${action.drug_name}" dori bazamizda topilmadi. Iltimos, dori nomini tekshiring.`,
            feedbackType: 'error',
            scoreImpact: -5,
        };
    }

    // Check contraindications
    const [bpSys] = currentStats.bp.split('/').map(Number);
    if (drug.contraindications?.includes('low_bp') && bpSys < 90) {
        return {
            isValid: false,
            feedback: `⚠️ XATO! ${action.drug_name} bemor gipotenziya holatida (AQB: ${currentStats.bp}) kontrindikatsiyadir! Bu dori bosimni yanada tushiradi.`,
            feedbackType: 'error',
            scoreImpact: -20,
        };
    }

    if (drug.contraindications?.includes('low_hr') && currentStats.hr < 60) {
        return {
            isValid: false,
            feedback: `⚠️ XATO! ${action.drug_name} bradikardiya holatida (HR: ${currentStats.hr}) kontrindikatsiyadir!`,
            feedbackType: 'error',
            scoreImpact: -15,
        };
    }

    // Check if correct drug for this scenario
    const isCorrectDrug = drug.is_correct_for?.includes(scenario.id);

    if (isCorrectDrug) {
        return {
            isValid: true,
            feedback: `✅ ${action.drug_name} ${action.dose} ${action.route} — to'g'ri tanlov! Bu shu holat uchun ko'rsatilgan dori.`,
            feedbackType: 'success',
            scoreImpact: 15,
        };
    }

    // Wrong but not harmful
    return {
        isValid: true,
        feedback: `⚠️ ${action.drug_name} berildi, lekin bu dori hozirgi holat (${scenario.title}) uchun birinchi qatordagi tanlov emas. Boshqa dorini ko'rib chiqing.`,
        feedbackType: 'warning',
        scoreImpact: -5,
    };
}

// ===== AGENT 2: PHYSIOLOGIST =====
// Updates patient vital signs based on drug effects and time progression

function agentPhysiologist(
    action: DrugAction,
    currentStats: PatientStats,
    scenario: Scenario,
    elapsedMinutes: number
): { newStats: PatientStats; medicalText: string; isAlive: boolean } {
    const drugKey = action.drug_name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z_]/g, '');
    const drug = DRUG_DATABASE[drugKey];

    const [bpSys, bpDia] = currentStats.bp.split('/').map(Number);

    let newHr = currentStats.hr;
    let newBpSys = bpSys;
    let newBpDia = bpDia;
    let newSpo2 = currentStats.spo2;
    let newRr = currentStats.rr || 16;
    let medicalText = '';

    if (drug) {
        // Apply drug effects with some randomness
        const variance = () => (Math.random() - 0.5) * 4; // ±2

        newHr = Math.round(currentStats.hr + drug.hr_change + variance());
        newBpSys = Math.round(bpSys + drug.bp_sys_change + variance());
        newBpDia = Math.round(bpDia + drug.bp_dia_change + variance());
        newSpo2 = Math.min(100, Math.round(currentStats.spo2 + drug.spo2_change + variance()));
        newRr = Math.max(0, Math.round(newRr + drug.rr_change + variance()));

        medicalText = `${action.drug_name} ${action.dose} ${action.route} orqali berildi. `;
        medicalText += `Dori ${drug.onset_minutes} daqiqadan keyin ta'sir ko'rsatadi. `;
    } else {
        // Unknown drug — minor random changes
        newHr += Math.round((Math.random() - 0.5) * 6);
        newSpo2 = Math.min(100, newSpo2 + Math.round((Math.random() - 0.5) * 2));
        medicalText = `${action.drug_name} berildi, lekin uning ta'siri aniqlanmadi. `;
    }

    // Natural deterioration over time if no correct treatment
    if (elapsedMinutes > scenario.time_limit_minutes * 0.5) {
        newSpo2 = Math.max(newSpo2 - 1, 50);
        newHr += 3;
        medicalText += 'Vaqt o\'tmoqda, bemor holati yomonlashmoqda. ';
    }

    // Clamp values
    newHr = Math.max(0, Math.min(250, newHr));
    newBpSys = Math.max(0, Math.min(300, newBpSys));
    newBpDia = Math.max(0, Math.min(200, newBpDia));
    newSpo2 = Math.max(0, Math.min(100, newSpo2));
    newRr = Math.max(0, Math.min(60, newRr));

    // Status descriptions
    if (newHr > 150) medicalText += 'Taxikardiya kuzatilmoqda. ';
    if (newHr < 50) medicalText += 'Bradikardiya xavfli darajada. ';
    if (newSpo2 < 85) medicalText += 'OGOHLANTRISH: SpO2 kritik darajada past! ';
    if (newBpSys < 80) medicalText += 'SHOK holati! Sistolik bosim juda past. ';
    if (newBpSys > 200) medicalText += 'Gipertonik kriz davom etmoqda. ';

    // Check if patient dies
    let isAlive = true;
    if (newHr <= 0 || newHr > 240) {
        isAlive = false;
        medicalText = '❌ ASISTOLIYA! Bemor yurak to\'xtashi holatiga tushdi. Reanimatsiya zarur!';
    }
    if (newSpo2 < 50) {
        isAlive = false;
        medicalText = '❌ Og\'ir gipoksiya! SpO2 kritik darajadan pastga tushdi.';
    }
    if (newBpSys < 40) {
        isAlive = false;
        medicalText = '❌ Qon aylanishi to\'xtadi! AQB hayot bilan mos emas darajada.';
    }

    return {
        newStats: {
            hr: newHr,
            bp: `${newBpSys}/${newBpDia}`,
            spo2: newSpo2,
            rr: newRr,
            temp: currentStats.temp,
            gcs: currentStats.gcs,
        },
        medicalText,
        isAlive,
    };
}

// ===== AGENT 3: VISUALIZER =====
// Determines visual state based on patient condition

function agentVisualizer(
    stats: PatientStats,
    isAlive: boolean,
    prevState: SplineState
): { spline_state: SplineState; camera_angle: CameraAngle; skin_color: SkinColor } {
    if (!isAlive) {
        return { spline_state: 'Dead', camera_angle: 'full_body', skin_color: 'pale' };
    }

    const [bpSys] = stats.bp.split('/').map(Number);
    let splineState: SplineState = 'Idle';
    let camera: CameraAngle = 'default';
    let skin: SkinColor = 'normal';

    // Determine spline state
    if (stats.spo2 < 85 || bpSys < 70 || stats.hr > 160) {
        splineState = 'Seizure';
        camera = 'full_body';
    } else if (stats.spo2 < 92 || bpSys < 90 || stats.hr > 130 || stats.hr < 50) {
        splineState = 'Pain';
        camera = 'zoom_in_face';
    } else if (stats.spo2 >= 95 && stats.hr >= 60 && stats.hr <= 100 && bpSys >= 100 && bpSys <= 140) {
        splineState = 'Recovery';
        camera = 'default';
    } else {
        splineState = prevState === 'Recovery' ? 'Recovery' : 'Idle';
        camera = 'default';
    }

    // Determine skin color
    if (stats.spo2 < 85) {
        skin = 'cyanotic';
    } else if (stats.spo2 < 92) {
        skin = 'pale';
    } else if (stats.hr > 140 || bpSys > 180) {
        skin = 'flushed';
    } else {
        skin = 'normal';
    }

    return { spline_state: splineState, camera_angle: camera, skin_color: skin };
}

// ===== MAIN SIMULATION ENGINE =====

export function processAction(
    action: DrugAction,
    currentStats: PatientStats,
    scenario: Scenario,
    elapsedMinutes: number,
    currentVisual: { spline_state: SplineState }
): SimulationResponse {
    // AGENT 1: Analyze the action
    const analysis = agentAnalyst(action, currentStats, scenario);

    // AGENT 2: Update physiology
    const physiology = agentPhysiologist(action, currentStats, scenario, elapsedMinutes);

    // Combine stats (if invalid action, keep old stats with minor deterioration)
    const finalStats = analysis.isValid ? physiology.newStats : {
        ...currentStats,
        spo2: Math.max(currentStats.spo2 - 1, 60),
        hr: currentStats.hr + 2,
    };

    const isAlive = analysis.isValid ? physiology.isAlive : !(finalStats.hr <= 0 || finalStats.spo2 < 50);

    // AGENT 3: Update visuals
    const visual = agentVisualizer(finalStats, isAlive, currentVisual.spline_state);

    return {
        medical_text: analysis.isValid ? physiology.medicalText : `Noto'g'ri harakat. ${physiology.medicalText}`,
        feedback: analysis.feedback,
        feedback_type: analysis.feedbackType,
        patient_stats: finalStats,
        visual_engine: visual,
        is_alive: isAlive,
        score_impact: analysis.scoreImpact,
        elapsed_time: elapsedMinutes + (DRUG_DATABASE[action.drug_name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z_]/g, '')]?.onset_minutes || 5),
    };
}

// ===== HELPER: Get vital severity =====
export function getVitalSeverity(type: 'hr' | 'spo2' | 'bp' | 'rr', value: number | string): Severity {
    if (type === 'hr') {
        const v = value as number;
        if (v >= 60 && v <= 100) return 'normal';
        if ((v >= 50 && v < 60) || (v > 100 && v <= 120)) return 'warning';
        return 'danger';
    }
    if (type === 'spo2') {
        const v = value as number;
        if (v >= 95) return 'normal';
        if (v >= 90) return 'warning';
        return 'danger';
    }
    if (type === 'bp') {
        const sys = parseInt(String(value).split('/')[0]);
        if (sys >= 90 && sys <= 140) return 'normal';
        if ((sys >= 80 && sys < 90) || (sys > 140 && sys <= 180)) return 'warning';
        return 'danger';
    }
    if (type === 'rr') {
        const v = value as number;
        if (v >= 12 && v <= 20) return 'normal';
        if ((v >= 8 && v < 12) || (v > 20 && v <= 28)) return 'warning';
        return 'danger';
    }
    return 'normal';
}
