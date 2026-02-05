import { NextRequest, NextResponse } from 'next/server';

// Death Watch API - Aggregates failure signals for startups
// Unique moat: Nobody else tracks these "death signals" together

interface DeathWatchResult {
    dangerScore: number; // 0-100, higher = more danger
    dangerLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    signals: {
        domainHealth: {
            score: number;
            expiresIn?: string;
            status: 'healthy' | 'warning' | 'critical' | 'unknown';
            details: string;
        };
        githubVelocity: {
            score: number;
            commitsLastMonth: number;
            trend: 'accelerating' | 'stable' | 'slowing' | 'stalled' | 'unknown';
            details: string;
        };
        sslStatus: {
            score: number;
            validUntil?: string;
            status: 'valid' | 'expiring' | 'expired' | 'unknown';
            details: string;
        };
    };
    trajectory: string;
    recommendation: string;
}

// Check domain health via WHOIS-like lookup
async function checkDomainHealth(domain: string): Promise<DeathWatchResult['signals']['domainHealth']> {
    try {
        // Use a free WHOIS API or DNS check
        const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');

        // Try DNS resolution as a basic health check
        const response = await fetch(`https://dns.google/resolve?name=${cleanDomain}&type=A`, {
            headers: { 'Accept': 'application/dns-json' }
        });

        if (!response.ok) {
            return { score: 50, status: 'unknown', details: 'Could not verify domain status' };
        }

        const data = await response.json();

        if (data.Status === 0 && data.Answer && data.Answer.length > 0) {
            return {
                score: 100,
                status: 'healthy',
                details: `Domain resolves correctly to ${data.Answer[0].data}`
            };
        } else if (data.Status === 3) {
            // NXDOMAIN - domain doesn't exist
            return {
                score: 0,
                status: 'critical',
                details: '🚨 Domain does not exist - possible expiration or misconfiguration'
            };
        } else {
            return {
                score: 30,
                status: 'warning',
                details: 'Domain DNS issues detected'
            };
        }
    } catch {
        return { score: 50, status: 'unknown', details: 'Could not check domain health' };
    }
}

