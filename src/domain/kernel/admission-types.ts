/**
 * Pure domain entities and value objects for the Agent Kernel admission control.
 */

export enum AdmissionStatus {
    PENDING = 'PENDING',
    PROMOTED = 'PROMOTED',
    REJECTED = 'REJECTED'
}

export enum RejectionReason {
    SCHEMA_INVALID = 'SCHEMA_INVALID',
    CONTRADICTION_DETECTED = 'CONTRADICTION_DETECTED',
    LOW_CONFIDENCE = 'LOW_CONFIDENCE',
    CAUSAL_INCONSISTENCY = 'CAUSAL_INCONSISTENCY',
    PHYSICAL_VIOLATION = 'PHYSICAL_VIOLATION'
}

export interface CandidateClaim {
    id: string;
    subject: string;
    predicate: string;
    object: string;
    rawClaim: string;
    confidence: number;
    status: AdmissionStatus;
    rejectionReason?: RejectionReason;
    contradictionDetail?: string;
    admittedAt?: string;
}

export type CausalNodeType = 'exogenous' | 'mechanism' | 'endogenous';

export interface CausalNode {
    id: string;
    label: string;
    nodeType: CausalNodeType;
    currentValue?: number;
    unit?: string;
}

export interface CausalEdge {
    from: string;
    to: string;
    formula?: string;
    description?: string;
}

export interface StructuralCausalModel {
    id: string;
    name: string;
    nodes: CausalNode[];
    edges: CausalEdge[];
}

export interface BenchmarkMetric {
    track: string;
    sampleCount: number;
    accuracy: number;
    falsePositiveRate: number;
    falseNegativeRate: number;
    contradictionLeakageRate: number;
    meanLatencyMs?: number;
}
