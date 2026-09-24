'use client';

import React from 'react';
import { CanaryScore } from '@/domain/types';

interface CanaryScoreCardProps {
    canaryScore?: CanaryScore;
}

export default function CanaryScoreCard({ canaryScore }: CanaryScoreCardProps) {
    if (!canaryScore) return null;

    const gradeColor =
        canaryScore.grade === 'A' ? 'bg-green-500/20 text-green-400 border-2 border-green-500/40' :
        canaryScore.grade === 'B' ? 'bg-blue-500/20 text-blue-400 border-2 border-blue-500/40' :
        canaryScore.grade === 'C' ? 'bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500/40' :
        canaryScore.grade === 'D' ? 'bg-orange-500/20 text-orange-400 border-2 border-orange-500/40' :
        'bg-red-500/20 text-red-400 border-2 border-red-500/40';

    return (
        <div className="space-y-4 bg-gradient-to-b from-amber-900/30 to-amber-950/50 border-2 border-amber-500/50 rounded-2xl p-5">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2">
                    🐦 Canary Score
                </h3>
                <div className={`px-6 py-3 rounded-xl font-bold text-2xl ${gradeColor}`}>
                    {canaryScore.total}/1000 ({canaryScore.grade})
                </div>
            </div>

            <div className="bg-black/30 border border-amber-500/20 rounded-xl p-4">
                <p className="text-amber-300 text-lg font-medium">{canaryScore.verdict}</p>
                <p className="text-gray-400 text-sm mt-1">{canaryScore.percentile}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-950/30 border border-green-500/20 rounded-xl p-3">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-green-400 font-semibold text-sm">📈 Growth Potential</span>
                        <span className="text-green-300 font-bold">{canaryScore.factors.growthPotential?.score || 0}/500</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${((canaryScore.factors.growthPotential?.score || 0) / 500) * 100}%` }}></div>
                    </div>
                    <p className="text-gray-400 text-xs">{canaryScore.factors.growthPotential?.reasoning}</p>
                </div>

                <div className="bg-blue-950/30 border border-blue-500/20 rounded-xl p-3">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-blue-400 font-semibold text-sm">⚔️ Competition</span>
                        <span className="text-blue-300 font-bold">{canaryScore.factors.competitiveDensity?.score || 0}/200</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${((canaryScore.factors.competitiveDensity?.score || 0) / 200) * 100}%` }}></div>
                    </div>
                    <p className="text-gray-400 text-xs">{canaryScore.factors.competitiveDensity?.reasoning}</p>
                </div>

                <div className="bg-purple-950/30 border border-purple-500/20 rounded-xl p-3">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-purple-400 font-semibold text-sm">⏰ Timing</span>
                        <span className="text-purple-300 font-bold">{canaryScore.factors.timingSignal?.score || 0}/150</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${((canaryScore.factors.timingSignal?.score || 0) / 150) * 100}%` }}></div>
                    </div>
                    <p className="text-gray-400 text-xs">{canaryScore.factors.timingSignal?.reasoning}</p>
                </div>

                <div className="bg-orange-950/30 border border-orange-500/20 rounded-xl p-3">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-orange-400 font-semibold text-sm">🛡️ Defensibility</span>
                        <span className="text-orange-300 font-bold">{canaryScore.factors.defensibility?.score || 0}/150</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${((canaryScore.factors.defensibility?.score || 0) / 150) * 100}%` }}></div>
                    </div>
                    <p className="text-gray-400 text-xs">{canaryScore.factors.defensibility?.reasoning}</p>
                </div>
            </div>
        </div>
    );
}
