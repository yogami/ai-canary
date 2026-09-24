'use client';

import React from 'react';
import { AppAuditResult } from '@/domain/types';

interface AppAuditCardProps {
    appAuditResults?: AppAuditResult | null;
}

export default function AppAuditCard({ appAuditResults }: AppAuditCardProps) {
    if (!appAuditResults) return null;

    const gradeColor =
        appAuditResults.grade === 'A' ? 'bg-green-500/20 text-green-400 border-2 border-green-500/40' :
        appAuditResults.grade === 'B' ? 'bg-blue-500/20 text-blue-400 border-2 border-blue-500/40' :
        appAuditResults.grade === 'C' ? 'bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500/40' :
        appAuditResults.grade === 'D' ? 'bg-orange-500/20 text-orange-400 border-2 border-orange-500/40' :
        'bg-red-500/20 text-red-400 border-2 border-red-500/40';

    return (
        <div className="space-y-4 bg-gradient-to-b from-purple-900/30 to-purple-950/50 border-2 border-purple-500/50 rounded-2xl p-5">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-purple-400 flex items-center gap-2">
                    🔍 App Audit
                    <span className="text-xs font-normal text-purple-300/60 ml-2">Automated validation</span>
                </h3>
                <div className={`px-6 py-3 rounded-xl font-bold text-2xl ${gradeColor}`}>
                    {appAuditResults.overallScore}/100 ({appAuditResults.grade})
                </div>
            </div>

            <div className="bg-black/30 border border-purple-500/20 rounded-xl p-4">
                <p className="text-purple-200 text-lg font-medium">{appAuditResults.summary}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div className="bg-purple-950/40 rounded-xl p-4 border border-purple-500/30">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-purple-300 font-semibold">🎨 UX</span>
                        <span className="text-purple-400 font-bold">{appAuditResults.uxAnalysis.score}/100</span>
                    </div>
                    <div className="w-full bg-purple-950 rounded-full h-2 mb-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${appAuditResults.uxAnalysis.score}%` }}></div>
                    </div>
                    <p className="text-purple-300/70 text-xs">
                        {appAuditResults.uxAnalysis.mobileReady ? '✅ Mobile Ready' : '❌ Not Mobile Ready'}
                    </p>
                </div>

                <div className="bg-purple-950/40 rounded-xl p-4 border border-purple-500/30">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-purple-300 font-semibold">⚡ Perf</span>
                        <span className="text-purple-400 font-bold">{appAuditResults.performanceAnalysis.score}/100</span>
                    </div>
                    <div className="w-full bg-purple-950 rounded-full h-2 mb-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${appAuditResults.performanceAnalysis.score}%` }}></div>
                    </div>
                    <p className="text-purple-300/70 text-xs">
                        Load: {appAuditResults.performanceAnalysis.loadTime}
                    </p>
                </div>

                <div className="bg-purple-950/40 rounded-xl p-4 border border-purple-500/30">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-purple-300 font-semibold">💼 Business</span>
                        <span className="text-purple-400 font-bold">{appAuditResults.businessAnalysis.score}/100</span>
                    </div>
                    <div className="w-full bg-purple-950 rounded-full h-2 mb-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${appAuditResults.businessAnalysis.score}%` }}></div>
                    </div>
                    <p className="text-purple-300/70 text-xs truncate">
                        {appAuditResults.businessAnalysis.valuePropositionStrength.slice(0, 40)}...
                    </p>
                </div>
            </div>
        </div>
    );
}
