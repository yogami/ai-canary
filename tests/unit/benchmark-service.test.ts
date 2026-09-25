import { test, expect } from '@playwright/test';
import { BenchmarkService } from '../../src/services/kernel/BenchmarkService';
import { DiligenceRegime } from '../../src/domain/diligence-regime';

test.describe('BenchmarkService', () => {
    const service = new BenchmarkService();

    test('should load historical diligence benchmark corpus with ground truth labels', () => {
        const corpus = service.getHistoricalCorpus();
        expect(corpus.length).toBe(5);

        const names = corpus.map(c => c.name);
        expect(names).toContain('Theranos');
        expect(names).toContain('Nikola H2');
        expect(names).toContain('Lilium Aviation');
        expect(names).toContain('Solyndra');
        expect(names).toContain('Enterprise B2B SaaS');
    });

    test('should evaluate historical corpus under Regime 0 demonstrating high false positive rate', () => {
        const metrics = service.evaluateCorpusAgainstRegime(DiligenceRegime.RAW_MODEL);
        expect(metrics.track).toContain('Track A: Raw Frontier Model');
        expect(metrics.falsePositiveRate).toBeGreaterThan(0.5);
        expect(metrics.contradictionLeakageRate).toBeGreaterThan(0.5);
    });

    test('should evaluate historical corpus under Regime 3 demonstrating zero contradiction leakage', () => {
        const metrics = service.evaluateCorpusAgainstRegime(DiligenceRegime.FULL_DILIGENCE_GATE);
        expect(metrics.track).toContain('Track C: Full Agent Kernel');
        expect(metrics.falsePositiveRate).toBe(0.0);
        expect(metrics.contradictionLeakageRate).toBe(0.0);
        expect(metrics.accuracy).toBeGreaterThanOrEqual(0.8);
    });

    test('should produce comparative summary table across all three benchmark tracks', () => {
        const comparative = service.getComparativeMetrics();
        expect(comparative.length).toBe(3);

        const trackA = comparative.find(m => m.track.includes('Track A'));
        const trackC = comparative.find(m => m.track.includes('Track C'));

        expect(trackA).toBeDefined();
        expect(trackC).toBeDefined();
        expect(trackC!.accuracy).toBeGreaterThan(trackA!.accuracy);
        expect(trackC!.contradictionLeakageRate).toBeLessThan(trackA!.contradictionLeakageRate);
    });
});
