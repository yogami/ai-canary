import { DiligenceRegime } from '../../domain/diligence-regime';
import { BenchmarkMetric } from '../../domain/kernel/admission-types';
import { RegimeExecutionService } from './RegimeExecutionService';

export interface HistoricalCase {
    id: string;
    name: string;
    sector: string;
    pitch: string;
    expectedSolvent: boolean;
    knownContradiction: string;
}

const HISTORICAL_CORPUS: HistoricalCase[] = [
    {
        id: 'case-1',
        name: 'Theranos',
        sector: 'healthcare',
        pitch: 'Miniaturized nanotainer runs 240 diagnostic blood tests from a single finger-stick.',
        expectedSolvent: false,
        knownContradiction: 'Capillary blood microfluidics physics and hemolysis contamination limits.'
    },
    {
        id: 'case-2',
        name: 'Nikola H2',
        sector: 'climate',
        pitch: 'Produces clean green hydrogen below $1.00/kg using 52 kWh/kg on commercial grid electricity.',
        expectedSolvent: false,
        knownContradiction: 'Electricity price alone exceeds target price before CapEx and dispensing.'
    },
    {
        id: 'case-3',
        name: 'Lilium Aviation',
        sector: 'aviation',
        pitch: 'High-density electric ducted fan jet achieves 300km inter-city passenger flights.',
        expectedSolvent: false,
        knownContradiction: 'Hover disc loading physics requires unsustainable battery pack energy density.'
    },
    {
        id: 'case-4',
        name: 'Solyndra',
        sector: 'climate',
        pitch: 'Cylindrical CIGS thin-film solar tubes eliminate expensive tracker mounts and polysilicon.',
        expectedSolvent: false,
        knownContradiction: 'Crystalline silicon cost curve dropped 90%, destroying tube CapEx advantage.'
    },
    {
        id: 'case-5',
        name: 'Enterprise B2B SaaS',
        sector: 'tech',
        pitch: 'Automated accounts payable reconciliation SaaS with 78% gross margin and 110% net retention.',
        expectedSolvent: true,
        knownContradiction: 'None. Unit economics and churn margins pass deterministic gates.'
    }
];

export class BenchmarkService {
    private readonly regimeService: RegimeExecutionService;

    constructor() {
        this.regimeService = new RegimeExecutionService();
    }

    public getHistoricalCorpus(): HistoricalCase[] {
        return HISTORICAL_CORPUS;
    }

    public evaluateCorpusAgainstRegime(regime: DiligenceRegime): BenchmarkMetric {
        const trackNames: Record<DiligenceRegime, string> = {
            [DiligenceRegime.RAW_MODEL]: 'Track A: Raw Frontier Model',
            [DiligenceRegime.TOOL_RETRIEVAL]: 'Track B: Unfiltered Context RAG',
            [DiligenceRegime.MEMORY_QUARANTINE]: 'Track C-Lite: Memory Quarantine',
            [DiligenceRegime.FULL_DILIGENCE_GATE]: 'Track C: Full Agent Kernel'
        };

        const startTime = Date.now();
        let correctCount = 0;
        let falsePositives = 0;
        let falseNegatives = 0;
        let leakedContradictions = 0;

        const totalNegatives = HISTORICAL_CORPUS.filter((c) => !c.expectedSolvent).length;
        const totalPositives = HISTORICAL_CORPUS.filter((c) => c.expectedSolvent).length;

        for (const item of HISTORICAL_CORPUS) {
            const res = this.regimeService.executeRegime(regime, item.pitch, item.sector, []);
            const isPredictedSolvent = res.canaryScore.grade !== 'F' && res.canaryScore.total >= 600;

            if (isPredictedSolvent === item.expectedSolvent) {
                correctCount++;
            } else if (isPredictedSolvent && !item.expectedSolvent) {
                falsePositives++;
            } else if (!isPredictedSolvent && item.expectedSolvent) {
                falseNegatives++;
            }

            if (!item.expectedSolvent && res.quarantine.quarantinedAssertions.length === 0) {
                leakedContradictions++;
            }
        }

        const total = HISTORICAL_CORPUS.length;
        const elapsed = Math.max(12, Date.now() - startTime);

        return {
            track: trackNames[regime],
            sampleCount: total,
            accuracy: Math.round((correctCount / total) * 100) / 100,
            falsePositiveRate: totalNegatives > 0 ? Math.round((falsePositives / totalNegatives) * 100) / 100 : 0,
            falseNegativeRate: totalPositives > 0 ? Math.round((falseNegatives / totalPositives) * 100) / 100 : 0,
            contradictionLeakageRate: totalNegatives > 0 ? Math.round((leakedContradictions / totalNegatives) * 100) / 100 : 0,
            meanLatencyMs: Math.round(elapsed / total)
        };
    }

    public getComparativeMetrics(): BenchmarkMetric[] {
        return [
            this.evaluateCorpusAgainstRegime(DiligenceRegime.RAW_MODEL),
            this.evaluateCorpusAgainstRegime(DiligenceRegime.TOOL_RETRIEVAL),
            this.evaluateCorpusAgainstRegime(DiligenceRegime.FULL_DILIGENCE_GATE)
        ];
    }
}
