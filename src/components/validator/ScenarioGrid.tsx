'use client';

import React from 'react';
import { BENCHMARK_SCENARIOS } from '@/domain/benchmark-scenarios';
import { BenchmarkScenario } from '@/domain/types';

interface ScenarioGridProps {
    activeScenario: string | null;
    onSelectScenario: (scenario: BenchmarkScenario) => void;
}

export default function ScenarioGrid({ activeScenario, onSelectScenario }: ScenarioGridProps) {
    return (
        <div className="mb-6 bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-indigo-950/40 border border-indigo-500/30 rounded-2xl p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                    <span className="text-xs uppercase tracking-wider font-bold text-indigo-300 flex items-center gap-1.5">
                        ⚡ Pre-Loaded Diligence Benchmark Cases
                    </span>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Select a scenario to stage venture claims and test deterministic admission control
                    </p>
                </div>
                <span className="text-[11px] text-gray-500">1-Click Load</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                {BENCHMARK_SCENARIOS.map((sc) => {
                    const isSelected = activeScenario === sc.id;
                    return (
                        <button
                            key={sc.id}
                            type="button"
                            onClick={() => onSelectScenario(sc)}
                            className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                                isSelected
                                    ? 'bg-indigo-950/60 border-indigo-400 ring-2 ring-indigo-500/30 shadow-md'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                            }`}
                        >
                            <div>
                                <div className="flex items-center justify-between gap-1 mb-1.5">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${sc.tagColor}`}>
                                        {sc.tag}
                                    </span>
                                    {isSelected && (
                                        <span className="text-emerald-400 text-xs font-bold">● Active</span>
                                    )}
                                </div>
                                <h4 className="text-white text-xs font-bold leading-tight mb-1">{sc.title}</h4>
                                <p className="text-gray-400 text-[11px] leading-snug line-clamp-2">{sc.summary}</p>
                            </div>
                            <span className="text-[10px] text-indigo-300/80 mt-2 font-medium">
                                {sc.sector}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
