import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateScenario, processAction, generateRecommendations } from './lib/ai-engine';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
    console.error("FATAL ERROR: GEMINI_API_KEY environment variable is missing.");
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (curl, Postman, same-origin Vercel rewrites)
        if (!origin) return callback(null, true);
        const allowed = [
            /^http:\/\/localhost(:\d+)?$/,
            /^https:\/\/.*\.vercel\.app$/,
        ];
        if (process.env.FRONTEND_URL) allowed.push(new RegExp(`^${process.env.FRONTEND_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`));
        if (allowed.some(r => r.test(origin))) return callback(null, true);
        callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());

app.post('/api/start', async (req, res) => {
    const { topic, difficulty, timeLimitMinutes, language } = req.body;
    if (!topic?.trim()) return res.status(400).json({ error: 'Topic is required' });

    const allowedDifficulties = ['Easy', 'Medium', 'Hard'] as const;
    const safeDifficulty = allowedDifficulties.includes(difficulty) ? difficulty : 'Medium';
    const parsedTime = Number(timeLimitMinutes);
    const safeTime = Number.isFinite(parsedTime) ? Math.min(60, Math.max(10, Math.round(parsedTime))) : 30;

    try {
        const scenario = await generateScenario(topic.trim(), safeDifficulty, safeTime, language);
        res.json(scenario);
    } catch (err) {
        console.error('generateScenario error:', err);
        res.status(500).json({ error: 'Failed to generate scenario' });
    }
});

app.post('/api/action', async (req, res) => {
    const { action, scenario, currentStats, currentVisual, healthBar, elapsedMinutes, actionHistory, language } = req.body;
    if (!action || !scenario || !currentStats) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }
    try {
        const result = await processAction(
            action, scenario, currentStats, currentVisual,
            healthBar ?? 100, elapsedMinutes ?? 0, actionHistory ?? [], language
        );
        res.json(result);
    } catch (err: any) {
        console.error('processAction error:', err);
        res.status(500).json({ error: err.message || 'Failed to process action', stack: err.stack });
    }
});

// Since we are using Supabase BaaS, authentication and user profiles are handled by Supabase directly.
// The backend focuses purely on the AI processes.

app.post('/api/recommendations', async (req, res) => {
    const { course_level, is_doctor, weak_topics, language } = req.body;
    try {
        const recommendations = await generateRecommendations(course_level, Boolean(is_doctor), weak_topics || [], language);
        res.json({ recommendations });
    } catch (err) {
        console.error('generateRecommendations error:', err);
        res.status(500).json({ error: 'Failed to generate recommendations' });
    }
});

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`MedicAI Backend running on http://localhost:${PORT}`);
});
