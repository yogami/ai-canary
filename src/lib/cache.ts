/**
 * AICanary - LocalStorage Cache Utility
 * Caches API responses for offline/fallback support
 */

const CACHE_KEY = 'aicanary_stories_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
    stories: unknown[];
    timestamp: number;
}

export function getCachedStories(): unknown[] | null {
    if (typeof window === 'undefined') return null;

    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;

        const entry: CacheEntry = JSON.parse(cached);
        const isExpired = Date.now() - entry.timestamp > CACHE_TTL;

        // Return expired data as fallback, but mark it stale
        return entry.stories || null;
    } catch {
        return null;
    }
}

export function setCachedStories(stories: unknown[]): void {
    if (typeof window === 'undefined') return;

    try {
        const entry: CacheEntry = {
            stories,
            timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
    } catch (error) {
        console.warn('Failed to cache stories:', error);
    }
}

export function isCacheStale(): boolean {
    if (typeof window === 'undefined') return true;

    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return true;

        const entry: CacheEntry = JSON.parse(cached);
        return Date.now() - entry.timestamp > CACHE_TTL;
    } catch {
        return true;
    }
}

// Alert configuration storage
const ALERT_CONFIG_KEY = 'aicanary_alert_config';

export interface AlertConfig {
    keywords: string[];
    sentimentFilter: 'all' | 'bullish' | 'bearish';
    enabled: boolean;
}

export function getAlertConfig(): AlertConfig {
    if (typeof window === 'undefined') {
        return { keywords: [], sentimentFilter: 'all', enabled: true };
    }

    try {
        const config = localStorage.getItem(ALERT_CONFIG_KEY);
        return config ? JSON.parse(config) : { keywords: [], sentimentFilter: 'all', enabled: true };
    } catch {
        return { keywords: [], sentimentFilter: 'all', enabled: true };
    }
}

export function setAlertConfig(config: AlertConfig): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(ALERT_CONFIG_KEY, JSON.stringify(config));
    } catch (error) {
        console.warn('Failed to save alert config:', error);
    }
}

// Alert history storage
const ALERT_HISTORY_KEY = 'aicanary_alert_history';

export interface AlertHistoryEntry {
    storyId: string;
    headline: string;
    timestamp: string;
    channel: string;
}

export function getAlertHistory(): AlertHistoryEntry[] {
    if (typeof window === 'undefined') return [];

    try {
        const history = localStorage.getItem(ALERT_HISTORY_KEY);
        return history ? JSON.parse(history) : [];
    } catch {
        return [];
    }
}

export function addAlertToHistory(entry: AlertHistoryEntry): void {
    if (typeof window === 'undefined') return;

    try {
        const history = getAlertHistory();
        history.unshift(entry);
        // Keep only last 50 alerts
        localStorage.setItem(ALERT_HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
    } catch (error) {
        console.warn('Failed to save alert history:', error);
    }
}

// Onboarding flag
const ONBOARDING_KEY = 'aicanary_onboarding_done';

export function isOnboardingDone(): boolean {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(ONBOARDING_KEY) === 'true';
}

export function markOnboardingDone(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ONBOARDING_KEY, 'true');
}

// Watchlist storage for competitor tracking
const WATCHLIST_KEY = 'aicanary_watchlist';

export interface WatchlistItem {
    keyword: string;
    addedAt: string;
}

export function getWatchlist(): WatchlistItem[] {
    if (typeof window === 'undefined') return [];

    try {
        const watchlist = localStorage.getItem(WATCHLIST_KEY);
        return watchlist ? JSON.parse(watchlist) : [];
    } catch {
        return [];
    }
}

export function addToWatchlist(keyword: string): void {
    if (typeof window === 'undefined') return;

    try {
        const watchlist = getWatchlist();
        if (!watchlist.some(item => item.keyword.toLowerCase() === keyword.toLowerCase())) {
            watchlist.push({ keyword, addedAt: new Date().toISOString() });
            localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
        }
    } catch (error) {
        console.warn('Failed to add to watchlist:', error);
    }
}

export function removeFromWatchlist(keyword: string): void {
    if (typeof window === 'undefined') return;

    try {
        const watchlist = getWatchlist().filter(
            item => item.keyword.toLowerCase() !== keyword.toLowerCase()
        );
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
    } catch (error) {
        console.warn('Failed to remove from watchlist:', error);
    }
}

export function isInWatchlist(keyword: string): boolean {
    return getWatchlist().some(item => item.keyword.toLowerCase() === keyword.toLowerCase());
}

// Project description storage
const PROJECT_KEY = 'aicanary_project';

export function getStoredProject(): string {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(PROJECT_KEY) || '';
}

export function setStoredProject(description: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PROJECT_KEY, description);
}
