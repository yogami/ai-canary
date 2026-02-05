import { NextResponse } from 'next/server';

const GITHUB_API = 'https://api.github.com/search/repositories';
const AI_TOPICS = 'topic:machine-learning OR topic:artificial-intelligence OR topic:llm OR topic:deep-learning OR topic:gpt OR topic:langchain OR topic:transformers';

interface GitHubRepo {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    html_url: string;
    stargazers_count: number;
    forks_count: number;
    language: string | null;
    created_at: string;
    updated_at: string;
    topics: string[];
}

export async function GET() {
    try {
        // Search for recently updated AI/ML repos with good star count
        const url = `${GITHUB_API}?q=topic:machine-learning+stars:>100&sort=stars&order=desc&per_page=15`;

        const res = await fetch(url, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'AICanary-HackathonProject'
            },
            cache: 'no-store' // Avoid caching issues
        });

        if (!res.ok) {
            // Rate limited or error
            if (res.status === 403) {
                return NextResponse.json({
                    error: 'GitHub API rate limited',
                    stories: [],
                    rateLimited: true
                }, { status: 429 });
            }
            return NextResponse.json({ error: 'Failed to fetch GitHub repos' }, { status: 500 });
        }

        const data = await res.json();
        const repos: GitHubRepo[] = data.items || [];

        const stories = repos.map(repo => ({
            id: `gh-${repo.id}`,
            headline: `${repo.full_name}: ${repo.description?.slice(0, 80) || 'No description'}`,
            summary: `⭐ ${repo.stargazers_count.toLocaleString()} | 🍴 ${repo.forks_count} | ${repo.language || 'Various'}`,
            url: repo.html_url,
            source: 'GitHub',
            sourceIcon: '🐙',
            sentiment: repo.stargazers_count > 10000 ? 'positive' : repo.stargazers_count > 1000 ? 'neutral' : 'negative',
            sentimentScore: Math.min(repo.stargazers_count / 50000, 1),
            coverage: Math.min(repo.forks_count / 5000, 1),
            publishedAt: repo.updated_at,
            entities: repo.topics.slice(0, 5)
        }));

        return NextResponse.json({
            stories,
            source: 'github',
            count: stories.length
        });

    } catch (error) {
        console.error('GitHub API error:', error);
        return NextResponse.json({
            error: 'Failed to fetch GitHub trending',
            stories: []
        }, { status: 500 });
    }
}
