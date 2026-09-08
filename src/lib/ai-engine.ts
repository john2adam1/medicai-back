import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIScenario, ActionResult, PatientStats, VisualState } from './types';
import fs from 'fs';
import path from 'path';

let _model: ReturnType<InstanceType<typeof GoogleGenerativeAI>['getGenerativeModel']> | null = null;

function getModel() {
  if (!_model) {
    const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    _model = client.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        maxOutputTokens: 4096,
      },
    });
  }
  return _model;
}

async function generateWithRetry(prompt: string, retries = 2): Promise<string> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const model = getModel();
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err: any) {
      const isRateLimit = err?.status === 429 || err?.message?.includes('Too Many Requests');
      if (isRateLimit && attempt < retries) {
        const delay = (attempt + 1) * 15000; // 15s, 30s
        console.warn(`Rate limited. Retrying in ${delay / 1000}s...`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
  throw new Error('Max retries exceeded');
}

function parseJSON<T>(text: string): T {
  try {
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Failed to parse JSON. Raw text was:\n', text);
    try {
      fs.writeFileSync(path.join(process.cwd(), 'ai_error.log'), text);
    } catch {
      // ignore logging failure
    }
    throw new Error('Failed to parse JSON response from AI');
  }
}

const DIFFICULTY_GUIDANCE: Record<string, string> = {
  Easy: 'Present a textbook, clearly-recognizable case with classic symptoms and stable-but-concerning vitals. Forgiving timeframe.',
  Medium: 'Present a realistic case with some ambiguity; vitals are moderately deranged and the patient can deteriorate if mismanaged.',
  Hard: 'Present a complex, high-acuity case: atypical presentation, critically deranged vitals, comorbidities or complications, and a narrow window before decompensation.',
};

export async function generateScenario(
  topic: string,
  difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium',
  timeLimitMinutes: number = 30,
  language: string = 'uz'
): Promise<AIScenario> {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('your_gemini')) {
    console.warn("Using fallback scenario generator (GEMINI_API_KEY not configured).");
    return {
      title: topic,
      description: `${topic} bo'yicha tibbiy simulatsiya holati`,
      difficulty,
      initial_presentation: `Bemor (45 yosh) shifoxonaga ${topic} belgilari bilan keltirildi. Qon bosimi va puls o'zgargan.`,
      topic,
      patient_stats: {
        hr: 105,
        bp: '130/85',
        spo2: 95,
        rr: 20,
        temp: 37.0,
        gcs: 15
      },
      visual_state: {
        spline_state: 'Pain',
        skin_color: 'pale',
        monitor_sound: 'fast_beep'
      },
      time_limit_minutes: timeLimitMinutes
    };
  }

  const prompt = `You are a medical simulation AI. Respond ONLY with valid JSON, no markdown or explanation. IMPORTANT: All generative text (title, description, initial_presentation) MUST be written in this language: ${language} (but JSON keys must remain exactly as specified in English).

Generate a realistic clinical scenario for a medical trainee on this topic: "${topic}".

Difficulty: ${difficulty}. ${DIFFICULTY_GUIDANCE[difficulty]}
The scenario must have a time limit of exactly ${timeLimitMinutes} minutes and match the "${difficulty}" difficulty severity.

Return this exact JSON structure:
{
  "title": "Short case title (max 8 words)",
  "description": "One sentence describing the case",
  "difficulty": "${difficulty}",
  "initial_presentation": "2-3 sentences: patient age, presenting complaint, urgency, key symptoms",
  "topic": "${topic}",
  "patient_stats": {
    "hr": <realistic bpm for this condition>,
    "bp": "<realistic like 90/60 or 180/110>",
    "spo2": <realistic 0-100>,
    "rr": <realistic breaths/min>,
    "temp": <realistic Celsius>,
    "gcs": <3-15 Glasgow Coma Scale>
  },
  "visual_state": {
    "spline_state": "<Idle|Pain|Unconscious|Seizure|Recovery|Dead>",
    "skin_color": "<normal|pale|cyanotic|flushed|jaundiced>",
    "monitor_sound": "<normal_beep|fast_beep|flatline>"
  },
  "time_limit_minutes": ${timeLimitMinutes}
}`;

  try {
    const text = await generateWithRetry(prompt);
    const scenario = parseJSON<AIScenario>(text);
    scenario.difficulty = difficulty;
    scenario.time_limit_minutes = timeLimitMinutes;
    return scenario;
  } catch (err) {
    console.error("AI generateScenario failed, using fallback:", err);
    return {
      title: topic,
      description: `${topic} bo'yicha tibbiy simulatsiya holati`,
      difficulty,
      initial_presentation: `Bemor shifoxonaga ${topic} shikoyati bilan keltirildi.`,
      topic,
      patient_stats: { hr: 100, bp: '120/80', spo2: 96, rr: 18, temp: 36.6, gcs: 15 },
      visual_state: { spline_state: 'Idle', skin_color: 'normal', monitor_sound: 'normal_beep' },
      time_limit_minutes: timeLimitMinutes
    };
  }
}

export async function processAction(
  action: string,
  scenario: AIScenario,
  currentStats: PatientStats,
  currentVisual: VisualState,
  healthBar: number,
  elapsedMinutes: number,
  actionHistory: string[],
  language: string = 'uz'
): Promise<ActionResult> {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('your_gemini')) {
    console.warn("Using fallback action processor (GEMINI_API_KEY not configured).");
    return {
      simulation_status: 'in_progress',
      medical_text: `Shifokor harakati bajarildi: "${action}". Bemor nazoratda.`,
      feedback: `Harakat qabul qilindi: ${action}`,
      feedback_type: 'info',
      patient_stats: {
        ...currentStats,
        hr: Math.max(60, currentStats.hr - 2),
        spo2: Math.min(100, currentStats.spo2 + 1)
      },
      visual_state: currentVisual,
      score_impact: 10,
      health_bar: Math.min(100, healthBar + 5),
      is_alive: true,
      game_over: false,
      game_over_reason: undefined
    };
  }

  const prompt = `You are a medical simulation AI evaluating clinical decisions. Respond ONLY with valid JSON, no markdown. IMPORTANT: All text string values in the JSON (medical_text, feedback, game_over_reason) MUST be written in this language: ${language}.

Scenario: ${scenario.title} — ${scenario.description}
Topic: ${scenario.topic}

Current vitals: HR ${currentStats.hr}, BP ${currentStats.bp}, SpO2 ${currentStats.spo2}%, RR ${currentStats.rr}, GCS ${currentStats.gcs}
Patient state: ${currentVisual.spline_state}, skin: ${currentVisual.skin_color}
Health: ${healthBar}%, Elapsed: ${elapsedMinutes} min
Recent actions: ${actionHistory.slice(-3).join(' | ') || 'none'}

Doctor's action: "${action}"

Evaluate medically and return JSON:
{
  "simulation_status": "<in_progress|success|failed>",
  "medical_text": "1-2 sentences: physiological effect of this action on the patient",
  "feedback": "Brief doctor feedback (1 sentence, supportive or corrective)",
  "feedback_type": "<success|error|warning|info>",
  "patient_stats": {
    "hr": <updated>,
    "bp": "<updated sys/dia>",
    "spo2": <updated>,
    "rr": <updated>,
    "temp": ${currentStats.temp},
    "gcs": <updated>
  },
  "visual_state": {
    "spline_state": "<Idle|Pain|Unconscious|Seizure|Recovery|Dead>",
    "skin_color": "<normal|pale|cyanotic|flushed|jaundiced>",
    "monitor_sound": "<normal_beep|fast_beep|flatline>"
  },
  "score_impact": <-50 to 50>,
  "health_bar": <0-100 updated>,
  "is_alive": <true|false>,
  "game_over": <true|false>,
  "game_over_reason": <"reason string" or null>
}

Rules: correct actions improve vitals and score; wrong/harmful actions worsen them. If vitals reach critically dangerous levels, set game_over true. Set success if patient stabilizes (SpO2>=95, HR 60-100, SBP 90-140, health_bar>=80).`;

  try {
    const text = await generateWithRetry(prompt);
    return parseJSON<ActionResult>(text);
  } catch (err) {
    console.error("AI processAction failed, using fallback:", err);
    return {
      simulation_status: 'in_progress',
      medical_text: `Harakat bajarildi: "${action}".`,
      feedback: `Tibbiy muolaja ko'rsatildi.`,
      feedback_type: 'info',
      patient_stats: currentStats,
      visual_state: currentVisual,
      score_impact: 5,
      health_bar: healthBar,
      is_alive: true,
      game_over: false,
      game_over_reason: undefined
    };
  }
}

