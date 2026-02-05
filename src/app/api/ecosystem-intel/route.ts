import { NextRequest, NextResponse } from 'next/server';

// GitHub Ecosystem Intelligence API
// Provides MARKET intelligence, not code quality analysis
// - Competitive landscape: similar repos, top competitors
// - Market timing: is this space emerging, growing, or saturated?
// - Ecosystem health: community momentum and trends

interface EcosystemResult {
    searchQuery: string;
    totalRepos: number;
    marketSignal: 'EMERGING' | 'GROWING' | 'HOT' | 'SATURATED' | 'DECLINING';

    competitors: {
        name: string;
        fullName: string;
        stars: number;
        forks: number;
        description: string;
        url: string;
        language: string;
        updatedAt: string;
        createdAt: string;
    }[];

    timing: {
        reposLastMonth: number;
        reposLastYear: number;
        growthRate: string;
        verdict: string;
    };

    techStack: {
        language: string;
        count: number;
    }[];

    insights: string[];
    opportunities: string[];
}

// Extract keywords from description for search
function extractKeywords(description: string): string {
    // Remove common words and extract meaningful terms
    const stopWords = new Set(['a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been',
        'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
        'for', 'to', 'of', 'in', 'on', 'at', 'by', 'with', 'about', 'into', 'through',
        'and', 'or', 'but', 'so', 'yet', 'that', 'this', 'these', 'those', 'i', 'we', 'you',
        'my', 'our', 'your', 'app', 'application', 'tool', 'platform', 'solution', 'system']);

    const words = description.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.has(word));

    // Take top keywords, prioritizing tech terms
    const techTerms = ['ai', 'ml', 'api', 'saas', 'web', 'mobile', 'cloud', 'data',
        'analytics', 'automation', 'blockchain', 'crypto', 'llm', 'gpt', 'chat',
        'workflow', 'dashboard', 'iot', 'devops', 'cicd'];

    const prioritized = words.sort((a, b) => {
        const aIsTech = techTerms.includes(a) ? 1 : 0;
        const bIsTech = techTerms.includes(b) ? 1 : 0;
        return bIsTech - aIsTech;
    });

    return prioritized.slice(0, 5).join(' ');
}

// Search GitHub for similar repos
async function searchGitHub(query: string, token?: string): Promise<{
    items: Array<{
        name: string;
        full_name: string;
        stargazers_count: number;
        forks_count: number;
        description: string;
        html_url: string;
        language: string;
        updated_at: string;
        created_at: string;
    }>;
    total_count: number;
}> {
    const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'AICanary-EcosystemIntel/1.0'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const searchUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=30`;

    const response = await fetch(searchUrl, { headers });

    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
    }

    return response.json();
}

// Search for recent repos (last month)
async function searchRecentRepos(query: string, token?: string): Promise<number> {
    const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'AICanary-EcosystemIntel/1.0'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Get date from 30 days ago
    const lastMonth = new Date();
    lastMonth.setDate(lastMonth.getDate() - 30);
    const dateStr = lastMonth.toISOString().split('T')[0];

    const searchUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}+created:>${dateStr}&per_page=1`;

    try {
        const response = await fetch(searchUrl, { headers });
        if (!response.ok) return 0;
        const data = await response.json();
        return data.total_count || 0;
    } catch {
        return 0;
    }
}

// Determine market signal based on data
function determineMarketSignal(totalRepos: number, reposLastMonth: number, avgStars: number): EcosystemResult['marketSignal'] {
    const monthlyGrowthRate = totalRepos > 0 ? (reposLastMonth / totalRepos) * 100 : 0;

    if (totalRepos < 50) {
        return 'EMERGING';
    } else if (totalRepos < 200 && monthlyGrowthRate > 5) {
        return 'GROWING';
    } else if (totalRepos < 500 && monthlyGrowthRate > 10) {
        return 'HOT';
    } else if (totalRepos > 500 && monthlyGrowthRate < 2) {
        return 'DECLINING';
    } else if (totalRepos > 300) {
        return 'SATURATED';
    } else {
        return 'GROWING';
    }
}

// Generate insights based on analysis
function generateInsights(
    marketSignal: EcosystemResult['marketSignal'],
    totalRepos: number,
    topCompetitors: EcosystemResult['competitors'],
    reposLastMonth: number
): string[] {
    const insights: string[] = [];

    // Market size insight
    if (totalRepos < 50) {
        insights.push(`🔭 Niche market with only ${totalRepos} similar projects - early mover advantage possible`);
    } else if (totalRepos > 500) {
        insights.push(`⚠️ Crowded market with ${totalRepos}+ similar repos - differentiation critical`);
    } else {
        insights.push(`📊 Active market with ${totalRepos} similar projects - healthy competition`);
    }

    // Competition insight
    if (topCompetitors.length > 0) {
        const leader = topCompetitors[0];
        if (leader.stars > 10000) {
            insights.push(`🏆 Dominant player exists: ${leader.name} (${(leader.stars / 1000).toFixed(1)}K ⭐) - hard to compete directly`);
        } else if (leader.stars < 1000) {
            insights.push(`💡 No clear market leader yet - top project has only ${leader.stars} stars`);
        }
    }

    // Momentum insight
    if (reposLastMonth > 20) {
        insights.push(`🔥 High momentum: ${reposLastMonth} new repos this month - trending topic`);
    } else if (reposLastMonth < 5) {
        insights.push(`❄️ Low activity: only ${reposLastMonth} new repos this month - cooling interest?`);
    }

    // Market signal insight
    if (marketSignal === 'EMERGING') {
        insights.push(`🚀 Emerging market - great timing for first movers`);
    } else if (marketSignal === 'SATURATED') {
        insights.push(`🎯 Saturated market - focus on underserved niches`);
    }

    return insights;
}

