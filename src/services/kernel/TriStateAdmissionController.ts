import {
    AdmissionStatus,
    RejectionReason,
    CandidateClaim
} from '../../domain/kernel/admission-types';
import { evaluatePhysicalBounds } from './physical-bounds-evaluator';

export interface PartitionedClaims {
    promoted: CandidateClaim[];
    rejected: CandidateClaim[];
    pending: CandidateClaim[];
}

export class TriStateAdmissionController {
    private readonly minConfidenceThreshold = 0.6;

    public evaluateClaim(claim: CandidateClaim, sector: string): CandidateClaim {
        const schemaError = this.checkSchema(claim);
        if (schemaError) {
            return this.buildRejectedClaim(claim, schemaError, 'Missing required schema fields');
        }

        const confidenceError = this.checkConfidence(claim.confidence);
        if (confidenceError) {
            return this.buildRejectedClaim(claim, confidenceError, 'Confidence below threshold');
        }

        const physicalError = this.checkPhysicalBounds(claim, sector);
        if (physicalError) {
            return this.buildRejectedClaim(claim, physicalError.reason, physicalError.detail);
        }

        const causalError = this.checkCausalConsistency(claim, sector);
        if (causalError) {
            return this.buildRejectedClaim(claim, causalError.reason, causalError.detail);
        }

        return this.buildPromotedClaim(claim);
    }

    public evaluateClaims(claims: CandidateClaim[], sector: string): PartitionedClaims {
        const promoted: CandidateClaim[] = [];
        const rejected: CandidateClaim[] = [];

        for (const claim of claims) {
            const evaluated = this.evaluateClaim(claim, sector);
            if (evaluated.status === AdmissionStatus.PROMOTED) {
                promoted.push(evaluated);
            } else {
                rejected.push(evaluated);
            }
        }

        return { promoted, rejected, pending: [] };
    }

    private checkSchema(claim: CandidateClaim): RejectionReason | null {
        if (!claim.subject || !claim.predicate || !claim.object) {
            return RejectionReason.SCHEMA_INVALID;
        }
        return null;
    }

    private checkConfidence(confidence: number): RejectionReason | null {
        if (confidence < this.minConfidenceThreshold) {
            return RejectionReason.LOW_CONFIDENCE;
        }
        return null;
    }

    private checkPhysicalBounds(
        claim: CandidateClaim,
        sector: string
    ): { reason: RejectionReason; detail: string } | null {
        const text = `${claim.rawClaim} ${claim.object}`.toLowerCase();
        return evaluatePhysicalBounds(text, sector);
    }

    private checkCausalConsistency(
        claim: CandidateClaim,
        sector: string
    ): { reason: RejectionReason; detail: string } | null {
        const text = `${claim.rawClaim} ${claim.object}`.toLowerCase();

        if (text.includes('100%') || text.includes('zero hallucination') || text.includes('bug-free')) {
            return {
                reason: RejectionReason.CAUSAL_INCONSISTENCY,
                detail: 'Stochastic models exhibit non-zero failure rates without deterministic state tripwires.'
            };
        }

        if (sector === 'fintech' && (text.includes('0% default') || text.includes('0.0% default') || text.includes('zero default'))) {
            return {
                reason: RejectionReason.CAUSAL_INCONSISTENCY,
                detail: 'Credit underwriting carries structural non-zero default across macroeconomic credit cycles.'
            };
        }

        return null;
    }

    private buildRejectedClaim(
        claim: CandidateClaim,
        reason: RejectionReason,
        detail: string
    ): CandidateClaim {
        return {
            ...claim,
            status: AdmissionStatus.REJECTED,
            rejectionReason: reason,
            contradictionDetail: detail
        };
    }

    private buildPromotedClaim(claim: CandidateClaim): CandidateClaim {
        return {
            ...claim,
            status: AdmissionStatus.PROMOTED,
            admittedAt: new Date().toISOString()
        };
    }
}
