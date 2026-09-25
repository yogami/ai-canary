const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface LLMAnalysisResponse {
    analysis: any;
    provider: string;
    model: string;
}

export async function fetchFrontierAnalysis(
    systemPrompt: string,
    userPrompt: string
): Promise<LLMAnalysisResponse | null> {
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    if (openRouterKey) {
        const orResult = await executeOpenRouterCascade(systemPrompt, userPrompt, openRouterKey);
        if (orResult) return orResult;
    }

    if (groqKey) {
        const groqResult = await executeGroqCall(systemPrompt, userPrompt, groqKey);
        if (groqResult) return groqResult;
    }

    return null;
}

async function executeOpenRouterCascade(
    systemPrompt: string,
    userPrompt: string,
    apiKey: string
): Promise<LLMAnalysisResponse | null> {
    const models = ['anthropic/claude-sonnet-5', 'openai/gpt-5-mini'];

    for (const model of models) {
        try {
            const res = await callOpenRouter(systemPrompt, userPrompt, model, apiKey);
            if (res && res.ok) {
                const data = await res.json();
                const content = data.choices?.[0]?.message?.content;
                const parsed = parseLLMJson(content);
                if (parsed) return { analysis: parsed, provider: 'openrouter', model };
            }
        } catch {
            // Cascade to next model
        }
    }
    return null;
}

async function callOpenRouter(
    systemPrompt: string,
    userPrompt: string,
    model: string,
    apiKey: string
): Promise<Response | null> {
    return fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://ai-canary-production.up.railway.app',
            'X-Title': 'AICanary'
        },
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.2,
            max_tokens: 3000,
            response_format: { type: 'json_object' }
        })
    });
}

async function executeGroqCall(
    systemPrompt: string,
    userPrompt: string,
    apiKey: string
): Promise<LLMAnalysisResponse | null> {
    try {
        const res = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            signal: AbortSignal.timeout(15000),
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.2,
                response_format: { type: 'json_object' }
            })
        });

        if (res.ok) {
            const data = await res.json();
            const parsed = parseLLMJson(data.choices?.[0]?.message?.content);
            if (parsed) return { analysis: parsed, provider: 'groq', model: 'llama-3.3-70b-versatile' };
        }
    } catch {
        return null;
    }
    return null;
}

export function parseLLMJson(rawContent?: string): any {
    if (!rawContent) return null;

    let clean = rawContent.trim();
    if (clean.includes('```json')) {
        clean = clean.split('```json')[1].split('```')[0].trim();
    } else if (clean.includes('```')) {
        clean = clean.split('```')[1].split('```')[0].trim();
    }

    try {
        return JSON.parse(clean);
    } catch {
        return null;
    }
}
