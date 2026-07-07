import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIScenario, ActionResult, PatientStats, VisualState } from './types';

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
    require('fs').writeFileSync('D:/projects/medicai-back/ai_error.log', text);
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

  const text = await generateWithRetry(prompt);
  const scenario = parseJSON<AIScenario>(text);
  // Enforce the user's chosen difficulty and time limit regardless of model output.
  scenario.difficulty = difficulty;
  scenario.time_limit_minutes = timeLimitMinutes;
  return scenario;
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

  const text = await generateWithRetry(prompt);
  return parseJSON<ActionResult>(text);
}

export async function generateRecommendations(
  courseLevel: string,
  isDoctor: boolean,
  weakTopics: string[],
  language: string = 'uz'
): Promise<any> {
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
  const text = await generateWithRetry(prompt);
  return parseJSON(text);
}
