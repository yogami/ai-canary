import { DiligenceRegime } from '../../domain/diligence-regime';
import { BenchmarkMetric } from '../../domain/kernel/admission-types';
import { HistoricalCase, HISTORICAL_CORPUS } from '../../domain/kernel/historical-corpus';
import { RegimeExecutionService } from './RegimeExecutionService';

export type { HistoricalCase };

interface CaseEvaluation {
    isCorrect: boolean;
    isFalsePositive: boolean;
    isFalseNegative: boolean;
    isContradictionLeaked: boolean;
}

const TRACK_NAMES: Record<DiligenceRegime, string> = {
    [DiligenceRegime.RAW_MODEL]: 'Track A: Raw Frontier Model',
    [DiligenceRegime.TOOL_RETRIEVAL]: 'Track B: Unfiltered Context RAG',
    [DiligenceRegime.MEMORY_QUARANTINE]: 'Track C-Lite: Memory Quarantine',
    [DiligenceRegime.FULL_DILIGENCE_GATE]: 'Track C: Full Agent Kernel'
};

export class BenchmarkService {
    private readonly regimeService: RegimeExecutionService;

    constructor() {
        this.regimeService = new RegimeExecutionService();
    }

    public getHistoricalCorpus(): HistoricalCase[] {
        return HISTORICAL_CORPUS;
    }

    public evaluateCorpusAgainstRegime(regime: DiligenceRegime): BenchmarkMetric {
        const track = TRACK_NAMES[regime];
        const startTime = Date.now();
        let correct = 0;
        let fp = 0;
        let fn = 0;
        let leaked = 0;

        for (const item of HISTORICAL_CORPUS) {
            const ev = this.evaluateCase(item, regime);
            if (ev.isCorrect) correct++;
            if (ev.isFalsePositive) fp++;
            if (ev.isFalseNegative) fn++;
            if (ev.isContradictionLeaked) leaked++;
        }

        return this.buildMetric(track, correct, fp, fn, leaked, startTime);
    }

    public getComparativeMetrics(): BenchmarkMetric[] {
        return [
            this.evaluateCorpusAgainstRegime(DiligenceRegime.RAW_MODEL),
            this.evaluateCorpusAgainstRegime(DiligenceRegime.TOOL_RETRIEVAL),
            this.evaluateCorpusAgainstRegime(DiligenceRegime.FULL_DILIGENCE_GATE)
        ];
    }

    private evaluateCase(item: HistoricalCase, regime: DiligenceRegime): CaseEvaluation {
        const res = this.regimeService.executeRegime(regime, item.pitch, item.sector, []);
        const isPredictedSolvent = res.canaryScore.grade !== 'F' && res.canaryScore.total >= 600;
        const isCorrect = isPredictedSolvent === item.expectedSolvent;
        const isFalsePositive = isPredictedSolvent && !item.expectedSolvent;
        const isFalseNegative = !isPredictedSolvent && item.expectedSolvent;
        const isContradictionLeaked = !item.expectedSolvent && res.quarantine.quarantinedAssertions.length === 0;

        return { isCorrect, isFalsePositive, isFalseNegative, isContradictionLeaked };
    }

    private buildMetric(
        track: string,
        correct: number,
        fp: number,
        fn: number,
        leaked: number,
        start: number
    ): BenchmarkMetric {
        const total = HISTORICAL_CORPUS.length;
        const totalNeg = HISTORICAL_CORPUS.filter((c) => !c.expectedSolvent).length;
        const totalPos = HISTORICAL_CORPUS.filter((c) => c.expectedSolvent).length;
        const elapsed = Math.max(12, Date.now() - start);

        return {
            track,
            sampleCount: total,
            accuracy: Math.round((correct / total) * 100) / 100,
            falsePositiveRate: totalNeg > 0 ? Math.round((fp / totalNeg) * 100) / 100 : 0,
            falseNegativeRate: totalPos > 0 ? Math.round((fn / totalPos) * 100) / 100 : 0,
            contradictionLeakageRate: totalNeg > 0 ? Math.round((leaked / totalNeg) * 100) / 100 : 0,
            meanLatencyMs: Math.round(elapsed / total)
        };
    }
}
