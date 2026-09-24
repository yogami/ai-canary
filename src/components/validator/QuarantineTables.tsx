'use client';

import React from 'react';
import { VerifiedClaim, QuarantinedAssertion } from '@/domain/types';

interface QuarantineTablesProps {
    verifiedClaims?: VerifiedClaim[];
    quarantinedAssertions?: QuarantinedAssertion[];
}

export default function QuarantineTables({ verifiedClaims, quarantinedAssertions }: QuarantineTablesProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Verified Claims */}
            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-emerald-400 font-semibold text-sm flex items-center gap-2">
                        <span>✅ Verified &amp; Plausible Claims</span>
                    </h4>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        Truth Gate Passed
                    </span>
                </div>
                <div className="space-y-2.5">
                    {verifiedClaims && verifiedClaims.length > 0 ? (
                        verifiedClaims.map((item, idx) => (
                            <div key={idx} className="bg-emerald-900/20 border border-emerald-500/20 rounded-lg p-2.5">
                                <p className="text-white text-xs font-medium">{item.claim}</p>
                                <p className="text-emerald-300/80 text-[11px] mt-1 flex items-start gap-1">
                                    <span className="text-emerald-400 font-bold">Basis:</span> {item.basis}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-400 text-xs italic">No verified claims logged.</p>
                    )}
                </div>
            </div>

            {/* Quarantined Assertions */}
            <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-amber-400 font-semibold text-sm flex items-center gap-2">
                        <span>🚨 Quarantined Assertions</span>
                    </h4>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                        Contradiction Flagged
                    </span>
                </div>
                <div className="space-y-2.5">
                    {quarantinedAssertions && quarantinedAssertions.length > 0 ? (
                        quarantinedAssertions.map((item, idx) => {
                            const isCritical = item.severity === 'CRITICAL';
                            const badgeClass = isCritical
                                ? 'bg-red-500/30 text-red-300 border border-red-500/40'
                                : 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/40';

                            return (
                                <div key={idx} className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-2.5">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-white text-xs font-medium">{item.assertion}</p>
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${badgeClass}`}>
                                            {item.severity}
                                        </span>
                                    </div>
                                    <p className="text-amber-300/90 text-[11px] mt-1 flex items-start gap-1">
                                        <span className="text-red-400 font-bold">Conflict:</span> {item.contradiction}
                                    </p>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-gray-400 text-xs italic">No quarantined assertions flagged.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
