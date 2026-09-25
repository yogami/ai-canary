'use client';

import React from 'react';

interface InferenceEconomicsProps {
    activeScenario: string | null;
}

export default function InferenceEconomicsIdentity({ activeScenario }: InferenceEconomicsProps) {
    const isSpecGuard = activeScenario === 'novelSpecGuard';
    const loopTurns = isSpecGuard ? '3 turns (bounded)' : '15 - 25 turns (unbounded)';
    const claimedCost = isSpecGuard ? '$0.003 / run' : '$0.02 - $0.08 / task';
    const breakEvenTariff = isSpecGuard ? '≤ $0.050 / 1k tokens (solvent)' : '≤ $0.0022 / 1k tokens (fragile)';

    return (
        <div className="bg-slate-950/90 border border-purple-500/40 rounded-xl p-4 my-2 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-500/20 pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-base">🧠</span>
                    <div>
                        <h5 className="text-purple-300 font-bold text-xs uppercase tracking-wider">
                            Inference Loop Contribution Margin Identity
                        </h5>
                        <p className="text-[11px] text-gray-400">
                            Unit economic boundary: Multi-Turn Reasoning Tokens versus Subscription Revenue
                        </p>
                    </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Causal Economic Gate
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center mb-3">
                <div className="bg-black/40 border border-white/10 rounded-lg p-2.5">
                    <span className="text-[10px] text-gray-400 block uppercase">Reasoning Trajectory</span>
                    <span className="text-white font-mono font-bold text-sm">{loopTurns}</span>
                </div>
                <div className="bg-black/40 border border-white/10 rounded-lg p-2.5">
                    <span className="text-[10px] text-gray-400 block uppercase">Estimated Inference Cost</span>
                    <span className="text-purple-300 font-mono font-bold text-sm">{claimedCost}</span>
                </div>
                <div className="bg-black/40 border border-purple-500/30 rounded-lg p-2.5">
                    <span className="text-[10px] text-purple-300 block uppercase">Max Viable Token Tariff</span>
                    <span className="text-amber-300 font-mono font-bold text-sm">{breakEvenTariff}</span>
                </div>
            </div>

            <div className="text-[11px] text-gray-300 bg-purple-950/20 border border-purple-500/20 rounded-lg p-2.5 leading-relaxed">
                <span className="text-purple-400 font-semibold">The Diligence Gate:</span> Fixed-price SaaS subscriptions ($20/month) collapse when agents execute recursive multi-turn reasoning loops. At 15 turns per task, token burn exceeds 22,500 tokens per execution. Any pricing model without deterministic step boundaries drives gross contribution margin deeply negative as token rates exceed $0.002/1k tokens.
            </div>
        </div>
    );
}
