import { NextResponse } from 'next/server';

const HN_API_BASE = 'https://hacker-news.firebaseio.com/v0';
const AI_KEYWORDS = ['ai', 'llm', 'gpt', 'claude', 'openai', 'anthropic', 'gemini', 'mistral', 'deepseek', 'machine learning', 'neural', 'transformer', 'chatbot', 'generative'];

interface HNStory {
    id: number;
    title: string;
    url?: string;
    score: number;
    time: number;
    by: string;
    descendants?: number;
}

async function fetchStory(id: number): Promise<HNStory | null> {
    try {
        const res = await fetch(`${HN_API_BASE}/item/${id}.json`, {
            next: { revalidate: 300 } // Cache for 5 min
        });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

function isAIRelated(title: string): boolean {
    const lowerTitle = title.toLowerCase();
    return AI_KEYWORDS.some(keyword => lowerTitle.includes(keyword));
}

export async function GET() {
    try {
        // Fetch top 100 stories
        const topRes = await fetch(`${HN_API_BASE}/topstories.json`, {
            next: { revalidate: 300 }
        });

        if (!topRes.ok) {
            return NextResponse.json({ error: 'Failed to fetch HN stories' }, { status: 500 });
        }

        const topIds: number[] = await topRes.json();

        // Fetch first 50 stories in parallel
        const storyPromises = topIds.slice(0, 50).map(id => fetchStory(id));
        const stories = await Promise.all(storyPromises);

        // Filter for AI-related stories
        const aiStories = stories
            .filter((story): story is HNStory => story !== null && story.title !== undefined)
            .filter(story => isAIRelated(story.title))
            .slice(0, 15) // Return top 15 AI stories
            .map(story => ({
                id: `hn-${story.id}`,
                headline: story.title,
                summary: `${story.score} points | ${story.descendants || 0} comments | by ${story.by}`,
                url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
                source: 'HackerNews',
                sourceIcon: '🟠',
                sentiment: story.score > 200 ? 'positive' : story.score > 50 ? 'neutral' : 'negative',
                sentimentScore: Math.min(story.score / 500, 1),
                coverage: Math.min(story.descendants || 0 / 100, 1),
                publishedAt: new Date(story.time * 1000).toISOString(),
                entities: []
            }));

        return NextResponse.json({
            stories: aiStories,
            source: 'hackernews',
            count: aiStories.length
        });

    } catch (error) {
        console.error('HackerNews API error:', error);
        return NextResponse.json({
            error: 'Failed to fetch HackerNews stories',
            stories: []
        }, { status: 500 });
    }
}
