import { test, expect } from '@playwright/test';
import { RegimeExecutionService } from '../../src/services/kernel/RegimeExecutionService';
import { DiligenceRegime } from '../../src/domain/diligence-regime';

test.describe('RegimeExecutionService', () => {
    const service = new RegimeExecutionService();

    const impossiblePitch =
        'SolarHydrogen Corp produces green hydrogen at €1.20/kg using our single-junction cell with 45% efficiency and only 25 kWh/kg electricity consumption on standard European grid power.';

    test('should execute Regime 0 showing credulous raw model output with zero quarantined claims', () => {
        const result = service.executeRegime(DiligenceRegime.RAW_MODEL, impossiblePitch, 'climate', []);
        expect(result.regime).toBe(DiligenceRegime.RAW_MODEL);
        expect(result.quarantine.quarantinedAssertions.length).toBe(0);
        expect(result.canaryScore.grade).not.toBe('F');
        expect(result.regimeInsight).toContain('Credulity Bias');
    });

    test('should execute Regime 1 showing unquarantined RAG rationalization', () => {
        const stories = [{ headline: 'Power prices in Germany hit €120/MWh', summary: 'Industrial tariffs high' }];
        const result = service.executeRegime(DiligenceRegime.TOOL_RETRIEVAL, impossiblePitch, 'climate', stories);
        expect(result.regime).toBe(DiligenceRegime.TOOL_RETRIEVAL);
        expect(result.regimeInsight).toContain('Unfiltered Context');
        expect(result.unfilteredSignalsCount).toBeGreaterThan(0);
    });

    test('should execute Regime 2 partitioning claims through tri-state admission control', () => {
        const result = service.executeRegime(DiligenceRegime.MEMORY_QUARANTINE, impossiblePitch, 'climate', []);
        expect(result.regime).toBe(DiligenceRegime.MEMORY_QUARANTINE);
        expect(result.quarantine.quarantinedAssertions.length).toBeGreaterThan(0);
        const quarantined = result.quarantine.quarantinedAssertions[0];
        expect(quarantined.rejectionReason).toBeDefined();
    });

    test('should execute Regime 3 enforcing Causal Gate, SCM sensitivity, and IC punch-list', () => {
        const result = service.executeRegime(DiligenceRegime.FULL_DILIGENCE_GATE, impossiblePitch, 'climate', []);
        expect(result.regime).toBe(DiligenceRegime.FULL_DILIGENCE_GATE);
        expect(result.canaryScore.grade).toBe('F');
        expect(result.causalSensitivity.stressScenarios.length).toBeGreaterThan(0);
        expect(result.icPunchList.length).toBe(3);
        expect(result.scmGraph).toBeDefined();
        expect(result.scmGraph?.nodes.length).toBeGreaterThanOrEqual(4);
    });

    test('should execute Regime 3 for AI startup generating AI SCM and compounding error questions', () => {
        const aiPitch = 'OmniAgent: Autonomous IT agent guaranteeing 100% bug-free deployments for $15/seat with infinite multi-turn loops.';
        const result = service.executeRegime(DiligenceRegime.FULL_DILIGENCE_GATE, aiPitch, 'ai', []);
        expect(result.regime).toBe(DiligenceRegime.FULL_DILIGENCE_GATE);
        expect(result.canaryScore.grade).toBe('F');
        expect(result.quarantine.quarantinedAssertions.length).toBeGreaterThan(0);
        expect(result.scmGraph?.id).toBe('scm-ai-saas');
        expect(result.causalSensitivity.criticalAssumption).toContain('Inference token cost');
        expect(result.icPunchList[0].question).toContain('multi-turn compounding error rate');
    });

    test('should admit viable AI startup with positive unit margin and bounded execution', () => {
        const viablePitch = 'SpecGuard: Charges $0.15 per compilation run, bounding compute token cost to $0.003 per run over a 3-turn loop with provable safety proofs.';
        const result = service.executeRegime(DiligenceRegime.FULL_DILIGENCE_GATE, viablePitch, 'ai', []);
        expect(result.regime).toBe(DiligenceRegime.FULL_DILIGENCE_GATE);
        expect(result.canaryScore.grade).not.toBe('F');
        expect(result.quarantine.quarantinedAssertions.length).toBe(0);
        expect(result.canaryScore.total).toBeGreaterThanOrEqual(700);
    });
});
