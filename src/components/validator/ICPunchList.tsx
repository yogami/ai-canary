'use client';

import React from 'react';
import { ICPunchListItem } from '@/domain/types';

interface ICPunchListProps {
    items: ICPunchListItem[];
}

export default function ICPunchList({ items }: ICPunchListProps) {
    if (!items || items.length === 0) return null;

    return (
        <div className="bg-gradient-to-r from-indigo-950/40 to-slate-900/60 border border-indigo-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-indigo-300 font-semibold text-sm flex items-center gap-2">
                    🎯 Investment Committee Punch-List (The IC 3)
                </h4>
                <span className="text-[10px] text-gray-400">Meeting #1 Interrogation Protocol</span>
            </div>
            <div className="space-y-3">
                {items.map((ic, idx) => (
                    <div key={idx} className="bg-black/30 border border-indigo-500/20 rounded-lg p-3">
                        <div className="flex items-start gap-2.5">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs flex items-center justify-center font-bold">
                                {idx + 1}
                            </span>
                            <div className="flex-1 space-y-1">
                                <p className="text-white text-xs font-semibold leading-relaxed">&quot;{ic.question}&quot;</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-[11px]">
                                    <p className="text-gray-400">
                                        <span className="text-indigo-400 font-medium">Target Risk:</span> {ic.targetRisk}
                                    </p>
                                    <p className="text-gray-400">
                                        <span className="text-amber-400 font-medium">Why This Matters:</span> {ic.whyItExposesFraud}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
