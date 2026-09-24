import { NextResponse } from 'next/server';

// LLM APIs: prioritize OpenRouter (frontier models), fallback to Groq
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface IntelligentAnalysisRequest {
    projectDescription: string;
    stories: Array<{
        headline: string;
        summary?: string;
        sentiment?: string;
        source?: string;
    }>;
    niche?: string;
}

// Rate limiting: protect API budget
const RATE_LIMIT_MAX = 30; // Max analyses per IP per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    const record = rateLimitStore.get(ip);

    if (!record || now > record.resetTime) {
        rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetIn: RATE_LIMIT_WINDOW };
    }

    if (record.count >= RATE_LIMIT_MAX) {
        return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
    }

    record.count++;
    return { allowed: true, remaining: RATE_LIMIT_MAX - record.count, resetIn: record.resetTime - now };
}

// Prompt Injection Protection
const INJECTION_PATTERNS = [
    /ignore\s+(previous|above|all)\s+(instructions?|prompts?)/i,
    /disregard\s+(previous|above|all)/i,
    /forget\s+(everything|all|previous)/i,
    /you\s+are\s+now\s+a/i,
    /act\s+as\s+(if|a|an)/i,
    /pretend\s+(to\s+be|you\s+are)/i,
    /new\s+instructions?:/i,
    /system\s*:\s*/i,
    /\[INST\]/i,
    /\[\/?SYS(TEM)?\]/i,
    /<\|im_start\|>/i,
    /```\s*(system|assistant|user)/i,
    /override\s+(the\s+)?system/i,
    /bypass\s+(security|filters?|restrictions?)/i,
];

const MAX_PROJECT_DESC_LENGTH = 5000;
const MAX_STORY_COUNT = 30;

function sanitizeInput(text: string): string {
    if (!text || typeof text !== 'string') return '';
    let sanitized = text.slice(0, MAX_PROJECT_DESC_LENGTH);
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    sanitized = sanitized.replace(/```/g, '`‌`‌`');
    return sanitized.trim();
}

function detectInjection(text: string): { isInjection: boolean; pattern?: string } {
    for (const pattern of INJECTION_PATTERNS) {
        if (pattern.test(text)) {
            return { isInjection: true, pattern: pattern.source };
        }
    }
    return { isInjection: false };
}

