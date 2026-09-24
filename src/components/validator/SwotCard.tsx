'use client';

import React from 'react';
import { SwotAnalysis } from '@/domain/types';

interface SwotCardProps {
    swotAnalysis?: SwotAnalysis;
}

export default function SwotCard({ swotAnalysis }: SwotCardProps) {
    if (!swotAnalysis) return null;

    return (
        <div className="space-y-4 bg-gradient-to-b from-indigo-900/30 to-indigo-950/50 border-2 border-indigo-500/50 rounded-2xl p-5">
            <h3 className="text-xl font-bold text-indigo-400 flex items-center gap-2">
                📊 SWOT Analysis
            </h3>

            <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-950/40 border border-green-500/30 rounded-xl p-4">
                    <h4 className="text-green-400 font-bold mb-2 flex items-center gap-2">💪 Strengths</h4>
                    <ul className="space-y-1">
                        {swotAnalysis.strengths?.map((s, i) => (
                            <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                                <span className="text-green-400">✓</span> {s}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-4">
                    <h4 className="text-red-400 font-bold mb-2 flex items-center gap-2">⚠️ Weaknesses</h4>
                    <ul className="space-y-1">
                        {swotAnalysis.weaknesses?.map((w, i) => (
                            <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                                <span className="text-red-400">✗</span> {w}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-4">
                    <h4 className="text-blue-400 font-bold mb-2 flex items-center gap-2">🚀 Opportunities</h4>
                    <ul className="space-y-1">
                        {swotAnalysis.opportunities?.map((o, i) => (
                            <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                                <span className="text-blue-400">→</span> {o}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-orange-950/40 border border-orange-500/30 rounded-xl p-4">
                    <h4 className="text-orange-400 font-bold mb-2 flex items-center gap-2">⚡ Threats</h4>
                    <ul className="space-y-1">
                        {swotAnalysis.threats?.map((t, i) => (
                            <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                                <span className="text-orange-400">!</span> {t}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
