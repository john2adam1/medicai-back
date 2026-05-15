// MedicAI Backend Entry Point
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { SCENARIOS, SPECIALTIES } from './lib/scenarios';
import { processAction } from './lib/simulation-engine';
import { DrugAction, PatientStats, Scenario, SplineState } from './lib/types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Get all specialties and scenarios
app.get('/api/metadata', (req, res) => {
    res.json({
        specialties: SPECIALTIES,
        scenarios: SCENARIOS
    });
});

// Process action
app.post('/api/simulate', (req, res) => {
    const {
        action,
        currentStats,
        scenario,
        elapsedMinutes,
        currentVisual
    } = req.body as {
        action: DrugAction;
        currentStats: PatientStats;
        scenario: Scenario;
        elapsedMinutes: number;
        currentVisual: { spline_state: SplineState };
    };

    if (!action || !currentStats || !scenario) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    const result = processAction(
        action,
        currentStats,
        scenario,
        elapsedMinutes,
        currentVisual
    );

    res.json(result);
});

app.listen(PORT, () => {
    console.log(`MedicAI Backend running on http://localhost:${PORT}`);
});