// Generate opportunity suggestions
function generateOpportunities(
    topCompetitors: EcosystemResult['competitors'],
    marketSignal: EcosystemResult['marketSignal']
): string[] {
    const opportunities: string[] = [];

    if (marketSignal === 'SATURATED' || marketSignal === 'HOT') {
        opportunities.push('Focus on a specific vertical/industry');
        opportunities.push('Target underserved user segment (enterprise, indie, etc.)');
    }

    if (marketSignal === 'EMERGING') {
        opportunities.push('Establish thought leadership early');
        opportunities.push('Build community before competition arrives');
    }

    // Check for gaps in competitor offerings
    const hasNoEnterprise = topCompetitors.every(c =>
        !c.description?.toLowerCase().includes('enterprise'));
    if (hasNoEnterprise) {
        opportunities.push('Enterprise-grade features (SSO, audit logs, compliance)');
    }

    const hasNoOffline = topCompetitors.every(c =>
        !c.description?.toLowerCase().includes('offline'));
    if (hasNoOffline) {
        opportunities.push('Offline-first or local-first approach');
    }

    const hasNoSelfHosted = topCompetitors.every(c =>
        !c.description?.toLowerCase().includes('self-host'));
    if (hasNoSelfHosted) {
        opportunities.push('Self-hosted/on-premise deployment option');
    }

    return opportunities.slice(0, 4);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { description, repoUrl } = body;

        if (!description && !repoUrl) {
            return NextResponse.json(
                { error: 'Description or repo URL is required' },
                { status: 400 }
            );
        }

        // Extract search query from description
        let searchQuery = description ? extractKeywords(description) : '';

        // If repo URL provided, try to extract more context
        if (repoUrl && !searchQuery) {
            // Extract repo name as fallback
            const match = repoUrl.match(/github\.com\/[^/]+\/([^/]+)/);
            if (match) {
                searchQuery = match[1].replace(/-/g, ' ');
            }
        }

        if (!searchQuery) {
            return NextResponse.json(
                { error: 'Could not extract search terms from input' },
                { status: 400 }
            );
        }

        const githubToken = process.env.GITHUB_TOKEN;

        // Search GitHub for similar repos
        const [mainSearch, reposLastMonth] = await Promise.all([
            searchGitHub(searchQuery, githubToken),
            searchRecentRepos(searchQuery, githubToken)
        ]);

        const totalRepos = mainSearch.total_count;
        const items = mainSearch.items || [];

        // Extract competitors
        const competitors: EcosystemResult['competitors'] = items.slice(0, 10).map(item => ({
            name: item.name,
            fullName: item.full_name,
            stars: item.stargazers_count,
            forks: item.forks_count,
            description: item.description || '',
            url: item.html_url,
            language: item.language || 'Unknown',
            updatedAt: item.updated_at,
            createdAt: item.created_at
        }));

        // Calculate tech stack distribution
        const languageCounts: Record<string, number> = {};
        items.forEach(item => {
            if (item.language) {
                languageCounts[item.language] = (languageCounts[item.language] || 0) + 1;
            }
        });

        const techStack = Object.entries(languageCounts)
            .map(([language, count]) => ({ language, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Calculate average stars
        const avgStars = items.length > 0
            ? items.reduce((sum, item) => sum + item.stargazers_count, 0) / items.length
            : 0;

        // Determine market signal
        const marketSignal = determineMarketSignal(totalRepos, reposLastMonth, avgStars);

        // Calculate growth rate
        const reposLastYear = totalRepos; // Approximation
        const growthRate = reposLastMonth > 0
            ? `${((reposLastMonth * 12 / Math.max(reposLastYear, 1)) * 100).toFixed(0)}% YoY`
            : 'N/A';

        // Generate timing verdict
        let timingVerdict = '';
        if (marketSignal === 'EMERGING') {
            timingVerdict = '🟢 Great timing - early mover advantage available';
        } else if (marketSignal === 'GROWING') {
            timingVerdict = '🟡 Good timing - market is growing, competition increasing';
        } else if (marketSignal === 'HOT') {
            timingVerdict = '🟠 Competitive - need strong differentiation to stand out';
        } else if (marketSignal === 'SATURATED') {
            timingVerdict = '🔴 Late entry - focus on underserved niches';
        } else {
            timingVerdict = '⚪ Declining interest - consider pivoting or niching down';
        }

        // Generate insights and opportunities
        const insights = generateInsights(marketSignal, totalRepos, competitors, reposLastMonth);
        const opportunities = generateOpportunities(competitors, marketSignal);

        const result: EcosystemResult = {
            searchQuery,
            totalRepos,
            marketSignal,
            competitors,
            timing: {
                reposLastMonth,
                reposLastYear: totalRepos,
                growthRate,
                verdict: timingVerdict
            },
            techStack,
            insights,
            opportunities
        };

        return NextResponse.json(result);

    } catch (error) {
        console.error('Ecosystem Intelligence error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze ecosystem. Please try again.' },
            { status: 500 }
        );
    }
}
