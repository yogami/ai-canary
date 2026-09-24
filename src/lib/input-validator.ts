// Prompt Injection Protection and Input Sanitization

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

export const MAX_PROJECT_DESC_LENGTH = 5000;
export const MAX_STORY_COUNT = 30;

export function sanitizeInput(text: string): string {
    if (!text || typeof text !== 'string') return '';
    let sanitized = text.slice(0, MAX_PROJECT_DESC_LENGTH);
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    sanitized = sanitized.replace(/```/g, '`‌`‌`');
    return sanitized.trim();
}

export function detectInjection(text: string): { isInjection: boolean; pattern?: string } {
    for (const pattern of INJECTION_PATTERNS) {
        if (pattern.test(text)) {
            return { isInjection: true, pattern: pattern.source };
        }
    }
    return { isInjection: false };
}
