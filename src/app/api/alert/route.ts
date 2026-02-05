import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { story, channel } = body;

        // ActivePieces webhook URL - will be configured by user
        const webhookUrl = process.env.ACTIVEPIECES_WEBHOOK_URL;

        if (!webhookUrl) {
            // Demo mode: Simulate successful alert
            console.log('🚨 Alert triggered (Demo Mode):', {
                headline: story?.headline,
                channel,
                timestamp: new Date().toISOString(),
            });

            // Return success for demo purposes
            return NextResponse.json({
                success: true,
                mode: 'demo',
                message: `Alert queued for: "${story?.headline?.slice(0, 30)}..."`,
                channel: channel || 'slack',
            });
        }

        // Send to ActivePieces webhook
        const webhookResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'ai_canary_alert',
                story: {
                    headline: story?.headline,
                    summary: story?.summary,
                    sentiment: story?.sentiment,
                    coverage: story?.coverage,
                    url: story?.url,
                },
                channel,
                triggered_at: new Date().toISOString(),
            }),
        });

        if (!webhookResponse.ok) {
            // Handle rate limiting (429)
            if (webhookResponse.status === 429) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Too many alerts. Please wait before sending more.',
                        retryAfter: webhookResponse.headers.get('Retry-After') || '60'
                    },
                    { status: 429 }
                );
            }
            throw new Error(`Webhook failed: ${webhookResponse.status}`);
        }

        return NextResponse.json({
            success: true,
            mode: 'live',
            message: `Alert sent to ${channel}`,
        });

    } catch (error) {
        console.error('Alert API Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to send alert' },
            { status: 500 }
        );
    }
}
