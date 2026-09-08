import { NextRequest, NextResponse } from 'next/server';
import { generateRecommendations } from '@/lib/ai-engine';

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
        const { course_level, is_doctor, weak_topics, language } = body;

        const recommendations = await generateRecommendations(
            course_level,
            Boolean(is_doctor),
            weak_topics || [],
            language
        );

        return NextResponse.json({ recommendations }, { headers: corsHeaders });
    } catch (err: any) {
        console.error('generateRecommendations error:', err);
        return NextResponse.json(
            { error: err?.message || 'Failed to generate recommendations' },
            { status: 500, headers: corsHeaders }
        );
    }
}
