import { test, expect } from '@playwright/test';
import { AdmissionStatus, CandidateClaim } from '../../src/domain/kernel/admission-types';
import { ContextRAM } from '../../src/services/kernel/ContextRAM';

test.describe('ContextRAM', () => {
    const ram = new ContextRAM();

    test('should format promoted facts within untrusted memory delimiters', () => {
        const promotedClaims: CandidateClaim[] = [
            {
                id: '1',
                subject: 'Electrolyzer Stack',
                predicate: 'energy_consumption',
                object: '54 kWh/kg',
                rawClaim: '54 kWh/kg under continuous load',
                confidence: 0.92,
                status: AdmissionStatus.PROMOTED
            }
        ];

        const context = ram.assembleMemoryContext(promotedClaims, []);
        expect(context).toContain('<untrusted_retrieved_memory>');
        expect(context).toContain('</untrusted_retrieved_memory>');
        expect(context).toContain('54 kWh/kg');
    });

    test('should exclude rejected/quarantined claims from promoted memory context', () => {
        const rejectedClaims: CandidateClaim[] = [
            {
                id: '2',
                subject: 'Electrolyzer',
                predicate: 'energy_consumption',
                object: '20 kWh/kg',
                rawClaim: '20 kWh/kg miraculous output',
                confidence: 0.95,
                status: AdmissionStatus.REJECTED,
                contradictionDetail: 'Thermodynamic violation'
            }
        ];

        const context = ram.assembleMemoryContext([], rejectedClaims);
        expect(context).not.toContain('<untrusted_retrieved_memory>');
        expect(context).toContain('<quarantine_isolation_buffer>');
        expect(context).toContain('Thermodynamic violation');
    });

    test('should append procedural operational rules into the system block', () => {
        const rules = [
            'Reject any unphysical claims',
            'Enforce levelized cost floor'
        ];

        const prompt = ram.assembleSystemPrompt('Base diligence prompt', rules);
        expect(prompt).toContain('OPERATIONAL RULES');
        expect(prompt).toContain('- Reject any unphysical claims');
        expect(prompt).toContain('- Enforce levelized cost floor');
    });
});
