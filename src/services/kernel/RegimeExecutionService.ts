import { DiligenceRegime } from '../../domain/diligence-regime';
import {
    CandidateClaim,
    AdmissionStatus,
    StructuralCausalModel
} from '../../domain/kernel/admission-types';
import { TriStateAdmissionController, PartitionedClaims } from './TriStateAdmissionController';
import { CausalPreFlightGate, CausalPreFlightResult } from './CausalPreFlightGate';

export interface RegimeExecutionResult {
    regime: DiligenceRegime;
    regimeInsight: string;
    canaryScore: { total: number; grade: string; verdict: string };
    quarantine: {
        verifiedClaims: Array<{ claim: string; basis: string; status: string }>;
        quarantinedAssertions: Array<{ assertion: string; contradiction: string; severity: string; rejectionReason?: string }>;
    };
    causalSensitivity: {
        criticalAssumption: string;
        stressScenarios: Array<{ parameter: string; shift: string; impact: string }>;
        breakEvenThreshold: string;
    };
    icPunchList: Array<{ question: string; targetRisk: string; whyItExposesFraud: string }>;
    scmGraph?: StructuralCausalModel;
    unfilteredSignalsCount?: number;
}

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
                return this.buildRegime0Result(candidateClaims);
            case DiligenceRegime.TOOL_RETRIEVAL:
                return this.buildRegime1Result(candidateClaims, stories);
            case DiligenceRegime.MEMORY_QUARANTINE:
                return this.buildRegime2Result(candidateClaims, sector);
            case DiligenceRegime.FULL_DILIGENCE_GATE:
            default:
                return this.buildRegime3Result(candidateClaims, sector);
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

    private buildRegime0Result(claims: CandidateClaim[]): RegimeExecutionResult {
        return {
            regime: DiligenceRegime.RAW_MODEL,
            regimeInsight: 'Credulity Bias: raw unconstrained model accepts claims without admission gates.',
            canaryScore: {
                total: 780,
                grade: 'B+',
                verdict: 'Linguistically plausible pitch accepted by foundation model without verification.'
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

    private buildRegime1Result(claims: CandidateClaim[], stories: any[]): RegimeExecutionResult {
        return {
            regime: DiligenceRegime.TOOL_RETRIEVAL,
            regimeInsight: 'Unfiltered Context: retrieved market data fed into context without contradiction isolation.',
            canaryScore: {
                total: 650,
                grade: 'C+',
                verdict: 'RAG retrieved market signals but rationalizes conflicting statements into narrative.'
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
            unfilteredSignalsCount: stories.length || 3
        };
    }

    private buildRegime2Result(claims: CandidateClaim[], sector: string): RegimeExecutionResult {
        const partitioned = this.admissionController.evaluateClaims(claims, sector);

        return {
            regime: DiligenceRegime.MEMORY_QUARANTINE,
            regimeInsight: 'Admission Control: tri-state memory gates isolated unphysical claims into quarantine.',
            canaryScore: { total: 480, grade: 'D', verdict: 'Claims partitioned into verified versus quarantined states.' },
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

    private buildRegime3Result(claims: CandidateClaim[], sector: string): RegimeExecutionResult {
        const partitioned = this.admissionController.evaluateClaims(claims, sector);
        const scm = this.causalGate.buildDomainSCM(sector);
        const causalCheck = this.evaluateCausalCheck(sector);
        const scenarios = this.buildStressScenarios();

        return {
            regime: DiligenceRegime.FULL_DILIGENCE_GATE,
            regimeInsight: 'Full Diligence Gate: Causal Pre-Flight Gate, SCM sensitivity, and IC punch-list enforced.',
            canaryScore: this.buildScore(causalCheck.isAdmitted),
            quarantine: {
                verifiedClaims: this.mapVerified(partitioned.promoted, 'Physical identity verified', 'VERIFIED'),
                quarantinedAssertions: this.mapQuarantined(partitioned.rejected)
            },
            causalSensitivity: {
                criticalAssumption: 'Grid electricity price and stack degradation over continuous cycle',
                stressScenarios: scenarios,
                breakEvenThreshold: causalCheck.breakEvenThreshold || 'Grid power ceiling exceeded'
            },
            icPunchList: this.buildICPunchList(),
            scmGraph: scm
        };
    }

    private evaluateCausalCheck(sector: string): CausalPreFlightResult {
        const scm = this.causalGate.buildDomainSCM(sector);
        const inputs: Record<string, number> = sector === 'climate' || sector === 'energy'
            ? { electricity_price: 120, stack_efficiency: 52, market_offtake_price: 2.0 }
            : { token_inference_cost: 0.005, agent_loop_iterations: 20, subscription_price_per_task: 0.05 };
        return this.causalGate.preFlightCheck(scm, inputs);
    }

    private buildStressScenarios(): Array<{ parameter: string; shift: string; impact: string }> {
        const sweep = this.causalGate.runSensitivitySweep(
            'electricity_price',
            [10, 30, 60, 100],
            { stack_efficiency: 52, market_offtake_price: 2.0 }
        );
        return sweep.map((pt) => ({
            parameter: `Power @ €${pt.parameterValue}/MWh`,
            shift: `Margin: €${pt.grossMargin}/kg`,
            impact: pt.isSolvent ? 'Solvent operation' : 'Insolvent bankruptcy cliff'
        }));
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

    private buildICPunchList() {
        return [
            {
                question: 'What verified electricity tariff guarantees positive margin when stack consumption is 52 kWh/kg?',
                targetRisk: 'Thermodynamic margin collapse',
                whyItExposesFraud: 'Power cost alone exceeds off-take contract price under prevailing regional tariffs.'
            },
            {
                question: 'Has the single-junction efficiency claim been independently audited by NREL or Fraunhofer?',
                targetRisk: 'Unphysical conversion efficiency',
                whyItExposesFraud: 'Claims exceeding the Shockley-Queisser limit require multi-junction tandem physics.'
            },
            {
                question: 'What is the measured degradation rate after 5,000 hours of continuous dynamic load cycling?',
                targetRisk: 'Stack durability warranty liability',
                whyItExposesFraud: 'Accelerated membrane failure causes catastrophic balance sheet warranty claims.'
            }
        ];
    }
}
