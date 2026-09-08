import { NextRequest, NextResponse } from 'next/server';
import { generateScenario } from '@/lib/ai-engine';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { topic, difficulty, timeLimitMinutes, language } = body;

        if (!topic?.trim()) {
            return NextResponse.json(
                { error: 'Topic is required' },
                { status: 400, headers: corsHeaders }
            );
        }

        const allowedDifficulties = ['Easy', 'Medium', 'Hard'] as const;
        const safeDifficulty = allowedDifficulties.includes(difficulty) ? difficulty : 'Medium';
        const parsedTime = Number(timeLimitMinutes);
        const safeTime = Number.isFinite(parsedTime) ? Math.min(60, Math.max(10, Math.round(parsedTime))) : 30;

        const scenario = await generateScenario(topic.trim(), safeDifficulty, safeTime, language);
        return NextResponse.json(scenario, { headers: corsHeaders });
    } catch (err: any) {
        console.error('generateScenario error:', err);
        return NextResponse.json(
            { error: err?.message || 'Failed to generate scenario' },
            { status: 500, headers: corsHeaders }
        );
    }
}
