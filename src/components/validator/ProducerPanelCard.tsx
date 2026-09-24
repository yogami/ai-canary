'use client';

import React from 'react';
import { ProducerEvaluation } from '@/domain/types';

interface ProducerPanelCardProps {
    producerPanel?: ProducerEvaluation[];
    consensusScore?: number;
}

export default function ProducerPanelCard({ producerPanel, consensusScore }: ProducerPanelCardProps) {
    if (!producerPanel || producerPanel.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    🎬 Producer Panel Evaluation
                </h3>
                {consensusScore !== undefined && (
                    <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-xl px-4 py-2">
                        <span className="text-amber-300 text-sm font-medium">Consensus Score:</span>
                        <span className={`text-2xl font-bold ${
                            consensusScore >= 7 ? 'text-green-400' :
                            consensusScore >= 5 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                            {consensusScore}/10
                        </span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {producerPanel.map((producer, idx) => (
                    <div key={idx} className="bg-gradient-to-b from-gray-800/50 to-gray-900/50 border border-white/10 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-white">{producer.name}</h4>
                                <p className="text-xs text-gray-400">{producer.role}</p>
                            </div>
                            <div className={`text-2xl font-bold ${
                                producer.score >= 7 ? 'text-green-400' :
                                producer.score >= 5 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                                {producer.score}/10
                            </div>
                        </div>

                        {producer.strengths?.length > 0 && (
                            <div>
                                <p className="text-xs text-green-400 font-medium mb-1">✅ Strengths</p>
                                <ul className="text-xs text-gray-300 space-y-0.5">
                                    {producer.strengths.map((s, i) => (
                                        <li key={i}>• {s}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {producer.concerns?.length > 0 && (
                            <div>
                                <p className="text-xs text-red-400 font-medium mb-1">⚠️ Concerns</p>
                                <ul className="text-xs text-gray-300 space-y-0.5">
                                    {producer.concerns.map((c, i) => (
                                        <li key={i}>• {c}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {producer.whatWouldMakeThemSayYes && (
                            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-2">
                                <p className="text-xs text-indigo-400 font-medium mb-1">💡 Would say yes if...</p>
                                <p className="text-xs text-gray-300">{producer.whatWouldMakeThemSayYes}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
