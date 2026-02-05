import { NextResponse } from 'next/server';

// Polymarket Gamma API - for market discovery and metadata
const GAMMA_API_URL = 'https://gamma-api.polymarket.com';

interface PolymarketEvent {
    id: string;
    slug: string;
    title: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    volume?: number;
    liquidity?: number;
    outcomes?: string[];
    outcomePrices?: string[];
    active: boolean;
    closed: boolean;
    category?: string;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category') || 'all';
        const limit = parseInt(searchParams.get('limit') || '20');

        // Fetch active markets from Polymarket Gamma API
        const response = await fetch(`${GAMMA_API_URL}/events?active=true&closed=false&limit=50`, {
            headers: {
                'Accept': 'application/json',
            },
            next: { revalidate: 300 } // Cache for 5 minutes
        });

        if (!response.ok) {
            console.error('Polymarket API error:', response.status);
            return NextResponse.json({
                predictions: getFallbackPredictions(),
                source: 'fallback',
                note: 'Using cached predictions - Polymarket API temporarily unavailable'
            });
        }

        const events: PolymarketEvent[] = await response.json();

        // Filter and transform to our format
        const predictions = events
            .filter((event: PolymarketEvent) => event.active && !event.closed)
            .filter((event: PolymarketEvent) => {
                if (category === 'all') return true;
                const title = event.title?.toLowerCase() || '';
                const desc = event.description?.toLowerCase() || '';

                switch (category) {
                    case 'tech':
                        return /ai|tech|openai|google|microsoft|apple|meta|nvidia|chip|semiconductor|regulation/i.test(title + desc);
                    case 'politics':
                        return /election|president|congress|senate|vote|trump|biden|policy|law/i.test(title + desc);
                    case 'crypto':
                        return /bitcoin|btc|eth|crypto|blockchain|defi|nft/i.test(title + desc);
                    case 'economy':
                        return /fed|rate|inflation|gdp|recession|tariff|trade|market/i.test(title + desc);
                    default:
                        return true;
                }
            })
            .slice(0, limit)
            .map((event: PolymarketEvent) => {
                // Parse outcome prices (probabilities)
                const prices = event.outcomePrices ?
                    event.outcomePrices.map((p: string) => parseFloat(p) * 100) : [];
                const outcomes = event.outcomes || ['Yes', 'No'];

                return {
                    id: event.id,
                    slug: event.slug,
                    question: event.title,
                    description: event.description?.slice(0, 200),
                    outcomes: outcomes.map((outcome: string, i: number) => ({
                        name: outcome,
                        probability: prices[i] ? Math.round(prices[i]) : 50
                    })),
                    volume: event.volume ? `$${(event.volume / 1000000).toFixed(1)}M` : 'N/A',
                    liquidity: event.liquidity ? `$${(event.liquidity / 1000).toFixed(0)}K` : 'N/A',
                    endDate: event.endDate,
                    url: `https://polymarket.com/event/${event.slug}`
                };
            });

        return NextResponse.json({
            predictions,
            source: 'polymarket',
            timestamp: new Date().toISOString(),
            count: predictions.length
        });

    } catch (error) {
        console.error('Polymarket fetch error:', error);
        return NextResponse.json({
            predictions: getFallbackPredictions(),
            source: 'fallback',
            error: 'Failed to fetch live predictions'
        });
    }
}

// Fallback predictions for demo if API fails
function getFallbackPredictions() {
    return [
        {
            id: 'fallback-1',
            question: 'Will OpenAI release GPT-5 before July 2026?',
            outcomes: [{ name: 'Yes', probability: 65 }, { name: 'No', probability: 35 }],
            volume: '$2.1M',
            category: 'tech'
        },
        {
            id: 'fallback-2',
            question: 'Will EU AI Act enforcement begin in 2026?',
            outcomes: [{ name: 'Yes', probability: 78 }, { name: 'No', probability: 22 }],
            volume: '$850K',
            category: 'tech'
        },
        {
            id: 'fallback-3',
            question: 'Will Fed cut rates before Q3 2026?',
            outcomes: [{ name: 'Yes', probability: 42 }, { name: 'No', probability: 58 }],
            volume: '$5.2M',
            category: 'economy'
        },
        {
            id: 'fallback-4',
            question: 'Will Bitcoin reach $150k in 2026?',
            outcomes: [{ name: 'Yes', probability: 28 }, { name: 'No', probability: 72 }],
            volume: '$12.5M',
            category: 'crypto'
        }
    ];
}
