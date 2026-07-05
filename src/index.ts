import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateScenario, processAction, generateRecommendations } from './lib/ai-engine';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserProfile } from './lib/types';
import crypto from 'crypto';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
    console.error("FATAL ERROR: GEMINI_API_KEY environment variable is missing.");
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'medicai_super_secret_key_123';
const usersDB: UserProfile[] = [];

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

app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    if (usersDB.find(u => u.email === email)) return res.status(400).json({ error: 'User already exists' });

    const id = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);
    const user: UserProfile = { id, email, passwordHash };
    usersDB.push(user);

    const token = jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id, email } });
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = usersDB.find(u => u.email === email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, course_level: user.course_level, is_doctor: user.is_doctor, weak_topics: user.weak_topics } });
});

app.post('/api/profile/questionnaire', async (req, res) => {
    const { token, course_level, is_doctor, weak_topics } = req.body;
    if (!token) return res.status(401).json({ error: 'Token required' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const user = usersDB.find(u => u.id === decoded.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.course_level = course_level;
        user.is_doctor = is_doctor;
        user.weak_topics = weak_topics;

        const recommendations = await generateRecommendations(course_level, is_doctor, weak_topics);
        res.json({ user: { id: user.id, email: user.email, course_level, is_doctor, weak_topics }, recommendations });
    } catch (err) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
});

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`MedicAI Backend running on http://localhost:${PORT}`);
});