export async function POST(request: Request) {
    try {
        const forwarded = request.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
        const rateLimit = checkRateLimit(ip);

        if (!rateLimit.allowed) {
            const resetMinutes = Math.ceil(rateLimit.resetIn / 60000);
            return NextResponse.json({
                error: `Rate limit exceeded (${RATE_LIMIT_MAX}/hour). Try again in ${resetMinutes} minutes.`,
                analysis: null,
                rateLimited: true,
                resetIn: rateLimit.resetIn
            }, {
                status: 429,
                headers: {
                    'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': new Date(Date.now() + rateLimit.resetIn).toISOString()
                }
            });
        }

        const body: IntelligentAnalysisRequest = await request.json();
        const { projectDescription, stories, niche = 'technology' } = body;

        const injectionCheck = detectInjection(projectDescription);
        if (injectionCheck.isInjection) {
            console.warn('Prompt injection attempt detected:', injectionCheck.pattern);
            return NextResponse.json({
                error: 'Invalid input detected',
                analysis: null
            }, { status: 400 });
        }

        const sanitizedDescription = sanitizeInput(projectDescription);
        if (!sanitizedDescription) {
            return NextResponse.json({
                error: 'Project description is required',
                analysis: null
            }, { status: 400 });
        }

        const limitedStories = (stories || []).slice(0, MAX_STORY_COUNT);

        const openRouterKey = process.env.OPENROUTER_API_KEY;
        const groqApiKey = process.env.GROQ_API_KEY;

        if (!openRouterKey && !groqApiKey) {
            return NextResponse.json({
                analysis: generateFallbackAnalysis(sanitizedDescription, limitedStories),
                source: 'rule-based',
                note: 'For live frontier LLM analysis, set OPENROUTER_API_KEY in environment'
            });
        }

        const allowedNiches = ['technology', 'ai', 'media', 'film', 'music', 'gaming', 'fintech', 'healthcare', 'climate'];
        const safeNiche = allowedNiches.includes(niche.toLowerCase()) ? niche.toLowerCase() : 'technology';

        const storySummaries = limitedStories.slice(0, 20).map((s, i) =>
            `${i + 1}. [${s.sentiment || 'neutral'}] ${sanitizeInput(s.headline).slice(0, 100)}`
        ).join('\n');

        const antiHallucinationRules = `
## ANTI-HALLUCINATION AND FACTUAL ACCURACY RULES:
1. Ground your analysis strictly in verified physics, engineering principles, and current market baselines.
2. In threats and opportunities, reference actual story indices from the provided news list.
3. If data is lacking for a specific metric, state "Insufficient data to determine" rather than hallucinating figures.
4. Quarantine any founder assertions that contradict thermodynamic limits or realistic industrial economics.
5. Ban em-dashes. Use commas, colons, parentheses, or separate sentences instead.
6. Ban AI buzzwords (delve, testament, robust, leverage, revolutionize, synergistic, landscape, unlock, showcase, critical role, pivotal, dynamic). Use direct terms like inspect, proof, strong, use, main, key part.
`;

        let systemPrompt: string;
        let userPrompt: string;

        if (safeNiche === 'media' || safeNiche === 'film') {
            systemPrompt = `You are a PRODUCER CONSORTIUM evaluating a film/TV project pitch. You will role-play as 3 industry veterans:
1. SARAH CHEN (Studio Executive): focus on commercial viability, box office, distribution hooks.
2. MARCUS OKONJO (Indie Producer): focus on story integrity, artistic merit, festival potential.
3. ELENA VOLKOV (International Sales): focus on foreign market appeal, territory rights, co-production fit.`;

            userPrompt = `## PROJECT PITCH:
${sanitizedDescription}

## CURRENT ENTERTAINMENT NEWS (${limitedStories.length} stories):
${storySummaries}

Provide a JSON response matching this schema:
{
  "producerPanel": [
    {
      "name": "Sarah Chen",
      "role": "Studio Executive",
      "score": 7,
      "strengths": ["hook 1", "hook 2"],
      "concerns": ["concern 1"],
      "whatWouldMakeThemSayYes": "Specific condition",
      "relevantStories": [1]
    },
    {
      "name": "Marcus Okonjo",
      "role": "Indie Producer",
      "score": 8,
      "strengths": ["voice 1"],
      "concerns": ["budget ceiling"],
      "whatWouldMakeThemSayYes": "Specific director attachment",
      "relevantStories": [2]
    },
    {
      "name": "Elena Volkov",
      "role": "International Sales",
      "score": 6,
      "strengths": ["territory appeal"],
      "concerns": ["cultural specificity"],
      "whatWouldMakeThemSayYes": "European co-pro treaty fit",
      "relevantStories": [3]
    }
  ],
  "consensusScore": 7,
  "timing": "good|neutral|risky",
  "timingReason": "Market timing explanation",
  "marketGaps": ["gap 1", "gap 2"],
  "threats": [{"storyIndex": 1, "reason": "Reason for threat"}],
  "opportunities": [{"storyIndex": 2, "reason": "Reason for opportunity"}],
  "recommendation": "Strategic guidance for the producers"
}`;
        } else if (safeNiche === 'climate') {
            systemPrompt = `You are an investment partner at Extantia Capital, an elite European climate venture capital fund. Your task is to conduct deep, rigorous technical and economic due diligence on this clean-tech pitch.

You hold founders to the highest scientific standards:
1. THERMODYNAMICS & PHYSICS: Does this claim violate the conservation of energy or realistic cell/reaction efficiencies?
2. LEVELIZED COST & GREEN PREMIUM: Can this reach cost parity against fossil incumbents (e.g. grey hydrogen at €1.50/kg, standard Portland cement) without perpetual subsidies?
3. CAPEX & MINERAL SCALING: Is this dependent on scarce platinum group metals (PGMs), PFAS membranes, or unscalable supply chains?
4. INSTITUTIONAL MEMORY & CONTRADICTION QUARANTINE:
   - Identify which founder assertions are plausible or verified by physical laws.
   - Quarantine assertions that contradict thermodynamic limits or standard industrial benchmarks.
5. CAUSAL SENSITIVITY: Identify the single critical operational assumption and stress test it against realistic price shocks.
6. EXTANTIA IC PUNCH-LIST: 3 sharp, technical questions designed for the investment committee to expose operational risk in meeting #1.`;

            userPrompt = `## CLEAN-TECH PITCH TO AUDIT:
${sanitizedDescription}

## CURRENT CLIMATE & INDUSTRIAL NEWS (${limitedStories.length} stories):
${storySummaries}

Provide an exhaustive due diligence evaluation in valid JSON matching this schema:
{
  "canaryScore": {
    "total": 680,
    "grade": "B",
    "factors": {
      "growthPotential": {"score": 350, "reasoning": "Market demand, EU CBAM and Net Zero regulation tailwinds"},
      "competitiveDensity": {"score": 110, "reasoning": "Density of incumbent electrolyzer/materials makers and moats"},
      "timingSignal": {"score": 115, "reasoning": "Industrial readiness and customer procurement cycles"},
      "defensibility": {"score": 105, "reasoning": "Patent moat on catalysts/membranes vs commodity system assembly"}
    },
    "percentile": "Top 20% of evaluated climate deals",
    "verdict": "Clear physical thesis, but unit economics are fragile under power price volatility"
  },
  "swotAnalysis": {
    "strengths": ["Key thermodynamic or manufacturing advantage"],
    "weaknesses": ["Primary technical hurdle, degradation risk, or CapEx intensity"],
    "opportunities": ["Regulatory tailwinds, EU ETS carbon prices, industrial off-takers"],
    "threats": ["Chinese manufacturing scale, grid connection delays, subsidised grey baselines"]
  },
  "agenticDiligence": {
    "quarantine": {
      "verifiedClaims": [
        {"claim": "Founder claim that matches physical laws", "basis": "Physical law or industrial baseline that confirms it", "status": "VERIFIED"}
      ],
      "quarantinedAssertions": [
        {"assertion": "Unsubstantiated or contradictory founder claim", "contradiction": "Exact thermodynamic or cost contradiction exposing why this claim fails", "severity": "CRITICAL"}
      ]
    },
    "causalSensitivity": {
      "criticalAssumption": "The core assumption the business case rests on (e.g. uninterrupted €0.03/kWh solar electricity)",
      "stressScenarios": [
        {"parameter": "Power Input Cost", "shift": "+40% spike to €0.07/kWh", "impact": "Production cost increases from €1.80/kg to €3.40/kg, destroying the margin"},
        {"parameter": "Stack Lifetime", "shift": "Degradation doubles (40,000h instead of 80,000h)", "impact": "Levelized CapEx doubles, adding €0.65/kg to lifecycle cost"},
        {"parameter": "Offtake Contract Pricing", "shift": "Buyer demands grey baseline match", "impact": "Company requires €1.20/kg government subsidy to stay solvent"}
      ],
      "breakEvenThreshold": "Electricity input price must remain below €0.042/kWh for positive gross margin"
    },
    "icPunchList": [
      {
        "question": "What is your measured degradation rate per 1,000 hours under intermittent cycling, and who validated the cell test?",
        "targetRisk": "Premature membrane breakdown under intermittent renewable feeds",
        "whyItExposesFraud": "Founders cite lab numbers under steady direct current, concealing failure under real wind and solar fluctuation."
      },
      {
        "question": "What is the single-stack BoP (balance of plant) CapEx per megawatt at scale, excluding government innovation grants?",
        "targetRisk": "Hiding balance of plant costs behind core cell membrane marketing",
        "whyItExposesFraud": "Cell membranes represent only 25% of total plant CapEx; compressors and rectifiers drive the remaining 75%."
      },
      {
        "question": "Which specific EPC or chemical plant operator has completed a safety and pressurized hydrogen compliance audit on this design?",
        "targetRisk": "Inability to permit or insure commercial multi-megawatt installations",
        "whyItExposesFraud": "Lab scale prototypes frequently fail ATEX explosion and high pressure hydrogen safety certification."
      }
    ]
  },
  "brutalRealityCheck": {
    "existingSolutions": [
      {"name": "Incumbent Solution 1", "whyBetter": "Proven 100,000h operational track record with balance sheet guarantees", "pricing": "Industry standard", "marketPosition": "Incumbent market leader"}
    ],
    "bigFishThreat": {
      "company": "Siemens Energy / Thyssenkrupp nucera",
      "timeToReplicate": "6 to 12 months with internal R&D",
      "whyTheyWould": "Defend existing gigawatt pipeline from margin erosion",
      "whyTheyMightNot": "High overhead makes small initial pilot projects unattractive to them",
      "economicIncentive": "Multi-billion euro industrial decarbonization procurement orders",
      "historicalPrecedent": "Acquired or out-scaled early membrane innovators once technology reached TRL-7"
    },
    "whyThisWillFail": {
      "unitEconomics": "Electricity consumption dominates lifecycle cost. Small efficiency losses destroy gross margins.",
      "distributionTrap": "Industrial off-takers demand 10-year performance warranties backed by investment-grade balance sheets.",
      "timingProblem": "Customer pilot procurement cycles span 18 to 36 months before commercial commitment.",
      "defensibilityGap": "Cell assembly without proprietary catalyst or ionomer formulations is commoditized quickly.",
      "expertiseRequired": "Requires electrochemical scale-up, materials science, and EPC project finance veterans.",
      "marketSizeReality": "Addressable market is constrained by regional grid connection queues and green power availability."
    },
    "startupGraveyard": [
      {"name": "Previous Startup X", "raised": "€45m", "rootCause": "Stack membrane degradation under variable load caused field recalls", "lesson": "Never scale factory capacity before completing 10,000h continuous cycling tests"}
    ],
    "brutalVerdict": "The core science has merit, but the unit economics assume idealized renewable power pricing that does not exist on European grids without heavy subsidies.",
    "survivalProbability": "32%",
    "confidenceReasoning": "Based on historical TRL-5 clean-tech survival rates and capital expenditure cycles in European climate funds",
    "salvagePlan": {
      "nichePivot": "Target co-located off-grid chemical industrial sites where waste heat can be captured and utilized",
      "unfairAdvantage": "Patent proprietary non-precious catalyst formulation and license it to established tier-1 electrolyzer builders",
      "actionableSteps": [
        "Complete an independent third-party 5,000h accelerated stress test with Fraunhofer or NREL",
        "Publish unadjusted BoP CapEx breakdown verified by an independent engineering firm",
        "Sign a binding off-take letter of intent tied to defined purity and uptime parameters"
      ],
      "timelineToValidation": "9 months for independent accelerated durability testing"
    }
  },
  "threats": [{"storyIndex": 1, "reason": "Direct market threat or competing capital deployment"}],
  "opportunities": [{"storyIndex": 2, "reason": "Positive market momentum or demand signal"}],
  "marketGaps": ["High-efficiency non-precious membrane stacks for fluctuating renewable feeds"],
  "timing": "risky",
  "timingReason": "High interest rates and capital goods inflation squeeze heavy infrastructure project financing.",
  "recommendation": "Do not fund as a standalone plant operator. Pivot towards licensing the core membrane and catalyst IP to existing global manufacturers."
}`;
        } else {
            // AI / Tech / General Startups
            systemPrompt = `You are a Silicon Valley venture investor and systems architect who has reviewed 10,000 software and AI startup pitches. Your task is to perform an honest, rigorous reality check.

You differentiate real technical moats from thin API wrappers:
1. CANARY HEALTH SCORE (0-1000): Growth Potential (0-500), Competitive Density (0-200), Timing Signal (0-150), Defensibility (0-150).
2. INSTITUTIONAL MEMORY & CONTRADICTION QUARANTINE:
   - Identify verified or realistic architectural claims.
   - Quarantine assertions that claim zero hallucination, 100% accuracy, or zero maintenance without an execution harness.
3. CAUSAL SENSITIVITY: Single critical assumption and stress test against token price drops, latency, and client churn.
4. INVESTMENT COMMITTEE PUNCH-LIST: 3 sharp questions that expose technical risk and wrapper dependencies.
5. BRUTAL REALITY CHECK: Existing solutions, big fish threat, why this will fail, startup graveyard, survival probability, and salvage pivot plan.`;

            userPrompt = `## STARTUP PITCH TO AUDIT:
${sanitizedDescription}

## CURRENT ECOSYSTEM NEWS (${limitedStories.length} stories):
${storySummaries}

Provide an exhaustive due diligence evaluation in valid JSON matching this schema:
{
  "canaryScore": {
    "total": 620,
    "grade": "C",
    "factors": {
      "growthPotential": {"score": 310, "reasoning": "Market tailwinds and developer attention"},
      "competitiveDensity": {"score": 100, "reasoning": "High density of open-source and API alternatives"},
      "timingSignal": {"score": 110, "reasoning": "Rapid enterprise experimentation cycle"},
      "defensibility": {"score": 100, "reasoning": "Defensibility against foundation model feature absorption"}
    },
    "percentile": "Top 35% of tech ideas analyzed",
    "verdict": "Clear developer utility but exposed to foundation model platform risk"
  },
  "swotAnalysis": {
    "strengths": ["Core workflow automation and integration ease"],
    "weaknesses": ["Dependency on underlying LLM model economics and context reliability"],
    "opportunities": ["Enterprise governance and privacy-conscious on-premise deployments"],
    "threats": ["Frontier model providers releasing native tooling that replaces this product"]
  },
  "agenticDiligence": {
    "quarantine": {
      "verifiedClaims": [
        {"claim": "Founder claim on workflow speed or developer convenience", "basis": "Proven architectural patterns in agent systems", "status": "VERIFIED"}
      ],
      "quarantinedAssertions": [
        {"assertion": "Claim of 100% autonomous accuracy or zero human oversight", "contradiction": "Frontier models exhibit non-deterministic stochastic failure; raw prompt wrappers fail without state tripwires", "severity": "CRITICAL"}
      ]
    },
    "causalSensitivity": {
      "criticalAssumption": "Customers will pay a SaaS subscription rather than using native foundation model features",
      "stressScenarios": [
        {"parameter": "Frontier Model Capabilities", "shift": "Next model release absorbs core workflow", "impact": "User churn spikes 60% as customers use native vendor tools"},
        {"parameter": "Inference Token Cost", "shift": "Complex multi-turn agent loops increase compute cost 5x", "impact": "Gross margin collapses from 70% to 15% on fixed-price tiers"},
        {"parameter": "Open Source Alternatives", "shift": "High-quality Apache 2.0 release replicates workflow", "impact": "Pricing pressure forces freemium pivot"}
      ],
      "breakEvenThreshold": "Must maintain gross margin above 65% with token cost below $0.005 per task completion"
    },
    "icPunchList": [
      {
        "question": "What is your defensible data or system moat when OpenAI or Google ships this exact capability in their next API release?",
        "targetRisk": "Thin wrapper obsolescence",
        "whyItExposesFraud": "Founders building UI wrappers around prompt chains have zero switching costs when vendors build native features."
      },
      {
        "question": "What is your measured autonomous task failure rate on edge cases, and what sandbox prevents rogue actions?",
        "targetRisk": "System reliability and operational safety",
        "whyItExposesFraud": "Raw LLM demos succeed on golden path benchmarks but fail catastrophically in multi-step production pipelines."
      },
      {
        "question": "What percentage of your gross margin is consumed by third-party inference tokens on complex customer workflows?",
        "targetRisk": "Negative unit economics hidden by initial investor subsidies",
        "whyItExposesFraud": "Agentic loops often burn dozens of reasoning calls per user action, creating negative contribution margins."
      }
    ]
  },
  "brutalRealityCheck": {
    "existingSolutions": [
      {"name": "Existing Product", "whyBetter": "Has distribution, enterprise security certifications, and ecosystem integrations", "pricing": "$20-50/seat", "marketPosition": "Market standard"}
    ],
    "bigFishThreat": {
      "company": "OpenAI / Google / Microsoft",
      "timeToReplicate": "One sprint or single model update",
      "whyTheyWould": "Expand platform utility and retain enterprise API users",
      "whyTheyMightNot": "Niche enterprise workflow requirements are too specific for broad platform focus",
      "economicIncentive": "Drives API token consumption and cloud compute revenue",
      "historicalPrecedent": "Absorbed third-party vector search, RAG, and basic agent tool calling into core APIs"
    },
    "whyThisWillFail": {
      "unitEconomics": "High inference token consumption on edge cases eats software margins.",
      "distributionTrap": "Customer acquisition cost escalates quickly in a crowded developer tooling space.",
      "timingProblem": "Fast-moving foundation models make fixed orchestration layers obsolete every 6 months.",
      "defensibilityGap": "Prompt templates and simple LangChain pipelines are trivial to replicate.",
      "expertiseRequired": "Requires distributed systems engineering, compiler design, and evaluation harness expertise.",
      "marketSizeReality": "Willingness to pay is limited unless this directly replaces high-cost headcount."
    },
    "startupGraveyard": [
      {"name": "Previous Wrapper Startup", "raised": "$15m", "rootCause": "Killed when foundation model provider released native assistant features", "lesson": "Never compete with your API provider on core reasoning capabilities"}
    ],
    "brutalVerdict": "A helpful utility today, but an unsustainable standalone business without proprietary system-level defensibility.",
    "survivalProbability": "28%",
    "confidenceReasoning": "Historical retention data for single-feature AI wrappers across 2023-2026 vintages",
    "salvagePlan": {
      "nichePivot": "Pivot from generic workflow assistant to regulated enterprise compliance auditing with formal verification",
      "unfairAdvantage": "Build deterministic verification harnesses with audit trails that foundation model APIs cannot provide",
      "actionableSteps": [
        "Implement deterministic execution gates and state budgeting",
        "Integrate customer-specific private database connectors with local policy enforcement",
        "Offer on-premise air-gapped deployment for defense and healthcare clients"
      ],
      "timelineToValidation": "60 days to close two regulated design partners"
    }
  },
  "threats": [{"storyIndex": 1, "reason": "Direct market threat or competing release"}],
  "opportunities": [{"storyIndex": 2, "reason": "Demand signal or validation"}],
  "marketGaps": ["Deterministic verification and audit harnesses for enterprise AI execution"],
  "timing": "neutral",
  "timingReason": "High noise in the market makes buyer attention expensive, but enterprise demand for reliable execution is real.",
  "recommendation": "Shift focus away from generic generation towards deterministic verification, state budgeting, and compliance guarantees."
}`;
        }

        let response: Response | null = null;
        let usedProvider = 'openrouter';
        let usedModel = 'meta-llama/llama-3.3-70b-instruct';

        // 1. Try OpenRouter first (paid, reliable frontier model)
        if (openRouterKey) {
            try {
                usedProvider = 'openrouter';
                usedModel = 'meta-llama/llama-3.3-70b-instruct';
                response = await fetch(OPENROUTER_API_URL, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${openRouterKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'https://ai-canary-production.up.railway.app',
                        'X-Title': 'AICanary'
                    },
                    body: JSON.stringify({
                        model: usedModel,
                        messages: [
                            { role: 'system', content: systemPrompt + antiHallucinationRules },
                            { role: 'user', content: userPrompt }
                        ],
                        temperature: 0.2,
                        max_tokens: 3000,
                        response_format: { type: 'json_object' }
                    })
                });

                if (!response.ok) {
                    console.warn(`OpenRouter primary model failed (${response.status}), trying gpt-4o-mini fallback...`);
                    usedModel = 'openai/gpt-4o-mini';
                    response = await fetch(OPENROUTER_API_URL, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${openRouterKey}`,
                            'Content-Type': 'application/json',
                            'HTTP-Referer': 'https://ai-canary-production.up.railway.app',
                            'X-Title': 'AICanary'
                        },
                        body: JSON.stringify({
                            model: usedModel,
                            messages: [
                                { role: 'system', content: systemPrompt + antiHallucinationRules },
                                { role: 'user', content: userPrompt }
                            ],
                            temperature: 0.2,
                            max_tokens: 3000,
                            response_format: { type: 'json_object' }
                        })
                    });
                }
            } catch (orErr) {
                console.warn('OpenRouter fetch failed:', orErr);
                response = null;
            }
        }

        // 2. Try Groq as secondary fallback if OpenRouter failed
        if ((!response || !response.ok) && groqApiKey) {
            try {
                usedProvider = 'groq';
                usedModel = 'llama-3.1-8b-instant';
                response = await fetch(GROQ_API_URL, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${groqApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: usedModel,
                        messages: [
                            { role: 'system', content: systemPrompt + antiHallucinationRules },
                            { role: 'user', content: userPrompt }
                        ],
                        temperature: 0.2,
                        max_tokens: 2500,
                        response_format: { type: 'json_object' }
                    })
                });
            } catch (groqErr) {
                console.warn('Groq fetch failed:', groqErr);
                response = null;
            }
        }

        if (!response || !response.ok) {
            console.error('All live LLM providers failed, generating fallback analysis');
            return NextResponse.json({
                analysis: generateFallbackAnalysis(sanitizedDescription, limitedStories),
                source: 'rule-based',
                note: 'Live LLM temporarily unavailable, returned deterministic baseline analysis'
            });
        }

        const data = await response.json();
        const analysisText = data.choices?.[0]?.message?.content;

        let analysis;
        try {
            analysis = JSON.parse(analysisText);
        } catch {
            analysis = {
                raw: analysisText,
                threats: [],
                opportunities: [],
                marketGaps: [],
                timing: 'neutral',
                recommendation: analysisText
            };
        }

        // Defensive normalization for canaryScore shape
        if (typeof analysis.canaryScore === 'number') {
            const score = analysis.canaryScore;
            analysis.canaryScore = {
                total: score,
                grade: score >= 800 ? 'A' : score >= 650 ? 'B' : score >= 500 ? 'C' : score >= 350 ? 'D' : 'F',
                factors: {
                    growthPotential: { score: Math.round(score * 0.5), reasoning: 'Ecosystem momentum and market signals' },
                    competitiveDensity: { score: Math.round(score * 0.2), reasoning: 'Incumbent density and competitive intensity' },
                    timingSignal: { score: Math.round(score * 0.15), reasoning: 'Market adoption readiness' },
                    defensibility: { score: Math.round(score * 0.15), reasoning: 'Defensibility and patent moat' }
                },
                percentile: `Top ${Math.max(5, Math.round(100 - (score / 10)))}% of evaluated deals`,
                verdict: analysis.brutalVerdict || 'Synthesized overall venture health score'
            };
        } else if (analysis.canaryScore && !analysis.canaryScore.factors) {
            const score = analysis.canaryScore.total || 600;
            analysis.canaryScore.factors = {
                growthPotential: { score: Math.round(score * 0.5), reasoning: 'Ecosystem momentum and market signals' },
                competitiveDensity: { score: Math.round(score * 0.2), reasoning: 'Incumbent density and competitive intensity' },
                timingSignal: { score: Math.round(score * 0.15), reasoning: 'Market adoption readiness' },
                defensibility: { score: Math.round(score * 0.15), reasoning: 'Defensibility and patent moat' }
            };
        }

        if (analysis.threats) {
            analysis.threats = analysis.threats.map((t: { storyIndex: number; reason: string }) => ({
                ...t,
                story: limitedStories[t.storyIndex - 1] || null
            }));
        }
        if (analysis.opportunities) {
            analysis.opportunities = analysis.opportunities.map((o: { storyIndex: number; reason: string }) => ({
                ...o,
                story: limitedStories[o.storyIndex - 1] || null
            }));
        }

        return NextResponse.json({
            analysis,
            source: usedProvider,
            model: usedModel
        });

    } catch (error) {
        console.error('Intelligent analysis route error:', error);
        return NextResponse.json({
            error: 'Analysis request failed',
            analysis: null
        }, { status: 500 });
    }
}

function generateFallbackAnalysis(projectDescription: string, stories: Array<{ headline: string; sentiment?: string }>) {
    const projectWords = projectDescription.toLowerCase().split(/\s+/);
    const threats: Array<{ storyIndex: number; reason: string }> = [];
    const opportunities: Array<{ storyIndex: number; reason: string }> = [];

    stories.forEach((story, idx) => {
        const headlineLower = (story.headline || '').toLowerCase();
        const matchedWords = projectWords.filter(w => w.length > 4 && headlineLower.includes(w));
        if (matchedWords.length > 0) {
            if (story.sentiment === 'negative' || headlineLower.includes('fail') || headlineLower.includes('shut')) {
                threats.push({ storyIndex: idx + 1, reason: `Matches keyword signals: ${matchedWords.join(', ')}` });
            } else {
                opportunities.push({ storyIndex: idx + 1, reason: `Matches keyword signals: ${matchedWords.join(', ')}` });
            }
        }
    });

    return {
        canaryScore: {
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
        },
        swotAnalysis: {
            strengths: ['Clear user problem statement'],
            weaknesses: ['Requires deep third-party scientific or performance validation'],
            opportunities: ['Growing market interest in verifiable outcomes'],
            threats: ['Established incumbents with lower cost of capital']
        },
        agenticDiligence: {
            quarantine: {
                verifiedClaims: [
                    { claim: 'Identified problem space', basis: 'Industry reports confirm customer pain points', status: 'PLAUSIBLE' }
                ],
                quarantinedAssertions: [
                    { assertion: 'Founder margin and unit economic projections', contradiction: 'Lacks audited third-party trial data', severity: 'WARNING' }
                ]
            },
            causalSensitivity: {
                criticalAssumption: 'Cost of goods sold scales linearly with volume',
                stressScenarios: [
                    { parameter: 'Input Costs', shift: '+30% inflation', impact: 'Gross margin drops below sustainability threshold' },
                    { parameter: 'Sales Velocity', shift: 'Sales cycle elongates 2x', impact: 'Runway cuts in half without bridge funding' },
                    { parameter: 'Incumbent Response', shift: 'Incumbent cuts pricing 20%', impact: 'Customer acquisition cost spikes' }
                ],
                breakEvenThreshold: 'Requires minimum 45% gross margin at commercial scale'
            },
            icPunchList: [
                {
                    question: 'What is the audited unit economics breakdown excluding innovation grants?',
                    targetRisk: 'Hidden structural costs',
                    whyItExposesFraud: 'Exposes whether the product can survive on commercial revenue alone.'
                },
                {
                    question: 'Who are the three references for your commercial pilot data?',
                    targetRisk: 'Overstated customer traction',
                    whyItExposesFraud: 'Uncovers whether pilots are paid commercial contracts or unpaid exploratory trials.'
                },
                {
                    question: 'What is your single point of supply chain failure?',
                    targetRisk: 'Critical component scarcity',
                    whyItExposesFraud: 'Reveals supplier concentration and single-source dependency.'
                }
            ]
        },
        brutalRealityCheck: {
            existingSolutions: [
                { name: 'Incumbent Solutions', whyBetter: 'Proven balance sheets and established distribution channels', pricing: 'Commercial market rates', marketPosition: 'Market leader' }
            ],
            bigFishThreat: {
                company: 'Industry Incumbents',
                timeToReplicate: '6 to 12 months',
                whyTheyWould: 'Protect market share against challenger disruption',
                whyTheyMightNot: 'Focus on larger enterprise contracts initially',
                economicIncentive: 'Retaining high-margin customer accounts',
                historicalPrecedent: 'Acquired or priced out early entrants'
            },
            whyThisWillFail: {
                unitEconomics: 'High initial capital requirements before achieving scale efficiencies.',
                distributionTrap: 'Enterprise sales cycles are lengthy and capital-intensive.',
                timingProblem: 'Customer readiness may lag pitch optimism.',
                defensibilityGap: 'Lack of defensive patents or proprietary lock-in.',
                expertiseRequired: 'Demands cross-disciplinary engineering and operations leadership.',
                marketSizeReality: 'Initial serviceable obtainable market is often smaller than top-down TAM estimates.'
            },
            startupGraveyard: [
                { name: 'Similar Precedent Entity', raised: '€10m', rootCause: 'Ran out of runway before commercial validation', lesson: 'Validate unit economics before expanding burn' }
            ],
            brutalVerdict: 'Needs rigorous validation on unit economics and customer willingness to pay before raising growth capital.',
            survivalProbability: '30%',
            confidenceReasoning: 'Statistical baseline for early-stage technology ventures',
            salvagePlan: {
                nichePivot: 'Target a tightly focused initial customer cohort with immediate ROI requirements',
                unfairAdvantage: 'Build proprietary process or data moat that cannot be easily copied',
                actionableSteps: [
                    'Secure two paid pilot commitments with clear acceptance criteria',
                    'Complete independent technical verification of core performance claims',
                    'Build detailed bottom-up financial model under adverse cost scenarios'
                ],
                timelineToValidation: '90 days'
            }
        },
        threats: threats.slice(0, 5),
        opportunities: opportunities.slice(0, 5),
        marketGaps: ['Validated commercial solutions with transparent unit economics'],
        timing: 'neutral',
        timingReason: 'Market is actively evaluating alternatives',
        recommendation: 'Focus on independent technical verification and commercial pilot conversion before scaling marketing.'
    };
}
