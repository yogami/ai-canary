'use client';

import React from 'react';
import { CausalSensitivity } from '@/domain/types';

interface CausalSensitivityViewProps {
    sensitivity?: CausalSensitivity;
}

export default function CausalSensitivityView({ sensitivity }: CausalSensitivityViewProps) {
    if (!sensitivity) return null;

    return (
        <div className="bg-black/40 border border-purple-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-purple-300 font-semibold text-sm flex items-center gap-2">
                    ⚡ Causal Sensitivity &amp; Counter-Case Red-Teaming
                </h4>
                {sensitivity.breakEvenThreshold && (
                    <div className="text-xs bg-purple-900/40 border border-purple-500/40 text-purple-200 px-3 py-1 rounded-full">
                        <span className="text-gray-400">Break-Even Limit:</span> <strong className="text-white">{sensitivity.breakEvenThreshold}</strong>
                    </div>
                )}
            </div>

            {sensitivity.criticalAssumption && (
                <div className="bg-purple-950/40 border border-purple-500/30 rounded-lg p-3">
                    <p className="text-[11px] uppercase tracking-wider text-purple-400 font-bold mb-1">Critical Linchpin Assumption</p>
                    <p className="text-white text-xs">{sensitivity.criticalAssumption}</p>
                </div>
            )}

            {sensitivity.stressScenarios && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {sensitivity.stressScenarios.map((scenario, idx) => (
                        <div key={idx} className="bg-slate-900/60 border border-slate-700/60 rounded-lg p-3 flex flex-col justify-between">
                            <div>
                                <p className="text-slate-300 text-xs font-semibold">{scenario.parameter}</p>
                                <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-medium border border-red-500/30">
                                    Shift: {scenario.shift}
                                </span>
                            </div>
                            <p className="text-gray-300 text-xs mt-2 pt-2 border-t border-slate-800">
                                <span className="text-amber-400 font-medium">Impact:</span> {scenario.impact}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
