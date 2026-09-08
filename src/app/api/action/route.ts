import { NextRequest, NextResponse } from 'next/server';
import { processAction } from '@/lib/ai-engine';

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
        const { action, scenario, currentStats, currentVisual, healthBar, elapsedMinutes, actionHistory, language } = body;

        if (!action || !scenario || !currentStats) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400, headers: corsHeaders }
            );
        }

        const result = await processAction(
            action,
            scenario,
            currentStats,
            currentVisual,
            healthBar ?? 100,
            elapsedMinutes ?? 0,
            actionHistory ?? [],
            language
        );

        return NextResponse.json(result, { headers: corsHeaders });
    } catch (err: any) {
        console.error('processAction error:', err);
        return NextResponse.json(
            { error: err?.message || 'Failed to process action' },
            { status: 500, headers: corsHeaders }
        );
    }
}
