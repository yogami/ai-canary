import { NextResponse } from 'next/server';
import { checkRateLimit, RATE_LIMIT_MAX } from '@/lib/rate-limiter';
import { sanitizeInput, detectInjection, MAX_STORY_COUNT } from '@/lib/input-validator';
import { RegimeExecutionService } from '@/services/kernel/RegimeExecutionService';
import { DiligenceRegime } from '@/domain/diligence-regime';
import { buildAnalysisPrompts } from '@/services/analysis/prompt-builder';
import { fetchFrontierAnalysis } from '@/services/analysis/llm-gateway';
import { generateFallbackAnalysis } from '@/services/analysis/fallback-generator';

export async function POST(request: Request) {
    try {
        const rateLimitResponse = enforceRateLimit(request);
        if (rateLimitResponse) return rateLimitResponse;

        const body = await request.json();
        const validation = validateAndSanitize(body);
        if (validation.errorResponse) return validation.errorResponse;

        const { pitch, stories, niche } = validation;
        const prompts = buildAnalysisPrompts(niche, pitch, stories);
        const llmResult = await fetchFrontierAnalysis(prompts.systemPrompt, prompts.userPrompt);

        const analysis = llmResult?.analysis || generateFallbackAnalysis(pitch, stories);
        enrichWithKernelRegimes(analysis, pitch, niche, stories);

        return NextResponse.json({
            analysis,
            source: llmResult?.provider || 'rule-based',
            model: llmResult?.model || 'deterministic-kernel'
        });
    } catch (error) {
        console.error('Intelligent analysis route error:', error);
        return NextResponse.json({ error: 'Analysis request failed', analysis: null }, { status: 500 });
    }
}

function enforceRateLimit(request: Request): NextResponse | null {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
    const rateLimit = checkRateLimit(ip);

    if (!rateLimit.allowed) {
        const resetMinutes = Math.ceil(rateLimit.resetIn / 60000);
        return NextResponse.json(
            { error: `Rate limit exceeded (${RATE_LIMIT_MAX}/hour). Try again in ${resetMinutes} minutes.` },
            { status: 429 }
        );
    }
    return null;
}

function validateAndSanitize(body: any) {
    const { projectDescription, stories, niche = 'technology' } = body || {};
    if (detectInjection(projectDescription || '').isInjection) {
        return { errorResponse: NextResponse.json({ error: 'Invalid input detected' }, { status: 400 }) };
    }

    const sanitized = sanitizeInput(projectDescription || '');
    if (!sanitized) {
        return { errorResponse: NextResponse.json({ error: 'Project description is required' }, { status: 400 }) };
    }

    const allowed = ['technology', 'ai', 'media', 'film', 'music', 'gaming', 'fintech', 'healthcare', 'climate'];
    const safeNiche = allowed.includes((niche || '').toLowerCase()) ? niche.toLowerCase() : 'technology';
    const limitedStories = (stories || []).slice(0, MAX_STORY_COUNT);

    return { pitch: sanitized, stories: limitedStories, niche: safeNiche };
}

function enrichWithKernelRegimes(analysis: any, pitch: string, sector: string, stories: any[]) {
    const regimeService = new RegimeExecutionService();
    const r0 = regimeService.executeRegime(DiligenceRegime.RAW_MODEL, pitch, sector, stories);
    const r1 = regimeService.executeRegime(DiligenceRegime.TOOL_RETRIEVAL, pitch, sector, stories);
    const r2 = regimeService.executeRegime(DiligenceRegime.MEMORY_QUARANTINE, pitch, sector, stories);
    const r3 = regimeService.executeRegime(DiligenceRegime.FULL_DILIGENCE_GATE, pitch, sector, stories);

    analysis.regimes = {
        [DiligenceRegime.RAW_MODEL]: r0,
        [DiligenceRegime.TOOL_RETRIEVAL]: r1,
        [DiligenceRegime.MEMORY_QUARANTINE]: r2,
        [DiligenceRegime.FULL_DILIGENCE_GATE]: r3
    };

    syncAgenticDiligenceWithKernel(analysis, r3);
}

function syncAgenticDiligenceWithKernel(analysis: any, r3: any) {
    if (!analysis.agenticDiligence) analysis.agenticDiligence = {};
    if (!analysis.agenticDiligence.quarantine?.quarantinedAssertions?.length) {
        analysis.agenticDiligence.quarantine = r3.quarantine;
    }
    if (!analysis.agenticDiligence.causalSensitivity) {
        analysis.agenticDiligence.causalSensitivity = r3.causalSensitivity;
    }
    if (!analysis.agenticDiligence.icPunchList?.length) {
        analysis.agenticDiligence.icPunchList = r3.icPunchList;
    }
    if (r3.canaryScore.grade === 'F') {
        const fallbackFactors = {
            growthPotential: { score: 50, reasoning: 'Capped by physical limits' },
            competitiveDensity: { score: 50, reasoning: 'Incumbents hold lower cost' },
            timingSignal: { score: 60, reasoning: 'Premature commercialization' },
            defensibility: { score: 60, reasoning: 'Vulnerable to diligence discovery' }
        };
        analysis.canaryScore = {
            ...analysis.canaryScore,
            total: Math.min(analysis.canaryScore?.total || 600, 220),
            grade: 'F',
            verdict: r3.canaryScore.verdict,
            factors: analysis.canaryScore?.factors || fallbackFactors
        };
    }
}
