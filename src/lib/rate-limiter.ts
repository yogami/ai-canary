// Rate limiting utility to protect API compute budgets

const RATE_LIMIT_MAX = 30; // Max analyses per IP per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetIn: number;
}

export function checkRateLimit(ip: string): RateLimitResult {
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

export { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW };
