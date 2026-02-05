import { NextResponse } from 'next/server';

interface AnalyzeRequest {
    url?: string;
    githubUrl?: string;
    content?: string;
}

// Extract keywords from text
function extractKeywords(text: string): string[] {
    const stopWords = new Set(['a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'for', 'and', 'nor', 'but', 'or', 'yet', 'so', 'in', 'on', 'at', 'to', 'from', 'with', 'about', 'as', 'by', 'of', 'that', 'this', 'it', 'its', 'our', 'we', 'they', 'them', 'their', 'my', 'your', 'i', 'you', 'he', 'she', 'not', 'no', 'can', 'all', 'just', 'more', 'also', 'than', 'very', 'too', 'any', 'each', 'which', 'when', 'where', 'how', 'what', 'who', 'whom', 'why']);

    const words = text.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.has(word));

    // Count word frequency
    const freq: Record<string, number> = {};
    words.forEach(word => {
        freq[word] = (freq[word] || 0) + 1;
    });

    // Return top keywords by frequency
    return Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([word]) => word);
}

// Fetch and parse a URL for metadata
async function analyzeUrl(url: string): Promise<{ title: string; description: string; keywords: string[] }> {
    try {
        const res = await fetch(url, {
            headers: { 'User-Agent': 'AICanary-Bot/1.0' }
        });

        if (!res.ok) {
            return { title: '', description: '', keywords: [] };
        }

        const html = await res.text();

        // Extract title
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : '';

        // Extract meta description
        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
            html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
        const description = descMatch ? descMatch[1].trim() : '';

        // Extract OG description as fallback
        const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
        const ogDescription = ogDescMatch ? ogDescMatch[1].trim() : '';

        const fullText = `${title} ${description || ogDescription}`;
        const keywords = extractKeywords(fullText);

        return { title, description: description || ogDescription, keywords };
    } catch (error) {
        console.error('URL analysis error:', error);
        return { title: '', description: '', keywords: [] };
    }
}

// Fetch GitHub repo README
async function analyzeGitHub(repoUrl: string): Promise<{ name: string; description: string; topics: string[]; readme: string; keywords: string[] }> {
    try {
        // Extract owner/repo from URL
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) {
            return { name: '', description: '', topics: [], readme: '', keywords: [] };
        }

        const [, owner, repo] = match;
        const cleanRepo = repo.replace(/\.git$/, '');

        // Fetch repo info
        const repoRes = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'AICanary-HackathonProject'
            }
        });

        if (!repoRes.ok) {
            return { name: '', description: '', topics: [], readme: '', keywords: [] };
        }

        const repoData = await repoRes.json();

        // Fetch README
        let readme = '';
        try {
            const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}/readme`, {
                headers: {
                    'Accept': 'application/vnd.github.v3.raw',
                    'User-Agent': 'AICanary-HackathonProject'
                }
            });
            if (readmeRes.ok) {
                readme = await readmeRes.text();
            }
        } catch {
            // README not found, continue without it
        }

        const fullText = `${repoData.name} ${repoData.description || ''} ${(repoData.topics || []).join(' ')} ${readme}`;
        const keywords = extractKeywords(fullText);

        return {
            name: repoData.name,
            description: repoData.description || '',
            topics: repoData.topics || [],
            readme: readme.slice(0, 1000), // First 1000 chars
            keywords
        };
    } catch (error) {
        console.error('GitHub analysis error:', error);
        return { name: '', description: '', topics: [], readme: '', keywords: [] };
    }
}

export async function POST(request: Request) {
    try {
        const body: AnalyzeRequest = await request.json();

        let result = {
            source: 'unknown',
            title: '',
            description: '',
            keywords: [] as string[],
            topics: [] as string[],
            readme: ''
        };

        if (body.githubUrl) {
            const ghData = await analyzeGitHub(body.githubUrl);
            result = {
                source: 'github',
                title: ghData.name,
                description: ghData.description,
                keywords: ghData.keywords,
                topics: ghData.topics,
                readme: ghData.readme
            };
        } else if (body.url) {
            const urlData = await analyzeUrl(body.url);
            result = {
                source: 'url',
                title: urlData.title,
                description: urlData.description,
                keywords: urlData.keywords,
                topics: [],
                readme: ''
            };
        } else if (body.content) {
            result = {
                source: 'content',
                title: 'Uploaded Content',
                description: body.content.slice(0, 200),
                keywords: extractKeywords(body.content),
                topics: [],
                readme: ''
            };
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error('Analyze API error:', error);
        return NextResponse.json({ error: 'Failed to analyze content' }, { status: 500 });
    }
}
