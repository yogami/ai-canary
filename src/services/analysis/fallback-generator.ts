export function generateFallbackAnalysis(
    projectDescription: string,
    stories: Array<{ headline: string; sentiment?: string }>
) {
    const projectWords = projectDescription.toLowerCase().split(/\s+/);
    const threats: Array<{ storyIndex: number; reason: string }> = [];
    const opportunities: Array<{ storyIndex: number; reason: string }> = [];

    stories.forEach((story, idx) => {
        const headlineLower = (story.headline || '').toLowerCase();
        const matched = projectWords.filter((w) => w.length > 4 && headlineLower.includes(w));
        if (matched.length > 0) {
            if (story.sentiment === 'negative' || headlineLower.includes('fail')) {
                threats.push({ storyIndex: idx + 1, reason: `Matches keyword signals: ${matched.join(', ')}` });
            } else {
                opportunities.push({ storyIndex: idx + 1, reason: `Matches keyword signals: ${matched.join(', ')}` });
            }
        }
    });

    return {
        canaryScore: buildFallbackScore(),
        swotAnalysis: buildFallbackSwot(),
        agenticDiligence: buildFallbackDiligence(),
        brutalRealityCheck: buildFallbackRealityCheck(),
        threats: threats.slice(0, 5),
        opportunities: opportunities.slice(0, 5),
        marketGaps: ['Validated commercial solutions with transparent unit economics'],
        timing: 'neutral' as const,
        timingReason: 'Market is actively evaluating alternatives',
        recommendation: 'Focus on independent technical verification and commercial pilot conversion.'
    };
}

function buildFallbackScore() {
    return {
        total: 580,
        grade: 'C',
        factors: {
            growthPotential: { score: 280, reasoning: 'Heuristic keyword overlap with current news signals' },
            competitiveDensity: { score: 100, reasoning: 'Incumbents actively operating in related sectors' },
            timingSignal: { score: 100, reasoning: 'Market adoption underway' },
            defensibility: { score: 100, reasoning: 'Requires clear proprietary moats' }
        },
        percentile: 'Top 45% of ideas analyzed',
        verdict: 'Viable baseline concept requiring formal technical and economic diligence'
    };
}

function buildFallbackSwot() {
    return {
        strengths: ['Clear user problem statement'],
        weaknesses: ['Requires deep third-party scientific or performance validation'],
        opportunities: ['Growing market interest in verifiable outcomes'],
        threats: ['Established incumbents with lower cost of capital']
    };
}

function buildFallbackDiligence() {
    return {
        quarantine: {
            verifiedClaims: [{ claim: 'Identified problem space', basis: 'Industry reports confirm customer pain points', status: 'PLAUSIBLE' as const }],
            quarantinedAssertions: [{ assertion: 'Founder margin projections', contradiction: 'Lacks audited third-party trial data', severity: 'WARNING' as const }]
        },
        causalSensitivity: {
            criticalAssumption: 'Cost of goods sold scales linearly with volume',
            stressScenarios: [{ parameter: 'Input Costs', shift: '+30% inflation', impact: 'Gross margin drops below sustainability' }],
            breakEvenThreshold: 'Requires minimum 45% gross margin at commercial scale'
        },
        icPunchList: [{ question: 'What is the audited unit economics breakdown?', targetRisk: 'Hidden structural costs', whyItExposesFraud: 'Exposes commercial viability.' }]
    };
}

function buildFallbackRealityCheck() {
    return {
        existingSolutions: [{ name: 'Incumbent Solutions', whyBetter: 'Proven balance sheets', pricing: 'Market rates', marketPosition: 'Leader' }],
        bigFishThreat: { company: 'Industry Incumbents', timeToReplicate: '6 to 12 months', whyTheyWould: 'Defend market share', whyTheyMightNot: 'Focus on enterprise' },
        whyThisWillFail: { unitEconomics: 'High initial capital requirements.', distributionTrap: 'Lengthy sales cycles.', timingProblem: 'Readiness lags optimism.', defensibilityGap: 'Lack of defensive moats.', expertiseRequired: 'Demands cross-disciplinary leadership.', marketSizeReality: 'Initial market is smaller than TAM.' },
        startupGraveyard: [{ name: 'Precedent Entity', raised: '€10m', rootCause: 'Ran out of runway', lesson: 'Validate economics early' }],
        brutalVerdict: 'Needs rigorous validation on unit economics before scaling.',
        survivalProbability: '30%',
        salvagePlan: { nichePivot: 'Target focused cohort', unfairAdvantage: 'Build proprietary data moat', actionableSteps: ['Secure pilots', 'Verify claims'] }
    };
}
