import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateScenario, processAction } from './lib/ai-engine';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());

app.post('/api/start', async (req, res) => {
    const { topic, difficulty, timeLimitMinutes } = req.body;
    if (!topic?.trim()) return res.status(400).json({ error: 'Topic is required' });

    const allowedDifficulties = ['Easy', 'Medium', 'Hard'] as const;
    const safeDifficulty = allowedDifficulties.includes(difficulty) ? difficulty : 'Medium';
    const parsedTime = Number(timeLimitMinutes);
    const safeTime = Number.isFinite(parsedTime) ? Math.min(60, Math.max(10, Math.round(parsedTime))) : 30;

    try {
        const scenario = await generateScenario(topic.trim(), safeDifficulty, safeTime);
        res.json(scenario);
    } catch (err) {
        console.error('generateScenario error:', err);
        res.status(500).json({ error: 'Failed to generate scenario' });
    }
});

app.post('/api/action', async (req, res) => {
    const { action, scenario, currentStats, currentVisual, healthBar, elapsedMinutes, actionHistory } = req.body;
    if (!action || !scenario || !currentStats) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }
    try {
        const result = await processAction(
            action, scenario, currentStats, currentVisual,
            healthBar ?? 100, elapsedMinutes ?? 0, actionHistory ?? []
        );
        res.json(result);
    } catch (err) {
        console.error('processAction error:', err);
        res.status(500).json({ error: 'Failed to process action' });
    }
});

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`MedicAI Backend running on http://localhost:${PORT}`);
});
