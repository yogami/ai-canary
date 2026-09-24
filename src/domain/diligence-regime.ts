export enum DiligenceRegime {
    RAW_MODEL = 0,
    TOOL_RETRIEVAL = 1,
    MEMORY_QUARANTINE = 2,
    FULL_DILIGENCE_GATE = 3
}

export interface RegimeMetadata {
    id: DiligenceRegime;
    title: string;
    subtitle: string;
    description: string;
    badge: string;
    activeBorderColor: string;
}

export const REGIME_CONFIGS: Record<DiligenceRegime, RegimeMetadata> = {
    [DiligenceRegime.RAW_MODEL]: {
        id: DiligenceRegime.RAW_MODEL,
        title: 'Regime 0: Raw Frontier Model',
        subtitle: 'Unconstrained prompt without verification harness',
        description: 'Demonstrates baseline credulity bias where raw models accept unphysical founder claims without verification.',
        badge: 'Baseline Bias',
        activeBorderColor: 'border-red-500/50 text-red-300 bg-red-500/10'
    },
    [DiligenceRegime.TOOL_RETRIEVAL]: {
        id: DiligenceRegime.TOOL_RETRIEVAL,
        title: 'Regime 1: Tool Retrieval / RAG',
        subtitle: 'Context retrieval without contradiction isolation',
        description: 'Fetches relevant ecosystem news and market reports, but fails to quarantine conflicting assertions.',
        badge: 'Unfiltered Context',
        activeBorderColor: 'border-yellow-500/50 text-yellow-300 bg-yellow-500/10'
    },
    [DiligenceRegime.MEMORY_QUARANTINE]: {
        id: DiligenceRegime.MEMORY_QUARANTINE,
        title: 'Regime 2: Memory Quarantine',
        subtitle: 'Tri-state staging of candidate assertions',
        description: 'Partitions founder claims into verified vs quarantined assertions before admission into evaluation memory.',
        badge: 'Admission Control',
        activeBorderColor: 'border-cyan-500/50 text-cyan-300 bg-cyan-500/10'
    },
    [DiligenceRegime.FULL_DILIGENCE_GATE]: {
        id: DiligenceRegime.FULL_DILIGENCE_GATE,
        title: 'Regime 3: Full Diligence Gate',
        subtitle: 'Deterministic physics identities and IC punch-list',
        description: 'Complete pipeline with contradiction quarantine, thermodynamic ceiling identity, causal sensitivity, and IC meeting questions.',
        badge: 'Full Diligence',
        activeBorderColor: 'border-emerald-500/50 text-emerald-300 bg-emerald-500/10'
    }
};