export async function generateRecommendations(
  courseLevel: string,
  isDoctor: boolean,
  weakTopics: string[],
  language: string = 'uz'
): Promise<any> {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('your_gemini')) {
    console.warn("Using fallback recommendations (GEMINI_API_KEY not configured).");
    const t1 = weakTopics[0] || 'Otkir miokard infarkti';
    const t2 = weakTopics[1] || 'Pnevmotoraks va shoshilinch yordam';
    const t3 = weakTopics[2] || 'Anafilaktik shok terapiyasi';
    return [
      { topic: t1, difficulty: 'Medium', reason: 'Zaif mavzuni mustahkamlash va amaliyot uchun' },
      { topic: t2, difficulty: 'Hard', reason: 'Shoshilinch tibbiy yordam ko\'nikmasini oshirish' },
      { topic: t3, difficulty: 'Medium', reason: 'Klinik tahlil va tezkor reaksiya bildirish' }
    ];
  }

  const prompt = `You are a medical simulation AI. The user is a ${isDoctor ? 'doctor' : 'medical student'} at level: ${courseLevel || 'beginner'}.
They identified weak knowledge in these topics: ${(weakTopics && weakTopics.length) ? weakTopics.join(', ') : 'general medicine'}.
Recommend 3 clinical scenario topics they should practice to improve their specific skills. IMPORTANT: The "topic" and "reason" values MUST be provided in this language: ${language}.

Respond ONLY with a valid JSON array matching this format (no markdown codeblocks, just the JSON):
[
  {
    "topic": "Specific Clinical Case (e.g. Tension Pneumothorax)",
    "difficulty": "Easy|Medium|Hard",
    "reason": "1 short sentence why this helps them"
  }
]`;

  try {
    const text = await generateWithRetry(prompt);
    return parseJSON(text);
  } catch (err) {
    console.error("AI generateRecommendations failed, using fallback:", err);
    const t1 = weakTopics[0] || 'Otkir miokard infarkti';
    const t2 = weakTopics[1] || 'Pnevmotoraks va shoshilinch yordam';
    const t3 = weakTopics[2] || 'Anafilaktik shok terapiyasi';
    return [
      { topic: t1, difficulty: 'Medium', reason: 'Zaif mavzuni mustahkamlash va amaliyot uchun' },
      { topic: t2, difficulty: 'Hard', reason: 'Shoshilinch tibbiy yordam ko\'nikmasini oshirish' },
      { topic: t3, difficulty: 'Medium', reason: 'Klinik tahlil va tezkor reaksiya bildirish' }
    ];
  }
}
