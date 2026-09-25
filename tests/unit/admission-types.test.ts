import { test, expect } from '@playwright/test';
import {
    AdmissionStatus,
    RejectionReason,
    CandidateClaim,
    StructuralCausalModel,
    BenchmarkMetric
} from '../../src/domain/kernel/admission-types';

test.describe('Kernel Domain Entities', () => {
    test('should define the tri-state admission lifecycle states', () => {
        expect(AdmissionStatus.PENDING).toBe('PENDING');
        expect(AdmissionStatus.PROMOTED).toBe('PROMOTED');
        expect(AdmissionStatus.REJECTED).toBe('REJECTED');
    });

    test('should define explicit admission rejection reason codes', () => {
        expect(RejectionReason.SCHEMA_INVALID).toBe('SCHEMA_INVALID');
        expect(RejectionReason.CONTRADICTION_DETECTED).toBe('CONTRADICTION_DETECTED');
        expect(RejectionReason.LOW_CONFIDENCE).toBe('LOW_CONFIDENCE');
        expect(RejectionReason.CAUSAL_INCONSISTENCY).toBe('CAUSAL_INCONSISTENCY');
        expect(RejectionReason.PHYSICAL_VIOLATION).toBe('PHYSICAL_VIOLATION');
    });

    test('should construct a valid candidate claim in pending state', () => {
        const claim: CandidateClaim = {
            id: 'claim-1',
            subject: 'Green Hydrogen Stack',
            predicate: 'requires_power_per_kg',
            object: '52 kWh',
            rawClaim: 'Produces hydrogen with 52 kWh/kg electricity consumption',
            confidence: 0.95,
            status: AdmissionStatus.PENDING
        };

        expect(claim.status).toBe(AdmissionStatus.PENDING);
        expect(claim.rejectionReason).toBeUndefined();
    });

    test('should construct a structural causal model with nodes and directed edges', () => {
        const scm: StructuralCausalModel = {
            id: 'scm-electrolysis-1',
            name: 'Electrolysis Levelized Cost SCM',
            nodes: [
                { id: 'electricity_price', label: 'Electricity Price (€/MWh)', nodeType: 'exogenous' },
                { id: 'stack_efficiency', label: 'Stack Consumption (kWh/kg)', nodeType: 'mechanism' },
                { id: 'levelized_cost', label: 'Levelized Hydrogen Cost (€/kg)', nodeType: 'endogenous' }
            ],
            edges: [
                { from: 'electricity_price', to: 'levelized_cost', formula: 'cost_component' },
                { from: 'stack_efficiency', to: 'levelized_cost', formula: 'multiplier' }
            ]
        };

        expect(scm.nodes.length).toBe(3);
        expect(scm.edges.length).toBe(2);
    });

    test('should construct benchmark metrics for cross-regime evaluation', () => {
        const metric: BenchmarkMetric = {
            track: 'Track C: Agent Kernel',
            sampleCount: 50,
            accuracy: 0.94,
            falsePositiveRate: 0.04,
            falseNegativeRate: 0.02,
            contradictionLeakageRate: 0.0
        };

        expect(metric.contradictionLeakageRate).toBe(0.0);
        expect(metric.accuracy).toBeGreaterThan(0.9);
    });
});
