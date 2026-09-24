'use client';

import React from 'react';
import { DiligenceRegime } from '@/domain/diligence-regime';

interface AblationSwitcherProps {
    activeRegime: DiligenceRegime;
    onSelectRegime: (regime: DiligenceRegime) => void;
}

export default function AblationSwitcher({ activeRegime, onSelectRegime }: AblationSwitcherProps) {
    return (
        <div className="bg-slate-950/90 border border-indigo-500/30 rounded-2xl p-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 border-b border-indigo-500/20 pb-2.5">
                <div>
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                        🔬 Information Architecture Ablation Switcher
                    </span>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Toggle architectural layers to evaluate how deterministic admission control prevents frontier model failures
                    </p>
                </div>
                <span className="text-[11px] text-indigo-400 font-mono bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-500/30">
                    Regime {activeRegime} / 3 Active
                </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                    type="button"
                    onClick={() => onSelectRegime(DiligenceRegime.RAW_MODEL)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                        activeRegime === DiligenceRegime.RAW_MODEL
                            ? 'bg-red-950/50 border-red-500 text-white shadow-md ring-1 ring-red-500/50'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                    }`}
                >
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">Regime 0</span>
                        {activeRegime === DiligenceRegime.RAW_MODEL && <span className="text-[10px] text-red-400 font-bold">● Selected</span>}
                    </div>
                    <p className="text-xs font-bold text-white mb-0.5">Raw Frontier Model</p>
                    <p className="text-[10px] text-gray-400 leading-tight">Unconstrained LLM. Sits in credulity bias.</p>
                </button>

                <button
                    type="button"
                    onClick={() => onSelectRegime(DiligenceRegime.TOOL_RETRIEVAL)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                        activeRegime === DiligenceRegime.TOOL_RETRIEVAL
                            ? 'bg-blue-950/50 border-blue-500 text-white shadow-md ring-1 ring-blue-500/50'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                    }`}
                >
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Regime 1</span>
                        {activeRegime === DiligenceRegime.TOOL_RETRIEVAL && <span className="text-[10px] text-blue-400 font-bold">● Selected</span>}
                    </div>
                    <p className="text-xs font-bold text-white mb-0.5">Tool Retrieval (RAG)</p>
                    <p className="text-[10px] text-gray-400 leading-tight">Adds web &amp; price indexes. Unchecked memory.</p>
                </button>

                <button
                    type="button"
                    onClick={() => onSelectRegime(DiligenceRegime.MEMORY_QUARANTINE)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                        activeRegime === DiligenceRegime.MEMORY_QUARANTINE
                            ? 'bg-purple-950/50 border-purple-500 text-white shadow-md ring-1 ring-purple-500/50'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                    }`}
                >
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Regime 2</span>
                        {activeRegime === DiligenceRegime.MEMORY_QUARANTINE && <span className="text-[10px] text-purple-400 font-bold">● Selected</span>}
                    </div>
                    <p className="text-xs font-bold text-white mb-0.5">Memory Quarantine</p>
                    <p className="text-[10px] text-gray-400 leading-tight">Tri-state staging. Contradiction isolation.</p>
                </button>

                <button
                    type="button"
                    onClick={() => onSelectRegime(DiligenceRegime.FULL_DILIGENCE_GATE)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                        activeRegime === DiligenceRegime.FULL_DILIGENCE_GATE
                            ? 'bg-emerald-950/50 border-emerald-500 text-white shadow-md ring-1 ring-emerald-500/50'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                    }`}
                >
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Regime 3</span>
                        {activeRegime === DiligenceRegime.FULL_DILIGENCE_GATE && <span className="text-[10px] text-emerald-400 font-bold">● Selected</span>}
                    </div>
                    <p className="text-xs font-bold text-white mb-0.5">Full Diligence Gate</p>
                    <p className="text-[10px] text-gray-400 leading-tight">Quarantine + Sensitivity + IC 3 Punch-List.</p>
                </button>
            </div>
        </div>
    );
}
