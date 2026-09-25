import { DiligenceRegime } from '../../domain/diligence-regime';
import {
    CandidateClaim,
    AdmissionStatus,
    StructuralCausalModel,
    RejectionReason,
    RegimeExecutionResult
} from '../../domain/kernel/admission-types';
import { TriStateAdmissionController } from './TriStateAdmissionController';
import { CausalPreFlightGate } from './CausalPreFlightGate';
import { getDomainICPunchList } from '../../domain/kernel/ic-punch-list';
import { extractCausalInputs } from './causal-input-extractor';

export type { RegimeExecutionResult };

export class RegimeExecutionService {
    private readonly admissionController: TriStateAdmissionController;
    private readonly causalGate: CausalPreFlightGate;

    constructor() {
        this.admissionController = new TriStateAdmissionController();
        this.causalGate = new CausalPreFlightGate();
    }

    public executeRegime(
        regime: DiligenceRegime,
        pitch: string,
        sector: string,
        stories: any[] = []
    ): RegimeExecutionResult {
        const candidateClaims = this.extractCandidateClaims(pitch);

        switch (regime) {
            case DiligenceRegime.RAW_MODEL:
                return this.buildRegime0Result(candidateClaims, pitch);
            case DiligenceRegime.TOOL_RETRIEVAL:
                return this.buildRegime1Result(candidateClaims, stories);
            case DiligenceRegime.MEMORY_QUARANTINE:
                return this.buildRegime2Result(candidateClaims, sector);
            case DiligenceRegime.FULL_DILIGENCE_GATE:
            default:
                return this.buildRegime3Result(candidateClaims, sector, pitch);
        }
    }

    private extractCandidateClaims(pitch: string): CandidateClaim[] {
        const claims: CandidateClaim[] = [];
        const sentences = pitch.split(/(?<=[.!?])\s+/);

        for (let i = 0; i < sentences.length; i++) {
            const s = sentences[i].trim();
            if (s.length > 10) {
                claims.push({
                    id: `extracted-${i + 1}`,
                    subject: 'Venture Assertion',
                    predicate: 'asserts',
                    object: s,
                    rawClaim: s,
                    confidence: 0.88,
                    status: AdmissionStatus.PENDING
                });
            }
        }
        return claims;
    }

    private buildRegime0Result(claims: CandidateClaim[], pitch: string): RegimeExecutionResult {
        const claimsBonus = Math.min(claims.length * 15, 120);
        const lengthBonus = Math.min(Math.floor(pitch.length / 50), 60);
        const score = Math.min(880, Math.max(720, 710 + claimsBonus + lengthBonus));
        const grade = score >= 800 ? 'A-' : 'B+';

        return {
            regime: DiligenceRegime.RAW_MODEL,
            regimeInsight: 'Credulity Bias: raw unconstrained model accepts claims without admission gates.',
            canaryScore: {
                total: score,
                grade,
                verdict: `Linguistically plausible pitch accepted by foundation model (${claims.length} assertions unverified).`
            },
            quarantine: {
                verifiedClaims: this.mapVerified(claims, 'Model assumption', 'UNVERIFIED_ACCEPTANCE'),
                quarantinedAssertions: []
            },
            causalSensitivity: {
                criticalAssumption: 'Founder pitch metrics assumed accurate at face value',
                stressScenarios: [],
                breakEvenThreshold: 'Unchecked in Regime 0'
            },
            icPunchList: []
        };
    }

    private calculateRegime1Score(stories: any[], claimsCount: number): { score: number; grade: string } {
        let sentimentAdj = 0;
        if (stories.length > 0) {
            const sum = stories.reduce((acc, s) => {
                const val = typeof s.sentiment === 'number' ? s.sentiment : (s.sentimentScore || 0);
                return acc + val;
            }, 0);
            sentimentAdj = Math.round((sum / stories.length) * 40);
        }
        const penalty = Math.min(claimsCount * 4, 30);
        const score = Math.min(690, Math.max(530, 620 + sentimentAdj - penalty));
        const grade = score >= 640 ? 'B-' : score >= 580 ? 'C+' : 'C';
        return { score, grade };
    }

    private buildRegime1Result(claims: CandidateClaim[], stories: any[]): RegimeExecutionResult {
        const signalCount = stories.length || 3;
        const { score, grade } = this.calculateRegime1Score(stories, claims.length);

        return {
            regime: DiligenceRegime.TOOL_RETRIEVAL,
            regimeInsight: 'Unfiltered Context: retrieved market data fed into context without contradiction isolation.',
            canaryScore: {
                total: score,
                grade,
                verdict: `RAG retrieved ${signalCount} market signal(s) but rationalized conflicting statements into narrative.`
            },
            quarantine: {
                verifiedClaims: this.mapVerified(claims, 'Retrieved news context', 'POTENTIAL_ENTANGLEMENT'),
                quarantinedAssertions: []
            },
            causalSensitivity: {
                criticalAssumption: 'Market signals mixed with unverified claims',
                stressScenarios: [],
                breakEvenThreshold: 'Uncalculated in Regime 1'
            },
            icPunchList: [],
            unfilteredSignalsCount: signalCount
        };
    }

