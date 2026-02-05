import { NextResponse } from 'next/server';

// Groq API for free LLM access
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

// ============ SECURITY: Prompt Injection Protection ============

// Patterns that indicate potential prompt injection attempts
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

// Maximum input lengths
const MAX_PROJECT_DESC_LENGTH = 5000;
const MAX_STORY_COUNT = 30;

// Sanitize user input to prevent injection
function sanitizeInput(text: string): string {
    if (!text || typeof text !== 'string') return '';

    // Truncate to max length
    let sanitized = text.slice(0, MAX_PROJECT_DESC_LENGTH);

    // Remove potential control characters
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // Escape markdown/formatting that could confuse the model
    sanitized = sanitized.replace(/```/g, '`‌`‌`'); // Zero-width joiner to break code blocks

    return sanitized.trim();
}

// Check for prompt injection attempts
function detectInjection(text: string): { isInjection: boolean; pattern?: string } {
    for (const pattern of INJECTION_PATTERNS) {
        if (pattern.test(text)) {
            return { isInjection: true, pattern: pattern.source };
        }
    }
    return { isInjection: false };
}

// ============ END SECURITY ============

export async function POST(request: Request) {
    try {
        const body: IntelligentAnalysisRequest = await request.json();
        const { projectDescription, stories, niche = 'technology' } = body;

        // ======= SECURITY CHECKS =======
        // Check for prompt injection in project description
        const injectionCheck = detectInjection(projectDescription);
        if (injectionCheck.isInjection) {
            console.warn('Prompt injection attempt detected:', injectionCheck.pattern);
            return NextResponse.json({
                error: 'Invalid input detected',
                analysis: null
            }, { status: 400 });
        }

        // Sanitize the project description
        const sanitizedDescription = sanitizeInput(projectDescription);
        if (!sanitizedDescription) {
            return NextResponse.json({
                error: 'Project description is required',
                analysis: null
            }, { status: 400 });
        }

        // Limit number of stories to prevent context attacks
        const limitedStories = stories.slice(0, MAX_STORY_COUNT);
        // ======= END SECURITY CHECKS =======

        // Check for Groq API key
        const groqApiKey = process.env.GROQ_API_KEY;

        if (!groqApiKey) {
            // Fallback to rule-based analysis if no API key
            return NextResponse.json({
                analysis: generateFallbackAnalysis(sanitizedDescription, limitedStories),
                source: 'rule-based',
                note: 'For intelligent LLM analysis, add GROQ_API_KEY to environment'
            });
        }

        // Sanitize niche input
        const allowedNiches = ['technology', 'ai', 'media', 'film', 'music', 'gaming', 'fintech', 'healthcare', 'climate'];
        const safeNiche = allowedNiches.includes(niche.toLowerCase()) ? niche : 'technology';

        // Build context from stories
        const storySummaries = limitedStories.slice(0, 20).map((s, i) =>
            `${i + 1}. [${s.sentiment || 'neutral'}] ${sanitizeInput(s.headline).slice(0, 100)}`
        ).join('\n');

        // NICHE-SPECIFIC PROMPTS
        let systemPrompt: string;
        let userPrompt: string;

        if (safeNiche === 'media' || safeNiche === 'film') {
            // PRODUCER PANEL: Multi-persona film industry analysis
            systemPrompt = `You are a PRODUCER CONSORTIUM evaluating a film/TV project pitch. You will role-play as 3 industry veterans with different perspectives:

🎬 SARAH CHEN (Studio Executive) - 20 years at major studios. Focus on:
- Commercial viability and box office potential
- Star/director attachment possibilities
- Marketing hooks and four-quadrant appeal
- IP value and franchise potential

🎥 MARCUS OKONJO (Indie Producer) - Award-winning independent producer. Focus on:
- Story integrity and artistic merit
- Festival potential (Sundance, Cannes, TIFF)
- Critical acclaim likelihood
- Social/cultural relevance

🌍 ELENA VOLKOV (International Sales) - Head of acquisitions. Focus on:
- Foreign market appeal
- Genre performance by territory
- Co-production opportunities
- Streaming platform fit

Each producer gives their honest assessment based on their experience.`;

            userPrompt = `## PROJECT PITCH:
${sanitizedDescription}

## CURRENT ENTERTAINMENT NEWS (${limitedStories.length} stories):
${storySummaries}

## PRODUCER PANEL EVALUATION REQUIRED:

Each producer should provide:
1. Gut reaction score (0-10)
2. Key strengths they see
3. Concerns/red flags
4. What would make them say "yes"
5. Which news stories (by number) are relevant

Also provide:
- Overall timing assessment for this type of project
- Market gaps this could fill
- Strategic recommendation

Format your response as JSON:
{
  "producerPanel": [
    {
      "name": "Sarah Chen",
      "role": "Studio Executive",
      "score": 7,
      "strengths": ["commercial hook", "timely topic"],
      "concerns": ["budget concerns", "similar projects in development"],
      "whatWouldMakeThemSayYes": "A-list attachment or proven IP",
      "relevantStories": [1, 5]
    },
    {
      "name": "Marcus Okonjo", 
      "role": "Indie Producer",
      "score": 8,
      "strengths": ["unique voice", "festival potential"],
      "concerns": ["narrow audience"],
      "whatWouldMakeThemSayYes": "Director with strong vision",
      "relevantStories": [3]
    },
    {
      "name": "Elena Volkov",
      "role": "International Sales",
      "score": 6,
      "strengths": ["genre travels well"],
      "concerns": ["culturally specific elements"],
      "whatWouldMakeThemSayYes": "European co-production potential",
      "relevantStories": [2, 4]
    }
  ],
  "consensusScore": 7,
  "timing": "good|neutral|risky",
  "timingReason": "...",
  "marketGaps": ["gap1", "gap2"],
  "threats": [{"storyIndex": 1, "reason": "..."}],
  "opportunities": [{"storyIndex": 2, "reason": "..."}],
  "recommendation": "..."
}`;
        } else {
            // DEFAULT: Standard market analysis for other niches
            systemPrompt = `You are a strategic market analyst for ${safeNiche} projects. Your job is to analyze a project description and identify:
1. THREATS: News stories that represent competition, market saturation, or negative trends
2. OPPORTUNITIES: News stories that validate the market, show gaps, or positive momentum
3. POSITIONING: How this project should position itself given current market signals
4. TIMING: Whether now is a good time to launch this type of product

Be specific and reference actual story numbers from the provided news.`;

            userPrompt = `## Project Description:
${sanitizedDescription}

## Current ${safeNiche.toUpperCase()} News (${limitedStories.length} stories):
${storySummaries}

## Analysis Required:
1. Which stories (by number) represent THREATS to this project?
2. Which stories (by number) represent OPPORTUNITIES?
3. What market gaps does this project fill?
4. What's the timing assessment (good/neutral/risky)?
5. One-paragraph strategic recommendation

Format your response as JSON:
{
  "threats": [{"storyIndex": 1, "reason": "..."}],
  "opportunities": [{"storyIndex": 2, "reason": "..."}],
  "marketGaps": ["gap1", "gap2"],
  "timing": "good|neutral|risky",
  "timingReason": "...",
  "recommendation": "..."
}`;
        }

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${groqApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.3,
                max_tokens: 1500,
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Groq API error:', errorText);
            return NextResponse.json({
                analysis: generateFallbackAnalysis(projectDescription, stories),
                source: 'fallback',
                error: 'LLM API temporarily unavailable'
            });
        }

        const data = await response.json();
        const analysisText = data.choices?.[0]?.message?.content;

        let analysis;
        try {
            analysis = JSON.parse(analysisText);
        } catch {
            // If JSON parsing fails, return raw text
            analysis = {
                raw: analysisText,
                threats: [],
                opportunities: [],
                marketGaps: [],
                timing: 'neutral',
                recommendation: analysisText
            };
        }

        // Map story indices back to actual stories
        if (analysis.threats) {
            analysis.threats = analysis.threats.map((t: { storyIndex: number; reason: string }) => ({
                ...t,
                story: stories[t.storyIndex - 1] || null
            }));
        }
        if (analysis.opportunities) {
            analysis.opportunities = analysis.opportunities.map((o: { storyIndex: number; reason: string }) => ({
                ...o,
                story: stories[o.storyIndex - 1] || null
            }));
        }

        return NextResponse.json({
            analysis,
            source: 'groq-llama',
            model: 'llama-3.1-8b-instant'
        });

    } catch (error) {
        console.error('Intelligent analysis error:', error);
        return NextResponse.json({
            error: 'Analysis failed',
            analysis: null
        }, { status: 500 });
    }
}

// Fallback rule-based analysis when no LLM available
function generateFallbackAnalysis(projectDescription: string, stories: Array<{ headline: string; sentiment?: string }>) {
    const projectWords = projectDescription.toLowerCase().split(/\s+/);

    // Find stories with any word overlap
    const threats: Array<{ storyIndex: number; reason: string }> = [];
    const opportunities: Array<{ storyIndex: number; reason: string }> = [];

    stories.forEach((story, idx) => {
        const headlineLower = story.headline.toLowerCase();
        const matchedWords = projectWords.filter(w => w.length > 4 && headlineLower.includes(w));

        if (matchedWords.length > 0) {
            if (story.sentiment === 'negative' || headlineLower.includes('fail') || headlineLower.includes('shut')) {
                threats.push({ storyIndex: idx + 1, reason: `Matches: ${matchedWords.join(', ')}` });
            } else {
                opportunities.push({ storyIndex: idx + 1, reason: `Matches: ${matchedWords.join(', ')}` });
            }
        }
    });

    return {
        threats: threats.slice(0, 5),
        opportunities: opportunities.slice(0, 5),
        marketGaps: ['No LLM analysis available - add GROQ_API_KEY for intelligent insights'],
        timing: 'neutral',
        timingReason: 'Unable to assess without LLM analysis',
        recommendation: 'Add GROQ_API_KEY environment variable for intelligent semantic analysis. Get a free key at console.groq.com'
    };
}
