import { NextResponse } from 'next/server';
import { BenchmarkService } from '@/services/kernel/BenchmarkService';

export async function GET() {
    try {
        const service = new BenchmarkService();
        const corpus = service.getHistoricalCorpus();
        const metrics = service.getComparativeMetrics();

        return NextResponse.json({ corpus, metrics });
    } catch (err: any) {
        return NextResponse.json(
            { error: 'Failed to retrieve benchmark metrics', detail: err.message },
            { status: 500 }
        );
    }
}
