'use client';

import React from 'react';
import { DiligenceRegime } from '@/domain/diligence-regime';
import { AnalysisResult } from '@/domain/types';
import QuarantineTables from './QuarantineTables';
import ThermodynamicCeiling from './ThermodynamicCeiling';
import CausalSensitivityView from './CausalSensitivityView';
import ICPunchList from './ICPunchList';

interface RegimeViewsProps {
    activeRegime: DiligenceRegime;
    activeScenario: string | null;
    selectedNiche: string;
    intelligentResults: AnalysisResult;
    onSelectRegime: (regime: DiligenceRegime) => void;
}

export default function RegimeViews({
    activeRegime,
    activeScenario,
    selectedNiche,
    intelligentResults,
    onSelectRegime
}: RegimeViewsProps) {
    switch (activeRegime) {
        case DiligenceRegime.RAW_MODEL:
            return renderRegime0(intelligentResults);
        case DiligenceRegime.TOOL_RETRIEVAL:
            return renderRegime1(intelligentResults);
        case DiligenceRegime.MEMORY_QUARANTINE:
            return renderRegime2(intelligentResults, onSelectRegime);
        case DiligenceRegime.FULL_DILIGENCE_GATE:
        default:
            return renderRegime3(intelligentResults, activeScenario, selectedNiche);
    }
}

function renderRegime0(results: AnalysisResult) {
    const r0 = results.regimes?.[0];
    const score = r0?.canaryScore?.total || 780;
    const grade = r0?.canaryScore?.grade || 'B+';

    return (
        <div className="space-y-4 bg-gradient-to-b from-red-950/40 to-slate-900/60 border-2 border-red-500/40 rounded-2xl p-5 shadow-xl">
            {renderRegime0Header(score, grade)}
            {renderRegime0Body()}
        </div>
    );
}

function renderRegime0Header(score: number, grade: string) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-red-500/20 pb-3">
            <div>
                <h3 className="text-xl font-bold text-red-300 flex items-center gap-2">
                    ⚠️ Regime 0: Raw Frontier Model (Credulity Bias Failure)
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                    Unconstrained foundation model: optimizes for conversational plausibility without physical or accounting checks
                </p>
            </div>
            <span className="px-3 py-1 text-xs rounded-full bg-red-500/20 border border-red-400/30 text-red-200 font-medium">
                Credulous Score: {score} ({grade})
            </span>
        </div>
    );
}

function renderRegime0Body() {
    return (
        <div className="bg-black/40 border border-red-500/30 rounded-xl p-4 space-y-3">
            <h4 className="text-red-400 font-semibold text-sm">Live Observation: Why Raw Models Fail Diligence</h4>
            <p className="text-gray-300 text-xs leading-relaxed">
                Raw models evaluate venture claims based on linguistic confidence. Without thermodynamic conservation checks, levelized cost bounds, and state quarantine, they accept unphysical numbers at face value.
            </p>
            <div className="bg-red-950/30 border border-red-500/20 rounded-lg p-3 text-xs space-y-2">
                <span className="text-red-400 font-bold block">Live Extraction Status: Fatal False Positive</span>
                <p className="text-gray-300 text-[11px]">
                    The raw model admitted all founder assertions into context with zero quarantined claims. Switch to Regime 2 or 3 to observe deterministic admission interception.
                </p>
            </div>
        </div>
    );
}

function renderRegime1(results: AnalysisResult) {
    const r1 = results.regimes?.[1];
    const signals = r1?.unfilteredSignalsCount || 3;

    return (
        <div className="space-y-4 bg-gradient-to-b from-blue-950/40 to-slate-900/60 border-2 border-blue-500/40 rounded-2xl p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-500/20 pb-3">
                <div>
                    <h3 className="text-xl font-bold text-blue-300 flex items-center gap-2">
                        ℹ️ Regime 1: Tool &amp; Web Retrieval (Unchecked Context RAG)
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Augmented with web indexes and market data: retrieves facts, but lacks write-ahead schema gates
                    </p>
                </div>
                <span className="px-3 py-1 text-xs rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 font-medium">
                    {signals} Signals Retrieved
                </span>
            </div>
            <div className="bg-black/40 border border-blue-500/30 rounded-xl p-4 space-y-3">
                <h4 className="text-blue-400 font-semibold text-sm">The RAG Diligence Blindspot</h4>
                <p className="text-gray-300 text-xs leading-relaxed">
                    Standard RAG queries vector embeddings or search engines to find current market figures. However, RAG feeds these retrieved snippets directly into the prompt context. Without deterministic schema gates, the model rationalizes contradictory statements into plausible narratives instead of quarantining them.
                </p>
            </div>
        </div>
    );
}

