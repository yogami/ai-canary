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
    if (activeRegime === DiligenceRegime.RAW_MODEL) {
        return (
            <div className="space-y-4 bg-gradient-to-b from-red-950/40 to-slate-900/60 border-2 border-red-500/40 rounded-2xl p-5 shadow-xl">
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
                        Zero Admission Gates
                    </span>
                </div>

                <div className="bg-black/40 border border-red-500/30 rounded-xl p-4 space-y-3">
                    <h4 className="text-red-400 font-semibold text-sm">Why Frontier Models Fail Diligence Without a Harness</h4>
                    <p className="text-gray-300 text-xs leading-relaxed">
                        Raw models evaluate venture claims based on linguistic confidence. They lack thermodynamic conservation checks, levelized cost bounds, and state quarantine. Consequently, they fall into two fatal failure modes: credulous false positives on impossible numbers, or dismissive false negatives on non-standard technical moats.
                    </p>

                    <div className="bg-red-950/30 border border-red-500/20 rounded-lg p-3 mt-3">
                        <p className="text-[11px] uppercase tracking-wider text-red-400 font-bold mb-1">
                            {activeScenario === 'caseNikola' && 'Case A Ground Truth Failure: Nikola H₂'}
                            {activeScenario === 'caseFirstSolar' && 'Case B Ground Truth Failure: First Solar CdTe'}
                            {activeScenario === 'caseSolyndra' && 'Case C Ground Truth Failure: Solyndra CIGS'}
                            {activeScenario === 'caseSunHydrogen' && 'Case D Ground Truth Failure: SunHydrogen AEM'}
                            {activeScenario === 'caseKernelGuard' && 'Case E Ground Truth Failure: KernelGuard Harness'}
                            {!activeScenario && 'Empirical Baseline Comparison'}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 text-xs">
                            <div className="bg-black/30 border border-white/10 rounded p-2.5">
                                <span className="text-red-400 font-bold block mb-1">❌ Raw Model Output (Regime 0):</span>
                                <p className="text-gray-300 leading-snug">
                                    {activeScenario === 'caseNikola' && 'Endorsed sub-$1.00/kg clean hydrogen as a breakthrough catalyst for diesel TCO parity. Predicted high investment conviction and massive commercial fleet adoption.'}
                                    {activeScenario === 'caseFirstSolar' && 'Rejected First Solar due to 9% conversion efficiency versus 15% crystalline silicon incumbent. Flagged efficiency gap as an insurmountable commercial disqualifier.'}
                                    {activeScenario === 'caseSolyndra' && 'Endorsed cylindrical CIGS tubes as a superior architecture that bypasses expensive $300/kg polysilicon supply chains. Predicted sustained market leadership.'}
                                    {activeScenario === 'caseSunHydrogen' && 'Endorsed €1.80/kg green hydrogen without checking whether regional electricity grid prices permit that cost floor.'}
                                    {activeScenario === 'caseKernelGuard' && 'Classified deterministic state management as a standard prompt engineering wrapper, missing operational memory isolation.'}
                                    {!activeScenario && 'Accepts founder pitch metrics at face value without evaluating thermodynamic lower bounds or industrial supply chain bottlenecks.'}
                                </p>
                            </div>
                            <div className="bg-emerald-950/30 border border-emerald-500/20 rounded p-2.5">
                                <span className="text-emerald-400 font-bold block mb-1">✅ Adjudicated Ground Truth:</span>
                                <p className="text-gray-300 leading-snug">
                                    {activeScenario === 'caseNikola' && 'Fatal False Positive. SEC assessed $125M penalty. At 52 kWh/kg, commercial electricity alone costs $3.64/kg before CapEx, dispensing, or storage.'}
                                    {activeScenario === 'caseFirstSolar' && 'Fatal False Negative. First Solar reached a $20B+ market cap. Its 6x manufacturing throughput and sub-$1/watt cost created the industry standard utility moat.'}
                                    {activeScenario === 'caseSolyndra' && 'Regime Shift Collapse. When polysilicon prices dropped from $300/kg to $30/kg, Solyndra was unable to compete, resulting in bankruptcy.'}
                                    {activeScenario === 'caseSunHydrogen' && 'At €1.80/kg, electricity price must stay ≤ €34.60/MWh. European industrial power of €80-140/MWh makes this cost target mathematically impossible.'}
                                    {activeScenario === 'caseKernelGuard' && 'Tri-state memory quarantine is required to prevent unvalidated model context from corrupting operational institutional state.'}
                                    {!activeScenario && 'Rigorous technical and economic due diligence requires physical boundary identities and write-ahead admission gates.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (activeRegime === DiligenceRegime.TOOL_RETRIEVAL) {
        return (
            <div className="space-y-4 bg-gradient-to-b from-blue-950/40 to-slate-900/60 border-2 border-blue-500/40 rounded-2xl p-5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-500/20 pb-3">
                    <div>
                        <h3 className="text-xl font-bold text-blue-300 flex items-center gap-2">
                            ℹ️ Regime 1: Tool &amp; Web Retrieval (RAG Baseline)
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Augmented with web indexes and market data: retrieves facts, but lacks write-ahead schema gates
                        </p>
                    </div>
                    <span className="px-3 py-1 text-xs rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 font-medium">
                        Unchecked Memory RAG
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

    if (activeRegime === DiligenceRegime.MEMORY_QUARANTINE) {
        return (
            <div className="space-y-4 bg-gradient-to-b from-purple-950/40 to-slate-900/60 border-2 border-purple-500/40 rounded-2xl p-5 shadow-xl">
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

                <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-3 text-xs text-purple-200 leading-relaxed">
                    <span className="font-bold text-purple-300">Admission Control in Action:</span> Every factual assertion is extracted, typed, and compared against verified physical schemas. Verified claims advance to truth state; unverified or conflicting assertions are quarantined.
                </div>

                <QuarantineTables
                    verifiedClaims={intelligentResults.agenticDiligence?.quarantine?.verifiedClaims}
                    quarantinedAssertions={intelligentResults.agenticDiligence?.quarantine?.quarantinedAssertions}
                />

                <div className="bg-black/30 border border-white/10 rounded-lg p-3 text-xs text-gray-400 flex items-center justify-between">
                    <span>Staging status: Claims quarantined. Switch to <strong className="text-emerald-400">Regime 3</strong> for causal price shock sensitivity and the IC interrogation punch-list.</span>
                    <button
                        type="button"
                        onClick={() => onSelectRegime(DiligenceRegime.FULL_DILIGENCE_GATE)}
                        className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded border border-emerald-500/40 font-semibold text-xs transition-colors"
                    >
                        Advance to Regime 3 →
                    </button>
                </div>
            </div>
        );
    }

    // Regime 3: Full Diligence Gate
    const showCeiling = activeScenario === 'caseNikola' || activeScenario === 'caseSunHydrogen' || selectedNiche === 'climate';

    return (
        <div className="space-y-4 bg-gradient-to-b from-slate-900/60 to-purple-950/40 border-2 border-purple-500/40 rounded-2xl p-5 shadow-xl">
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

            <QuarantineTables
                verifiedClaims={intelligentResults.agenticDiligence?.quarantine?.verifiedClaims}
                quarantinedAssertions={intelligentResults.agenticDiligence?.quarantine?.quarantinedAssertions}
            />

            {showCeiling && <ThermodynamicCeiling activeScenario={activeScenario} />}

            <CausalSensitivityView sensitivity={intelligentResults.agenticDiligence?.causalSensitivity} />

            <ICPunchList items={intelligentResults.agenticDiligence?.icPunchList || []} />
        </div>
    );
}
