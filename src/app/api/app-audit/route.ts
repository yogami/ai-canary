import { NextRequest, NextResponse } from 'next/server';

// App Audit API - Automated validation of apps via URL
// FEATURE FLAG: Only accessible when ?audit=true is passed
// Combines: UX analysis, Performance metrics, Business context validation

interface AppAuditResult {
    overallScore: number; // 0-100
    grade: 'A' | 'B' | 'C' | 'D' | 'F';

    uxAnalysis: {
        score: number;
        mobileReady: boolean;
        accessibilityIssues: string[];
        usabilityNotes: string[];
    };

    performanceAnalysis: {
        score: number;
        loadTime: string;
        issues: string[];
        recommendations: string[];
    };

    businessAnalysis: {
        score: number;
        problemFit: string;
        targetAudienceClarity: string;
        valuePropositionStrength: string;
        competitiveGaps: string[];
        recommendations: string[];
    };

    summary: string;
    topPriorities: string[];
}

// Fetch basic metadata from URL
async function fetchUrlMetadata(url: string): Promise<{ title: string; description: string; html: string } | null> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; AICanary/1.0; +https://ai-canary-production.up.railway.app)'
            }
        });
        clearTimeout(timeoutId);

        if (!response.ok) return null;

        const html = await response.text();

        // Extract title
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : '';

        // Extract meta description
        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
            html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
        const description = descMatch ? descMatch[1].trim() : '';

        return { title, description, html: html.slice(0, 5000) }; // Limit HTML for LLM
    } catch {
        return null;
    }
}

// Check basic performance indicators
async function checkPerformance(url: string): Promise<AppAuditResult['performanceAnalysis']> {
    const startTime = Date.now();
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(url, {
            signal: controller.signal,
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AICanary/1.0)' }
        });
        clearTimeout(timeoutId);

        const loadTime = Date.now() - startTime;
        const html = await response.text();

        // Basic performance checks
        if (loadTime > 3000) {
            issues.push(`Slow initial response: ${loadTime}ms (target: <3000ms)`);
            recommendations.push('Consider CDN or edge caching');
        }

        if (html.length > 500000) {
            issues.push('Large HTML payload (>500KB)');
            recommendations.push('Optimize HTML, defer non-critical resources');
        }

        // Check for common performance patterns
        if (!html.includes('async') && !html.includes('defer')) {
            issues.push('No async/defer scripts detected');
            recommendations.push('Use async/defer for JavaScript loading');
        }

        if (!html.includes('loading="lazy"') && !html.includes('loading=\'lazy\'')) {
            issues.push('No lazy loading detected for images');
            recommendations.push('Add loading="lazy" to below-fold images');
        }

        // Calculate score
        let score = 100;
        score -= issues.length * 15;
        if (loadTime > 5000) score -= 20;
        else if (loadTime > 3000) score -= 10;

        return {
            score: Math.max(0, Math.min(100, score)),
            loadTime: `${loadTime}ms`,
            issues,
            recommendations
        };
    } catch (error) {
        return {
            score: 0,
            loadTime: 'Failed to load',
            issues: ['Site failed to respond within timeout'],
            recommendations: ['Check server availability and performance']
        };
    }
}

// Analyze UX from HTML
function analyzeUX(html: string): AppAuditResult['uxAnalysis'] {
    const issues: string[] = [];
    const notes: string[] = [];
    let score = 100;

    // Mobile viewport check
    const mobileReady = html.includes('viewport') && html.includes('width=device-width');
    if (!mobileReady) {
        issues.push('Missing mobile viewport meta tag');
        score -= 20;
    }

    // Accessibility checks
    if (!html.includes('alt=')) {
        issues.push('Images may be missing alt text');
        score -= 10;
    }

    if (!html.includes('aria-')) {
        issues.push('Limited ARIA accessibility attributes');
        score -= 10;
    }

    if (!html.includes('<label')) {
        issues.push('Form labels may be missing');
        score -= 5;
    }

    // UX observations
    if (html.includes('loading') || html.includes('spinner')) {
        notes.push('Loading indicators present (good UX)');
    }

    if (html.includes('error') || html.includes('Error')) {
        notes.push('Error handling appears implemented');
    }

    if (html.includes('btn') || html.includes('button')) {
        notes.push('Clear button/CTA patterns detected');
    }

    return {
        score: Math.max(0, Math.min(100, score)),
        mobileReady,
        accessibilityIssues: issues,
        usabilityNotes: notes
    };
}