function renderRegime2(results: AnalysisResult, onSelectRegime: (regime: DiligenceRegime) => void) {
    const r2 = results.regimes?.[2];
    const verified = r2?.quarantine?.verifiedClaims || results.agenticDiligence?.quarantine?.verifiedClaims;
    const quarantined = r2?.quarantine?.quarantinedAssertions || results.agenticDiligence?.quarantine?.quarantinedAssertions;

    return (
        <div className="space-y-4 bg-gradient-to-b from-purple-950/40 to-slate-900/60 border-2 border-purple-500/40 rounded-2xl p-5 shadow-xl">
            {renderRegime2Header()}
            <QuarantineTables verifiedClaims={verified} quarantinedAssertions={quarantined} />
            {renderRegime2Footer(onSelectRegime)}
        </div>
    );
}

function renderRegime2Header() {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-500/20 pb-3">
            <div>
                <h3 className="text-xl font-bold text-purple-300 flex items-center gap-2">
                    🛡️ Regime 2: Write-Ahead Admission &amp; Memory Quarantine
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                    Deterministic interception: candidate claims are staged in tri-state memory before state promotion
                </p>
            </div>
            <span className="px-3 py-1 text-xs rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 font-medium">
                Tri-State Staging Active
            </span>
        </div>
    );
}

function renderRegime2Footer(onSelectRegime: (regime: DiligenceRegime) => void) {
    return (
        <div className="bg-black/30 border border-white/10 rounded-lg p-3 text-xs text-gray-400 flex items-center justify-between">
            <span>Staging status: Claims partitioned. Switch to <strong className="text-emerald-400">Regime 3</strong> for causal price shock sensitivity and the IC punch-list.</span>
            <button
                type="button"
                onClick={() => onSelectRegime(DiligenceRegime.FULL_DILIGENCE_GATE)}
                className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded border border-emerald-500/40 font-semibold text-xs transition-colors"
            >
                Advance to Regime 3 →
            </button>
        </div>
    );
}

function renderRegime3(results: AnalysisResult, scenario: string | null, niche: string) {
    const r3 = results.regimes?.[3];
    const verified = r3?.quarantine?.verifiedClaims || results.agenticDiligence?.quarantine?.verifiedClaims;
    const quarantined = r3?.quarantine?.quarantinedAssertions || results.agenticDiligence?.quarantine?.quarantinedAssertions;
    const sensitivity = r3?.causalSensitivity || results.agenticDiligence?.causalSensitivity;
    const punchList = r3?.icPunchList || results.agenticDiligence?.icPunchList || [];
    const showCeiling = scenario === 'caseNikola' || scenario === 'caseSunHydrogen' || niche === 'climate';

    return (
        <div className="space-y-4 bg-gradient-to-b from-slate-900/60 to-purple-950/40 border-2 border-purple-500/40 rounded-2xl p-5 shadow-xl">
            {renderRegime3Header()}
            <QuarantineTables verifiedClaims={verified} quarantinedAssertions={quarantined} />
            {showCeiling && <ThermodynamicCeiling activeScenario={scenario} />}
            <CausalSensitivityView sensitivity={sensitivity} />
            <ICPunchList items={punchList} />
        </div>
    );
}

function renderRegime3Header() {
    return (
        <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
            <div>
                <h3 className="text-xl font-bold text-purple-300 flex items-center gap-2">
                    🛡️ Institutional Truth &amp; Contradiction Quarantine
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                    Venture diligence gate: physical boundaries, levelized cost models, and counter-case red-teaming
                </p>
            </div>
            <span className="px-3 py-1 text-xs rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 font-medium">
                Institutional Diligence Protocol
            </span>
        </div>
    );
}
