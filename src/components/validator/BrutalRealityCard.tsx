'use client';

import React from 'react';
import { BrutalRealityCheck } from '@/domain/types';

interface BrutalRealityCardProps {
    brutalRealityCheck?: BrutalRealityCheck;
}

export default function BrutalRealityCard({ brutalRealityCheck }: BrutalRealityCardProps) {
    if (!brutalRealityCheck) return null;

    const prob = brutalRealityCheck.survivalProbability || '';
    const badgeColor =
        prob.includes('50') ? 'bg-green-500/20 text-green-400 border border-green-500/40' :
        prob.includes('35') ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' :
        'bg-red-500/20 text-red-400 border border-red-500/40';

    return (
        <div className="space-y-4 bg-gradient-to-b from-red-900/30 to-red-950/50 border-2 border-red-500/50 rounded-2xl p-5">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-red-400 flex items-center gap-2">
                    💀🩸 Brutal Reality Check 🦈🔥
                </h3>
                <div className={`px-4 py-2 rounded-xl font-bold text-lg ${badgeColor}`}>
                    Survival: {brutalRealityCheck.survivalProbability}
                </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-red-300 text-lg font-medium italic">
                    &quot;{brutalRealityCheck.brutalVerdict}&quot;
                </p>
            </div>

            {brutalRealityCheck.existingSolutions && brutalRealityCheck.existingSolutions.length > 0 && (
                <div className="bg-black/30 border border-red-500/20 rounded-xl p-4">
                    <h4 className="text-red-400 font-semibold mb-3 flex items-center gap-2">⚠️ Already Exists</h4>
                    <div className="space-y-2">
                        {brutalRealityCheck.existingSolutions.map((sol, idx) => (
                            <div key={idx} className="flex items-start gap-3 bg-red-950/30 rounded-lg p-3">
                                <span className="text-2xl">🎯</span>
                                <div>
                                    <p className="text-white font-medium">{sol.name}</p>
                                    <p className="text-gray-400 text-sm">{sol.whyBetter}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {brutalRealityCheck.bigFishThreat && (
                <div className="bg-black/30 border border-orange-500/30 rounded-xl p-4">
                    <h4 className="text-orange-400 font-semibold mb-3 flex items-center gap-2">🦈 Incumbent Threat</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-orange-950/30 rounded-lg p-3">
                            <p className="text-orange-300 text-xs mb-1">Threat From</p>
                            <p className="text-white font-bold text-lg">{brutalRealityCheck.bigFishThreat.company}</p>
                        </div>
                        <div className="bg-orange-950/30 rounded-lg p-3">
                            <p className="text-orange-300 text-xs mb-1">Time to Replicate</p>
                            <p className="text-white font-bold text-lg">{brutalRealityCheck.bigFishThreat.timeToReplicate}</p>
                        </div>
                    </div>
                    <div className="mt-3 text-sm">
                        <p className="text-gray-400"><span className="text-red-400">Why they would:</span> {brutalRealityCheck.bigFishThreat.whyTheyWould}</p>
                        <p className="text-gray-400 mt-1"><span className="text-green-400">Why they might not:</span> {brutalRealityCheck.bigFishThreat.whyTheyMightNot}</p>
                    </div>
                </div>
            )}

            {brutalRealityCheck.startupGraveyard && brutalRealityCheck.startupGraveyard.length > 0 && (
                <div className="bg-black/30 border border-gray-500/30 rounded-xl p-4">
                    <h4 className="text-gray-400 font-semibold mb-3 flex items-center gap-2">🪦 Startup Graveyard</h4>
                    <div className="flex flex-wrap gap-2">
                        {brutalRealityCheck.startupGraveyard.map((startup, idx) => (
                            <span key={idx} className="bg-gray-800/50 border border-gray-600/30 rounded-lg px-3 py-1 text-gray-400 text-sm">
                                ⚰️ {typeof startup === 'string' ? startup : `${startup.name}${startup.raised ? ` (${startup.raised})` : ''}`}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {brutalRealityCheck.salvagePlan && (
                <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl p-4">
                    <h4 className="text-green-400 font-semibold mb-3 flex items-center gap-2">🛡️ Survival Strategy</h4>
                    <div className="space-y-3">
                        <div>
                            <p className="text-green-300 text-xs mb-1">🎯 Niche Pivot Suggestion</p>
                            <p className="text-white text-sm">{brutalRealityCheck.salvagePlan.nichePivot}</p>
                        </div>
                        <div>
                            <p className="text-green-300 text-xs mb-1">🔥 Competitive Edge Needed</p>
                            <p className="text-white text-sm">{brutalRealityCheck.salvagePlan.unfairAdvantage}</p>
                        </div>
                        {brutalRealityCheck.salvagePlan.actionableSteps?.length > 0 && (
                            <div>
                                <p className="text-green-300 text-xs mb-1">📋 Actionable Steps</p>
                                <ul className="text-white text-sm space-y-1">
                                    {brutalRealityCheck.salvagePlan.actionableSteps.map((step, idx) => (
                                        <li key={idx}>✓ {step}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
