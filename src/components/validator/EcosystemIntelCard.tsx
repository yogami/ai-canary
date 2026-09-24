'use client';

import React from 'react';
import { EcosystemIntelResult } from '@/domain/types';

interface EcosystemIntelCardProps {
    ecosystemResults?: EcosystemIntelResult | null;
}

export default function EcosystemIntelCard({ ecosystemResults }: EcosystemIntelCardProps) {
    if (!ecosystemResults) return null;

    const signalBadgeColor =
        ecosystemResults.marketSignal === 'EMERGING' ? 'bg-green-500/20 text-green-400 border-2 border-green-500/40' :
        ecosystemResults.marketSignal === 'GROWING' ? 'bg-blue-500/20 text-blue-400 border-2 border-blue-500/40' :
        ecosystemResults.marketSignal === 'HOT' ? 'bg-orange-500/20 text-orange-400 border-2 border-orange-500/40' :
        ecosystemResults.marketSignal === 'SATURATED' ? 'bg-red-500/20 text-red-400 border-2 border-red-500/40' :
        'bg-gray-500/20 text-gray-400 border-2 border-gray-500/40';

    return (
        <div className="space-y-4 bg-gradient-to-b from-emerald-900/30 to-emerald-950/50 border-2 border-emerald-500/50 rounded-2xl p-5">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                    🌍 Ecosystem Intel
                    <span className="text-xs font-normal text-emerald-300/60 ml-2">Market overview</span>
                </h3>
                <div className={`px-4 py-2 rounded-xl font-bold text-lg ${signalBadgeColor}`}>
                    {ecosystemResults.marketSignal}
                </div>
            </div>

            <div className="bg-black/30 border border-emerald-500/20 rounded-xl p-4">
                <p className="text-emerald-200 text-lg font-medium">{ecosystemResults.timing.verdict}</p>
                <p className="text-emerald-400/70 text-sm mt-1">
                    {ecosystemResults.totalRepos.toLocaleString()} similar repos • {ecosystemResults.timing.reposLastMonth} created this month
                </p>
            </div>

            {ecosystemResults.competitors.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-emerald-300 font-semibold text-sm">🏆 Top Competitors</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {ecosystemResults.competitors.slice(0, 4).map((comp, idx) => (
                            <a
                                key={idx}
                                href={comp.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-emerald-950/40 rounded-lg p-3 border border-emerald-500/20 hover:border-emerald-500/50 transition-colors"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="text-emerald-300 font-medium truncate">{comp.name}</span>
                                    <span className="text-emerald-400 text-sm">⭐ {comp.stars.toLocaleString()}</span>
                                </div>
                                <p className="text-emerald-300/50 text-xs truncate mt-1">{comp.description || 'No description'}</p>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
