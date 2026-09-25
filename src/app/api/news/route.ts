import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ASKNEWS_API_KEY = process.env.ASKNEWS_API_KEY;

interface AskNewsArticle {
    article_id?: string;
    uuid?: string;
    title?: string;
    eng_title?: string;
    summary?: string;
    key_points?: string[];
    sentiment?: number | number[];
    pub_date?: string;
    keywords?: string[];
    classification?: string;
    article_url?: string;
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

function extractHeadline(article: AskNewsArticle): string {
    if (article.eng_title) return article.eng_title;
    if (article.title) return article.title;
    if (article.keywords && article.keywords.length > 0) {
        return article.keywords.slice(0, 4).join(' • ');
    }
    return 'Market Intelligence Signal';
}

function extractSummary(article: AskNewsArticle): string {
    if (article.summary) return article.summary;
    if (article.key_points && article.key_points.length > 0) {
        return article.key_points.slice(0, 2).join(' ');
    }
    return '';
}

function extractSentiment(article: AskNewsArticle): number {
    if (typeof article.sentiment === 'number') {
        return article.sentiment;
    }
    if (Array.isArray(article.sentiment) && article.sentiment.length > 0) {
        return article.sentiment[0];
    }
    return 0;
}

function transformArticle(article: AskNewsArticle, index: number): TransformedStory {
    const headline = extractHeadline(article);
    const summary = extractSummary(article);
    const sentiment = extractSentiment(article);
    const categories = article.keywords && article.keywords.length > 0
        ? article.keywords.slice(0, 3)
        : [article.classification || 'CleanTech'];

    return {
        uuid: article.article_id || article.uuid || `news-item-${index}-${Date.now()}`,
        headline,
        summary,
        sentiment,
        coverage: 85,
        categories,
        publish_date: article.pub_date || new Date().toISOString()
    };
}

function resolveSearchQuery(categoryParam: string, queryParam: string | null): string {
    if (queryParam) return queryParam;
    const cat = categoryParam.toLowerCase();
    if (cat.includes('ai') || cat.includes('tech') || cat.includes('software')) {
        return 'artificial intelligence software agent verification';
    }
    return 'climate clean energy storage decarbonization';
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || 'Climate';
    const userQuery = searchParams.get('query');
    const searchQuery = resolveSearchQuery(category, userQuery);

    if (!ASKNEWS_API_KEY) {
        return NextResponse.json(
            { error: 'ASKNEWS_API_KEY is not configured on the server environment' },
            { status: 503 }
        );
    }

    try {
        const url = `https://api.asknews.app/v1/news/search?query=${encodeURIComponent(searchQuery)}&limit=10`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${ASKNEWS_API_KEY}`,
                'Accept': 'application/json'
            },
            signal: AbortSignal.timeout(10000)
        });

        if (!response.ok) {
            const errorDetails = await response.text();
            console.error('AskNews API responded with error status:', response.status, errorDetails);
            return NextResponse.json(
                { error: `AskNews service returned HTTP ${response.status}`, detail: errorDetails },
                { status: response.status }
            );
        }

        const payload = await response.json();
        const articles: AskNewsArticle[] = payload.as_dicts || [];
        const stories = articles.map((article, idx) => transformArticle(article, idx));

        return NextResponse.json({
            success: true,
            source: 'asknews',
            query: searchQuery,
            count: stories.length,
            stories
        });
    } catch (error: any) {
        console.error('AskNews search request failed:', error);
        return NextResponse.json(
            { error: 'AskNews news search request timed out or failed', detail: error.message },
            { status: 502 }
        );
    }
}
