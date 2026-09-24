'use client';

import React from 'react';
import { AnalysisResult, DeathWatchResult, AppAuditResult, EcosystemIntelResult } from '@/domain/types';
import { DiligenceRegime } from '@/domain/diligence-regime';
import AblationSwitcher from './AblationSwitcher';
import RegimeViews from './RegimeViews';
import CanaryScoreCard from './CanaryScoreCard';
import SwotCard from './SwotCard';
import BrutalRealityCard from './BrutalRealityCard';
import ProducerPanelCard from './ProducerPanelCard';
import DeathWatchCard from './DeathWatchCard';
import EcosystemIntelCard from './EcosystemIntelCard';
import AppAuditCard from './AppAuditCard';

interface AnalysisResultsProps {
    results: AnalysisResult;
    activeRegime: DiligenceRegime;
    activeScenario: string | null;
    selectedNiche: string;
    onSelectRegime: (regime: DiligenceRegime) => void;
    projectName: string;
    onProjectNameChange: (name: string) => void;
    onSendEmailReport: () => void;
    isSendingEmail: boolean;
    emailSent: boolean;
    deathWatchResults: DeathWatchResult | null;
    appAuditResults: AppAuditResult | null;
    ecosystemResults: EcosystemIntelResult | null;
}

export default function AnalysisResults({
    results,
    activeRegime,
    activeScenario,
    selectedNiche,
    onSelectRegime,
    projectName,
    onProjectNameChange,
    onSendEmailReport,
    isSendingEmail,
    emailSent,
    deathWatchResults,
    appAuditResults,
    ecosystemResults
}: AnalysisResultsProps) {
    const getTimingColor = (timing: string) => {
        switch (timing) {
            case 'good': return 'text-green-400 bg-green-500/20 border-green-500/30';
            case 'risky': return 'text-red-400 bg-red-500/20 border-red-500/30';
            default: return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
        }
    };

    return (
        <div className="space-y-6">
            {/* Email Report Bar */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={projectName}
                    onChange={(e) => onProjectNameChange(e.target.value)}
                    placeholder="Project Name (optional)"
                    className="flex-1 bg-black/30 border border-white/20 rounded-xl p-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50"
                />
                <button
                    onClick={onSendEmailReport}
                    disabled={isSendingEmail}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                        emailSent
                            ? 'bg-green-500/30 text-green-300 border border-green-500/50'
                            : 'bg-gradient-to-r from-pink-600 to-orange-500 hover:from-pink-500 hover:to-orange-400 text-white'
                    }`}
                >
                    {isSendingEmail ? '📤 Sending...' : emailSent ? '✅ Sent!' : '📧 Email Report'}
                </button>
            </div>

            {/* 4-Regime Information Architecture Ablation Switcher */}
            <AblationSwitcher activeRegime={activeRegime} onSelectRegime={onSelectRegime} />

            {/* Regime Views */}
            <RegimeViews
                activeRegime={activeRegime}
                activeScenario={activeScenario}
                selectedNiche={selectedNiche}
                intelligentResults={results}
                onSelectRegime={onSelectRegime}
            />

            {/* Producer Panel */}
            <ProducerPanelCard producerPanel={results.producerPanel} consensusScore={results.consensusScore} />

            {/* Death Watch */}
            <DeathWatchCard deathWatchResults={deathWatchResults} />

            {/* Ecosystem Intel */}
            <EcosystemIntelCard ecosystemResults={ecosystemResults} />

            {/* App Audit */}
            <AppAuditCard appAuditResults={appAuditResults} />

            {/* Canary Score */}
            <CanaryScoreCard canaryScore={results.canaryScore} />

            {/* SWOT Analysis */}
            <SwotCard swotAnalysis={results.swotAnalysis} />

            {/* Brutal Reality Check */}
            <BrutalRealityCard brutalRealityCheck={results.brutalRealityCheck} />

            {/* Timing Assessment */}
            <div className={`rounded-xl p-4 border ${getTimingColor(results.timing)}`}>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                    ⏰ Market Timing: <span className="uppercase font-bold">{results.timing}</span>
                </h3>
                <p className="text-sm text-gray-300">{results.timingReason}</p>
            </div>

            {/* Strategic Recommendation */}
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                <h3 className="text-indigo-400 font-semibold mb-2">💡 Strategic Recommendation</h3>
                <p className="text-sm text-gray-300">{results.recommendation}</p>
            </div>

            {/* Market Gaps */}
            {results.marketGaps && results.marketGaps.length > 0 && (
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                    <h3 className="text-purple-400 font-semibold mb-2">🎯 Market Gaps You Can Fill</h3>
                    <ul className="space-y-1">
                        {results.marketGaps.map((gap, idx) => (
                            <li key={idx} className="text-sm text-gray-300">• {gap}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Threats */}
            {results.threats && results.threats.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <h3 className="text-red-400 font-semibold mb-2">
                        ⚠️ Threats ({results.threats.length})
                    </h3>
                    <ul className="space-y-2">
                        {results.threats.map((threat, idx) => (
                            <li key={idx} className="text-sm">
                                <span className="text-gray-300">{threat.story?.headline || `Story ${threat.storyIndex}`}</span>
                                <p className="text-red-300/70 text-xs mt-1">{threat.reason}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Opportunities */}
            {results.opportunities && results.opportunities.length > 0 && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <h3 className="text-green-400 font-semibold mb-2">
                        💡 Opportunities ({results.opportunities.length})
                    </h3>
                    <ul className="space-y-2">
                        {results.opportunities.map((opp, idx) => (
                            <li key={idx} className="text-sm">
                                <span className="text-gray-300">{opp.story?.headline || `Story ${opp.storyIndex}`}</span>
                                <p className="text-green-300/70 text-xs mt-1">{opp.reason}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
