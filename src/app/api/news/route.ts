import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ASKNEWS_API_KEY = process.env.ASKNEWS_API_KEY || 'ank_X091CjvzeqRC7NWtRO4KqvsvftxpsJMcJ1tN02ipAb';

interface AskNewsStory {
    uuid: string;
    headline?: string;
    keywords?: string[];
    summary?: string;
    sentiment?: number[];
    n_articles?: number[];
    categories?: string[];
    topics?: string[];
    updated_ts?: number;
}

interface TransformedStory {
    uuid: string;
    headline: string;
    summary: string;
    sentiment: number;
    coverage: number;
    categories: string[];
    publish_date: string;
}

function transformStory(story: AskNewsStory): TransformedStory {
    // Create headline from keywords if not provided
    const headline = story.headline ||
        (story.keywords ? story.keywords.slice(0, 5).join(' • ') : 'AI News Update');

    // Create summary from topics if available
    const summary = story.summary ||
        (story.topics ? `Topics: ${story.topics.slice(0, 3).join(', ')}` :
            (story.keywords ? `Key terms: ${story.keywords.slice(0, 6).join(', ')}` : ''));

    // Get sentiment (API returns array, we take first value)
    const sentiment = story.sentiment && story.sentiment.length > 0
        ? story.sentiment[0]
        : 0;

    // Coverage based on article count
    const coverage = story.n_articles && story.n_articles.length > 0
        ? Math.min(story.n_articles[0], 100)
        : 50;

    return {
        uuid: story.uuid,
        headline,
        summary,
        sentiment,
        coverage,
        categories: story.categories || ['AI'],
        publish_date: story.updated_ts
            ? new Date(story.updated_ts * 1000).toISOString()
            : new Date().toISOString(),
    };
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || 'Technology';

    try {
        // Using the AskNews Stories API to get hot tech stories
        const response = await fetch(
            `https://api.asknews.app/v1/stories?categories=${encodeURIComponent(category)}&limit=10`,
            {
                headers: {
                    'Authorization': `Bearer ${ASKNEWS_API_KEY}`,
                    'Accept': 'application/json',
                },
            }
        );

        if (!response.ok) {
            console.error('AskNews API error:', response.status, await response.text());
            throw new Error(`AskNews API error: ${response.status}`);
        }

        const data = await response.json();
        const rawStories: AskNewsStory[] = data.stories || [];

        // Transform stories to our frontend format
        const stories = rawStories.map(transformStory);

        return NextResponse.json({
            success: true,
            source: 'asknews',
            count: stories.length,
            stories,
        });

    } catch (error) {
        console.error('AskNews API Error:', error);

        // Return mock data for demo purposes when API fails
        return NextResponse.json({
            success: true,
            source: 'mock',
            stories: [
                {
                    uuid: '1',
                    headline: 'OpenAI Releases GPT-5 with Groundbreaking Reasoning Capabilities',
                    summary: 'OpenAI unveils GPT-5, featuring enhanced logical reasoning and multi-modal understanding.',
                    sentiment: 0.8,
                    coverage: 95,
                    publish_date: new Date().toISOString(),
                    categories: ['AI', 'Technology'],
                },
                {
                    uuid: '2',
                    headline: 'Anthropic Launches Claude 4 with Extended Context Window',
                    summary: 'Claude 4 introduces a 1M token context window for document analysis.',
                    sentiment: 0.75,
                    coverage: 88,
                    publish_date: new Date().toISOString(),
                    categories: ['AI', 'LLM'],
                },
                {
                    uuid: '3',
                    headline: 'Google DeepMind Achieves AGI Milestone with Gemini Ultra 2',
                    summary: 'Gemini Ultra 2 demonstrates unprecedented general intelligence.',
                    sentiment: 0.85,
                    coverage: 92,
                    publish_date: new Date().toISOString(),
                    categories: ['AI', 'Research'],
                },
                {
                    uuid: '4',
                    headline: 'Meta Open-Sources Llama 4 with MoE Architecture',
                    summary: 'Llama 4 becomes the most capable open-source model.',
                    sentiment: 0.7,
                    coverage: 78,
                    publish_date: new Date().toISOString(),
                    categories: ['AI', 'Open Source'],
                },
                {
                    uuid: '5',
                    headline: 'Mistral AI Raises €1B Series C at €10B Valuation',
                    summary: 'European AI leader closes massive funding round.',
                    sentiment: 0.65,
                    coverage: 72,
                    publish_date: new Date().toISOString(),
                    categories: ['AI', 'Funding'],
                },
            ],
        });
    }
}