// Check GitHub repository velocity
async function checkGitHubVelocity(repoUrl: string): Promise<DeathWatchResult['signals']['githubVelocity']> {
    try {
        // Extract owner/repo from URL
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) {
            return { score: 50, commitsLastMonth: 0, trend: 'unknown', details: 'Invalid GitHub URL' };
        }

        const [, owner, repo] = match;
        const cleanRepo = repo.replace(/\.git$/, '');

        // Fetch commit activity from GitHub API (no auth required for public repos)
        const response = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}/stats/commit_activity`, {
            headers: { 'Accept': 'application/vnd.github.v3+json' }
        });

        if (!response.ok) {
            if (response.status === 404) {
                return { score: 0, commitsLastMonth: 0, trend: 'stalled', details: '🚨 Repository not found or private' };
            }
            return { score: 50, commitsLastMonth: 0, trend: 'unknown', details: 'Could not fetch GitHub data' };
        }

        const weeklyData = await response.json();

        if (!Array.isArray(weeklyData) || weeklyData.length === 0) {
            return { score: 50, commitsLastMonth: 0, trend: 'unknown', details: 'No commit data available yet' };
        }

        // Get last 4 weeks of commits
        const last4Weeks = weeklyData.slice(-4);
        const commitsLastMonth = last4Weeks.reduce((sum: number, week: { total: number }) => sum + week.total, 0);

        // Get previous 4 weeks for trend
        const prev4Weeks = weeklyData.slice(-8, -4);
        const commitsPrevMonth = prev4Weeks.reduce((sum: number, week: { total: number }) => sum + week.total, 0);

        // Determine trend
        let trend: 'accelerating' | 'stable' | 'slowing' | 'stalled';
        let score: number;

        if (commitsLastMonth === 0) {
            trend = 'stalled';
            score = 10;
        } else if (commitsLastMonth > commitsPrevMonth * 1.5) {
            trend = 'accelerating';
            score = 100;
        } else if (commitsLastMonth > commitsPrevMonth * 0.7) {
            trend = 'stable';
            score = 75;
        } else {
            trend = 'slowing';
            score = 40;
        }

        const details = `${commitsLastMonth} commits last month (${trend === 'accelerating' ? '📈 up' : trend === 'slowing' ? '📉 down' : '➡️ stable'} from ${commitsPrevMonth})`;

        return { score, commitsLastMonth, trend, details };
    } catch {
        return { score: 50, commitsLastMonth: 0, trend: 'unknown', details: 'Could not check GitHub velocity' };
    }
}

// Check SSL certificate status
async function checkSSLStatus(domain: string): Promise<DeathWatchResult['signals']['sslStatus']> {
    try {
        const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');

        // Try to fetch the site with HTTPS to verify SSL works
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
            const response = await fetch(`https://${cleanDomain}`, {
                method: 'HEAD',
                signal: controller.signal,
                redirect: 'follow'
            });
            clearTimeout(timeoutId);

            if (response.ok || response.status < 500) {
                return {
                    score: 100,
                    status: 'valid',
                    details: 'SSL certificate is valid and working'
                };
            } else {
                return {
                    score: 50,
                    status: 'unknown',
                    details: 'Site returned server error'
                };
            }
        } catch (fetchError) {
            clearTimeout(timeoutId);
            const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown error';
            if (errorMessage.includes('certificate') || errorMessage.includes('SSL') || errorMessage.includes('CERT')) {
                return {
                    score: 0,
                    status: 'expired',
                    details: '🚨 SSL certificate error - may be expired or invalid'
                };
            }
            return {
                score: 70,
                status: 'unknown',
                details: 'Could not verify SSL (site may be down or blocking requests)'
            };
        }
    } catch {
        return { score: 50, status: 'unknown', details: 'Could not check SSL status' };
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { domain, githubUrl } = body;

        if (!domain && !githubUrl) {
            return NextResponse.json(
                { error: 'At least one of domain or githubUrl is required' },
                { status: 400 }
            );
        }

        // Run all checks in parallel
        const [domainHealth, githubVelocity, sslStatus] = await Promise.all([
            domain ? checkDomainHealth(domain) : Promise.resolve({ score: 50, status: 'unknown' as const, details: 'No domain provided' }),
            githubUrl ? checkGitHubVelocity(githubUrl) : Promise.resolve({ score: 50, commitsLastMonth: 0, trend: 'unknown' as const, details: 'No GitHub URL provided' }),
            domain ? checkSSLStatus(domain) : Promise.resolve({ score: 50, status: 'unknown' as const, details: 'No domain provided' })
        ]);

        // Calculate overall danger score (0-100, higher = more danger)
        // Invert the scores since higher health = lower danger
        const avgHealthScore = (domainHealth.score + githubVelocity.score + sslStatus.score) / 3;
        const dangerScore = Math.round(100 - avgHealthScore);

        // Determine danger level
        let dangerLevel: DeathWatchResult['dangerLevel'];
        if (dangerScore < 25) dangerLevel = 'LOW';
        else if (dangerScore < 50) dangerLevel = 'MEDIUM';
        else if (dangerScore < 75) dangerLevel = 'HIGH';
        else dangerLevel = 'CRITICAL';

        // Generate trajectory and recommendation
        let trajectory: string;
        let recommendation: string;

        if (dangerScore < 25) {
            trajectory = '📈 Healthy trajectory - all signals positive';
            recommendation = 'No immediate concerns detected. Continue monitoring.';
        } else if (dangerScore < 50) {
            trajectory = '➡️ Stable but watch closely';
            recommendation = 'Some warning signs. Monitor development activity and domain status.';
        } else if (dangerScore < 75) {
            trajectory = '📉 Concerning decline detected';
            recommendation = 'Multiple warning signals. Verify if this startup is still actively operating.';
        } else {
            trajectory = '🚨 Critical - multiple death signals';
            recommendation = 'High probability of failure or already defunct. Proceed with extreme caution.';
        }

        const result: DeathWatchResult = {
            dangerScore,
            dangerLevel,
            signals: {
                domainHealth,
                githubVelocity,
                sslStatus
            },
            trajectory,
            recommendation
        };

        return NextResponse.json(result);

    } catch (error) {
        console.error('Death Watch API error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze death signals' },
            { status: 500 }
        );
    }
}
