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
});
