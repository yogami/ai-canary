'use client';

import React from 'react';
import { DeathWatchResult } from '@/domain/types';

interface DeathWatchCardProps {
    deathWatchResults?: DeathWatchResult | null;
}

export default function DeathWatchCard({ deathWatchResults }: DeathWatchCardProps) {
    if (!deathWatchResults) return null;

    const dangerBadgeColor =
        deathWatchResults.dangerLevel === 'LOW' ? 'bg-green-500/20 text-green-400 border-2 border-green-500/40' :
        deathWatchResults.dangerLevel === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500/40' :
        deathWatchResults.dangerLevel === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border-2 border-orange-500/40' :
        'bg-red-500/20 text-red-400 border-2 border-red-500/40';

    return (
        <div className="space-y-4 bg-gradient-to-b from-gray-900/50 to-black/50 border-2 border-gray-600/50 rounded-2xl p-5">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-300 flex items-center gap-2">
                    🪦 Death Watch
                    <span className="text-xs font-normal text-gray-500 ml-2">(Failure Signal Aggregation)</span>
                </h3>
                <div className={`px-6 py-3 rounded-xl font-bold text-2xl ${dangerBadgeColor}`}>
                    Danger: {deathWatchResults.dangerScore}/100
                </div>
            </div>

            <div className="bg-black/30 border border-gray-500/20 rounded-xl p-4">
                <p className="text-gray-300 text-lg font-medium">{deathWatchResults.trajectory}</p>
                <p className="text-gray-500 text-sm mt-1">{deathWatchResults.recommendation}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl p-3 border bg-gray-950/30 border-gray-500/30">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 font-semibold text-sm">🌐 Domain</span>
                        <span className="font-bold text-sm text-gray-400">{deathWatchResults.signals.domainHealth.status.toUpperCase()}</span>
                    </div>
                    <p className="text-gray-500 text-xs">{deathWatchResults.signals.domainHealth.details}</p>
                </div>

                <div className="rounded-xl p-3 border bg-gray-950/30 border-gray-500/30">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 font-semibold text-sm">🐙 GitHub</span>
                        <span className="font-bold text-sm text-gray-400">{deathWatchResults.signals.githubVelocity.trend.toUpperCase()}</span>
                    </div>
                    <p className="text-gray-500 text-xs">{deathWatchResults.signals.githubVelocity.details}</p>
                </div>

                <div className="rounded-xl p-3 border bg-gray-950/30 border-gray-500/30">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 font-semibold text-sm">🔒 SSL</span>
                        <span className="font-bold text-sm text-gray-400">{deathWatchResults.signals.sslStatus.status.toUpperCase()}</span>
                    </div>
                    <p className="text-gray-500 text-xs">{deathWatchResults.signals.sslStatus.details}</p>
                </div>
            </div>
        </div>
    );
}
