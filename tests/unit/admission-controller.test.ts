import { test, expect } from '@playwright/test';
import {
    AdmissionStatus,
    RejectionReason,
    CandidateClaim
} from '../../src/domain/kernel/admission-types';
import { TriStateAdmissionController } from '../../src/services/kernel/TriStateAdmissionController';

test.describe('TriStateAdmissionController', () => {
    const controller = new TriStateAdmissionController();

    test('should promote a substantiated, physically compliant claim', () => {
        const claim: CandidateClaim = {
            id: 'c-1',
            subject: 'PEM Electrolyzer',
            predicate: 'operates_at_consumption',
            object: '55 kWh/kg',
            rawClaim: 'Demonstrated stack consumption of 55 kWh/kg under continuous load',
            confidence: 0.9,
            status: AdmissionStatus.PENDING
        };

        const result = controller.evaluateClaim(claim, 'climate');
        expect(result.status).toBe(AdmissionStatus.PROMOTED);
        expect(result.rejectionReason).toBeUndefined();
        expect(result.admittedAt).toBeDefined();
    });

    test('should reject claims violating thermodynamic minimum energy bounds', () => {
        const impossibleClaim: CandidateClaim = {
            id: 'c-2',
            subject: 'Catalytic Cell',
            predicate: 'operates_at_consumption',
            object: '25 kWh/kg',
            rawClaim: 'Produces green hydrogen using only 25 kWh/kg electricity',
            confidence: 0.95,
            status: AdmissionStatus.PENDING
        };

        const result = controller.evaluateClaim(impossibleClaim, 'climate');
        expect(result.status).toBe(AdmissionStatus.REJECTED);
        expect(result.rejectionReason).toBe(RejectionReason.PHYSICAL_VIOLATION);
        expect(result.contradictionDetail).toContain('Thermodynamic lower bound violation');
    });

    test('should reject solar claims exceeding single-junction Shockley-Queisser physical limit', () => {
        const solarClaim: CandidateClaim = {
            id: 'c-3',
            subject: 'Single Junction Cell',
            predicate: 'yields_efficiency',
            object: '48%',
            rawClaim: 'Single-junction thin film cell achieves 48% energy conversion efficiency',
            confidence: 0.85,
            status: AdmissionStatus.PENDING
        };

        const result = controller.evaluateClaim(solarClaim, 'climate');
        expect(result.status).toBe(AdmissionStatus.REJECTED);
        expect(result.rejectionReason).toBe(RejectionReason.PHYSICAL_VIOLATION);
        expect(result.contradictionDetail).toContain('Shockley-Queisser limit');
    });

    test('should reject unbounded AI accuracy claims as causally inconsistent', () => {
        const aiClaim: CandidateClaim = {
            id: 'c-4',
            subject: 'Autonomous Agent',
            predicate: 'guarantees_precision',
            object: '100% accuracy',
            rawClaim: 'Provides 100% accuracy and zero hallucinations across all enterprise workflows',
            confidence: 0.9,
            status: AdmissionStatus.PENDING
        };

        const result = controller.evaluateClaim(aiClaim, 'ai');
        expect(result.status).toBe(AdmissionStatus.REJECTED);
        expect(result.rejectionReason).toBe(RejectionReason.CAUSAL_INCONSISTENCY);
        expect(result.contradictionDetail).toContain('Stochastic models exhibit non-zero failure');
    });

    test('should reject claims with incomplete schemas', () => {
        const malformed: CandidateClaim = {
            id: 'c-5',
            subject: '',
            predicate: 'operates',
            object: '',
            rawClaim: 'Incomplete extraction statement',
            confidence: 0.8,
            status: AdmissionStatus.PENDING
        };

        const result = controller.evaluateClaim(malformed, 'tech');
        expect(result.status).toBe(AdmissionStatus.REJECTED);
        expect(result.rejectionReason).toBe(RejectionReason.SCHEMA_INVALID);
    });

    test('should reject low confidence extractions below threshold', () => {
        const lowConf: CandidateClaim = {
            id: 'c-6',
            subject: 'Database layer',
            predicate: 'scales_throughput',
            object: '10x',
            rawClaim: 'Likely improves throughput',
            confidence: 0.45,
            status: AdmissionStatus.PENDING
        };

        const result = controller.evaluateClaim(lowConf, 'tech');
        expect(result.status).toBe(AdmissionStatus.REJECTED);
        expect(result.rejectionReason).toBe(RejectionReason.LOW_CONFIDENCE);
    });

    test('should batch partition candidate claims into promoted, rejected, and pending sets', () => {
        const claims: CandidateClaim[] = [
            {
                id: '1',
                subject: 'PEM Stack',
                predicate: 'consumption',
                object: '54 kWh/kg',
                rawClaim: '54 kWh/kg',
                confidence: 0.9,
                status: AdmissionStatus.PENDING
            },
            {
                id: '2',
                subject: 'Electrolyzer',
                predicate: 'consumption',
                object: '20 kWh/kg',
                rawClaim: '20 kWh/kg',
                confidence: 0.9,
                status: AdmissionStatus.PENDING
            }
        ];

        const partitioned = controller.evaluateClaims(claims, 'climate');
        expect(partitioned.promoted.length).toBe(1);
        expect(partitioned.rejected.length).toBe(1);
        expect(partitioned.pending.length).toBe(0);
    });
});
