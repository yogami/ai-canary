'use client';

import React from 'react';
import { BenchmarkMetric } from '@/domain/kernel/admission-types';
import { HistoricalCase } from '@/services/kernel/BenchmarkService';

interface BenchmarkModalProps {
    isOpen: boolean;
    onClose: () => void;
    metrics: BenchmarkMetric[];
    corpus: HistoricalCase[];
}

export default function BenchmarkModal({ isOpen, onClose, metrics, corpus }: BenchmarkModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="bg-slate-900 border border-purple-500/30 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
                <BenchmarkHeader onClose={onClose} />
                <BenchmarkTable metrics={metrics} />
                <BenchmarkCorpusGrid corpus={corpus} />
            </div>
        </div>
    );
}

function BenchmarkHeader({ onClose }: { onClose: () => void }) {
    return (
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
            <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    📊 Empirical Diligence Benchmark &amp; Evals
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                    Audited performance across historical venture ground truth (Track A vs Track B vs Track C)
                </p>
            </div>
            <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-white px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-sm"
            >
                ✕ Close
            </button>
        </div>
    );
}

function BenchmarkTable({ metrics }: { metrics: BenchmarkMetric[] }) {
    return (
        <div className="mb-6">
            <h3 className="text-sm font-semibold text-purple-300 mb-2">Architectural Track Comparison</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-white/10 rounded-xl overflow-hidden">
                    <thead className="bg-white/5 text-gray-400 font-semibold uppercase text-[10px] tracking-wider">
                        <tr>
                            <th className="p-3">Track / Regime</th>
                            <th className="p-3">Accuracy</th>
                            <th className="p-3">False Positive</th>
                            <th className="p-3">False Negative</th>
                            <th className="p-3">Contradiction Leakage</th>
                            <th className="p-3">Latency</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-gray-300">
                        {metrics.map((m) => renderMetricRow(m))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function BenchmarkCorpusGrid({ corpus }: { corpus: HistoricalCase[] }) {
    return (
        <div>
            <h3 className="text-sm font-semibold text-purple-300 mb-2">Historical Ground-Truth Corpus</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {corpus.map((c) => renderCorpusCard(c))}
            </div>
        </div>
    );
}

function renderMetricRow(m: BenchmarkMetric) {
    const isKernel = m.track.includes('Track C');
    return (
        <tr key={m.track} className={isKernel ? 'bg-purple-950/30 font-semibold text-purple-200' : ''}>
            <td className="p-3">{m.track}</td>
            <td className="p-3 text-emerald-400">{Math.round(m.accuracy * 100)}%</td>
            <td className="p-3 text-red-400">{Math.round(m.falsePositiveRate * 100)}%</td>
            <td className="p-3">{Math.round(m.falseNegativeRate * 100)}%</td>
            <td className="p-3 text-amber-400">{Math.round(m.contradictionLeakageRate * 100)}%</td>
            <td className="p-3 text-gray-400">{m.meanLatencyMs}ms</td>
        </tr>
    );
}

function renderCorpusCard(c: HistoricalCase) {
    return (
        <div key={c.id} className="bg-black/40 border border-white/10 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between">
                <span className="font-bold text-white">{c.name}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                    c.expectedSolvent ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                }`}>
                    {c.expectedSolvent ? 'Solvent' : 'Fatal Flaw'}
                </span>
            </div>
            <p className="text-gray-400 text-[11px] leading-tight">{c.pitch}</p>
            <p className="text-gray-300 text-[11px]">
                <strong className="text-gray-500">Contradiction:</strong> {c.knownContradiction}
            </p>
        </div>
    );
}
