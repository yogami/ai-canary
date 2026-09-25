import { sanitizeInput } from '@/lib/input-validator';
import {
    ANTI_HALLUCINATION_RULES,
    CLIMATE_SYSTEM_PROMPT,
    TECH_SYSTEM_PROMPT
} from './prompt-templates';

export function buildAnalysisPrompts(
    safeNiche: string,
    sanitizedDescription: string,
    limitedStories: Array<{ headline: string; sentiment?: string }>
) {
    const storySummaries = buildStorySummaries(limitedStories);
    const systemPrompt = resolveSystemPrompt(safeNiche) + ANTI_HALLUCINATION_RULES;
    const userPrompt = buildUserPrompt(sanitizedDescription, storySummaries, limitedStories.length);

    return { systemPrompt, userPrompt };
}

function resolveSystemPrompt(niche: string): string {
    if (niche === 'climate' || niche === 'energy') {
        return CLIMATE_SYSTEM_PROMPT;
    }
    return TECH_SYSTEM_PROMPT;
}

function buildStorySummaries(
    stories: Array<{ headline: string; sentiment?: string }>
): string {
    return stories.slice(0, 20).map((s, i) =>
        `${i + 1}. [${s.sentiment || 'neutral'}] ${sanitizeInput(s.headline).slice(0, 100)}`
    ).join('\n');
}

function buildUserPrompt(
    description: string,
    summaries: string,
    storyCount: number
): string {
    return `## STARTUP PITCH TO AUDIT:\n${description}\n\n` +
        `## CURRENT ECOSYSTEM NEWS (${storyCount} stories):\n${summaries}\n\n` +
        `Provide an exhaustive due diligence evaluation in valid JSON matching the required schema: ` +
        `canaryScore (total, grade, factors, percentile, verdict), swotAnalysis, agenticDiligence ` +
        `(quarantine: verifiedClaims, quarantinedAssertions; causalSensitivity; icPunchList), ` +
        `brutalRealityCheck (existingSolutions, bigFishThreat, whyThisWillFail, startupGraveyard, brutalVerdict, survivalProbability, salvagePlan), ` +
        `threats, opportunities, marketGaps, timing, timingReason, recommendation.`;
}