    private buildRegime2Result(claims: CandidateClaim[], sector: string): RegimeExecutionResult {
        const partitioned = this.admissionController.evaluateClaims(claims, sector);
        const total = partitioned.promoted.length + partitioned.rejected.length;
        const passRatio = total > 0 ? partitioned.promoted.length / total : 1;
        const totalScore = Math.round(280 + (passRatio * 440));
        const grade = totalScore >= 700 ? 'B+' : totalScore >= 600 ? 'B' : totalScore >= 500 ? 'C' : 'D';

        return {
            regime: DiligenceRegime.MEMORY_QUARANTINE,
            regimeInsight: 'Admission Control: tri-state memory gates isolated unphysical claims into quarantine.',
            canaryScore: {
                total: totalScore,
                grade: (grade as 'B+' | 'B' | 'C' | 'D'),
                verdict: partitioned.rejected.length === 0
                    ? 'All assertions admitted through truth gates'
                    : `${partitioned.rejected.length} unphysical assertion(s) quarantined`
            },
            quarantine: {
                verifiedClaims: this.mapVerified(partitioned.promoted, 'Passed admission bounds', 'PROMOTED'),
                quarantinedAssertions: this.mapQuarantined(partitioned.rejected)
            },
            causalSensitivity: {
                criticalAssumption: 'Admission gate enforced. Awaiting causal sensitivity sweep in Regime 3.',
                stressScenarios: [],
                breakEvenThreshold: 'Pending Causal Pre-Flight Gate'
            },
            icPunchList: []
        };
    }

    private buildRegime3Result(claims: CandidateClaim[], sector: string, pitch: string): RegimeExecutionResult {
        const partitioned = this.admissionController.evaluateClaims(claims, sector);
        const scm = this.causalGate.buildDomainSCM(sector);
        const inputs = extractCausalInputs(sector, pitch);
        const causalCheck = this.causalGate.preFlightCheck(scm, inputs);
        const scenarios = this.causalGate.buildStressScenarios(sector, inputs);
        const isClimate = sector === 'climate' || sector === 'energy';
        const quarantined = this.mapQuarantined(partitioned.rejected);

        if (!causalCheck.isAdmitted && causalCheck.violations.length > 0) {
            this.appendCausalViolations(causalCheck.violations, quarantined);
        }

        return {
            regime: DiligenceRegime.FULL_DILIGENCE_GATE,
            regimeInsight: 'Full Diligence Gate: Causal Pre-Flight Gate, SCM sensitivity, and IC punch-list enforced.',
            canaryScore: this.buildScore(causalCheck.isAdmitted && partitioned.rejected.length === 0),
            quarantine: {
                verifiedClaims: this.mapVerified(partitioned.promoted, 'Physical identity verified', 'VERIFIED'),
                quarantinedAssertions: quarantined
            },
            causalSensitivity: {
                criticalAssumption: isClimate
                    ? 'Grid electricity price and stack degradation over continuous cycle'
                    : 'Inference token cost scaling and multi-turn compounding error rate',
                stressScenarios: scenarios,
                breakEvenThreshold: causalCheck.breakEvenThreshold || 'Unit contribution margin exceeded'
            },
            icPunchList: getDomainICPunchList(sector),
            scmGraph: scm
        };
    }

    private appendCausalViolations(violations: string[], quarantined: any[]) {
        for (const v of violations) {
            quarantined.push({
                assertion: 'Economic Identity Inconsistency',
                contradiction: v,
                severity: 'CRITICAL',
                rejectionReason: RejectionReason.CAUSAL_INCONSISTENCY
            });
        }
    }

    private buildScore(isAdmitted: boolean) {
        return {
            total: isAdmitted ? 720 : 180,
            grade: isAdmitted ? 'B' : 'F',
            verdict: isAdmitted
                ? 'Unit economics pass physical and causal gates'
                : 'Fatal diligence failure: unit economics violate physical limits'
        };
    }

    private mapVerified(claims: CandidateClaim[], basis: string, status: string) {
        return claims.map((c) => ({
            claim: c.rawClaim,
            basis,
            status
        }));
    }

    private mapQuarantined(claims: CandidateClaim[]) {
        return claims.map((c) => ({
            assertion: c.rawClaim,
            contradiction: c.contradictionDetail || 'Violates physical identity',
            severity: 'CRITICAL',
            rejectionReason: c.rejectionReason
        }));
    }
}