// Use LLM for business context analysis
async function analyzeBusinessContext(
    url: string,
    title: string,
    description: string,
    problemStatement: string
): Promise<AppAuditResult['businessAnalysis']> {
    try {
        // Use Groq for fast analysis
        const groqApiKey = process.env.GROQ_API_KEY;
        if (!groqApiKey) {
            return {
                score: 50,
                problemFit: 'Unable to analyze - API key missing',
                targetAudienceClarity: 'Unknown',
                valuePropositionStrength: 'Unknown',
                competitiveGaps: [],
                recommendations: ['Configure GROQ_API_KEY for business analysis']
            };
        }

        const prompt = `Analyze this app/website for business viability:

URL: ${url}
Title: ${title}
Description: ${description}
Problem Being Solved: ${problemStatement}

Provide a JSON response with:
{
  "problemFit": "How well does this app solve the stated problem? (1-2 sentences)",
  "targetAudienceClarity": "How clear is the target audience? (1 sentence)",  
  "valuePropositionStrength": "How compelling is the value proposition? (1 sentence)",
  "competitiveGaps": ["List 2-3 potential gaps vs competitors"],
  "recommendations": ["List 2-3 business recommendations"],
  "score": 0-100
}`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${groqApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: 'You are a startup analyst. Respond only with valid JSON.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.3,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            throw new Error('LLM API failed');
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';

        // Parse JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON in response');

        const analysis = JSON.parse(jsonMatch[0]);

        return {
            score: analysis.score || 50,
            problemFit: analysis.problemFit || 'Analysis unavailable',
            targetAudienceClarity: analysis.targetAudienceClarity || 'Unknown',
            valuePropositionStrength: analysis.valuePropositionStrength || 'Unknown',
            competitiveGaps: analysis.competitiveGaps || [],
            recommendations: analysis.recommendations || []
        };
    } catch (error) {
        console.error('Business analysis error:', error);
        return {
            score: 50,
            problemFit: 'Analysis failed - try again',
            targetAudienceClarity: 'Unknown',
            valuePropositionStrength: 'Unknown',
            competitiveGaps: [],
            recommendations: []
        };
    }
}

export async function POST(request: NextRequest) {
    // App Audit is now LIVE - no feature flag required

    try {
        const body = await request.json();
        const { url, problemStatement } = body;

        if (!url) {
            return NextResponse.json(
                { error: 'URL is required' },
                { status: 400 }
            );
        }

        // Ensure URL has protocol
        const fullUrl = url.startsWith('http') ? url : `https://${url}`;

        // Run all analyses in parallel
        const [metadata, performance] = await Promise.all([
            fetchUrlMetadata(fullUrl),
            checkPerformance(fullUrl)
        ]);

        if (!metadata) {
            return NextResponse.json(
                { error: 'Could not fetch URL. Please check the URL and try again.' },
                { status: 400 }
            );
        }

        // UX analysis from HTML
        const uxAnalysis = analyzeUX(metadata.html);

        // Business context analysis
        const businessAnalysis = await analyzeBusinessContext(
            fullUrl,
            metadata.title,
            metadata.description,
            problemStatement || 'Not specified'
        );

        // Calculate overall score
        const overallScore = Math.round(
            (uxAnalysis.score * 0.3) +
            (performance.score * 0.3) +
            (businessAnalysis.score * 0.4)
        );

        // Determine grade
        let grade: AppAuditResult['grade'];
        if (overallScore >= 80) grade = 'A';
        else if (overallScore >= 60) grade = 'B';
        else if (overallScore >= 40) grade = 'C';
        else if (overallScore >= 20) grade = 'D';
        else grade = 'F';

        // Generate summary and priorities
        const topPriorities: string[] = [];
        if (performance.score < 60) topPriorities.push('🚨 Fix performance issues');
        if (!uxAnalysis.mobileReady) topPriorities.push('📱 Add mobile viewport support');
        if (uxAnalysis.accessibilityIssues.length > 2) topPriorities.push('♿ Improve accessibility');
        if (businessAnalysis.score < 50) topPriorities.push('💼 Clarify value proposition');

        const result: AppAuditResult = {
            overallScore,
            grade,
            uxAnalysis,
            performanceAnalysis: performance,
            businessAnalysis,
            summary: `${metadata.title || fullUrl} scored ${overallScore}/100 (Grade ${grade}). ${overallScore >= 60 ? 'Good foundation with room for improvement.' : 'Needs significant work before launch.'
                }`,
            topPriorities: topPriorities.slice(0, 4)
        };

        return NextResponse.json(result);

    } catch (error) {
        console.error('App Audit error:', error);
        return NextResponse.json(
            { error: 'Audit failed. Please try again.' },
            { status: 500 }
        );
    }
}
