'use client';

import React, { useState } from 'react';
import { ValidatorPanelProps } from '@/domain/types';
import { useValidator } from '@/hooks/useValidator';
import ScenarioGrid from './validator/ScenarioGrid';
import ValidatorForm from './validator/ValidatorForm';
import AnalysisResults from './validator/AnalysisResults';
import BenchmarkModal from './validator/BenchmarkModal';

export default function ValidatorPanel({ stories, onFilter }: ValidatorPanelProps) {
    const val = useValidator({ stories, onFilter });
    const bm = useBenchmarksModal();

    return (
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-6">
            <ValidatorHeader
                analysisSource={val.analysisSource}
                onOpenBenchmarks={bm.openBenchmarks}
            />
            <ScenarioGrid activeScenario={val.activeScenario} onSelectScenario={val.loadScenario} />
            {renderValidatorForm(val)}
            {val.error && renderError(val.error)}
            {val.intelligentResults && renderResults(val)}
            <BenchmarkModal
                isOpen={bm.showBenchmarks}
                onClose={() => bm.setShowBenchmarks(false)}
                metrics={bm.benchmarkData.metrics}
                corpus={bm.benchmarkData.corpus}
            />
        </div>
    );
}

function useBenchmarksModal() {
    const [showBenchmarks, setShowBenchmarks] = useState(false);
    const [benchmarkData, setBenchmarkData] = useState<{ metrics: any[]; corpus: any[] }>({ metrics: [], corpus: [] });

    const openBenchmarks = async () => {
        try {
            const res = await fetch('/api/benchmarks');
            if (res.ok) {
                const data = await res.json();
                setBenchmarkData({ metrics: data.metrics || [], corpus: data.corpus || [] });
            }
        } catch {
            // Silently fallback on network error
        }
        setShowBenchmarks(true);
    };

    return { showBenchmarks, setShowBenchmarks, benchmarkData, openBenchmarks };
}

function renderValidatorForm(val: any) {
    return (
        <ValidatorForm
            selectedNiche={val.selectedNiche}
            onNicheChange={val.handleNicheChange}
            projectDescription={val.projectDescription}
            onDescriptionChange={val.setProjectDescription}
            contextFields={val.contextFields}
            onContextFieldChange={val.updateContextField}
            uploadedFileName={val.uploadedFileName}
            onFileUpload={val.handleFileUpload}
            onSubmit={val.runAnalysis}
            isAnalyzing={val.isAnalyzing}
            hasContent={val.hasContent}
        />
    );
}

function ValidatorHeader({
    analysisSource,
    onOpenBenchmarks
}: {
    analysisSource: string;
    onOpenBenchmarks: () => void;
}) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 border-b border-white/10 pb-4">
            <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    🛡️ Institutional Diligence &amp; Truth Gate
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                    Deterministic admission control and causal sensitivity stress testing for early-stage investments
                </p>
            </div>
            {renderHeaderActions(analysisSource, onOpenBenchmarks)}
        </div>
    );
}

function renderHeaderActions(analysisSource: string, onOpenBenchmarks: () => void) {
    const sourceBadge = analysisSource === 'openrouter' || analysisSource === 'groq'
        ? '⚡ Frontier Engine (Claude Sonnet 5)'
        : '📊 Rule-Based Baseline';

    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={onOpenBenchmarks}
                className="text-xs bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-200 px-3 py-1 rounded-full font-medium transition-colors"
            >
                📊 Benchmark Evals
            </button>
            {analysisSource && (
                <span className="text-xs bg-purple-500/20 border border-purple-500/30 text-purple-200 px-3 py-1 rounded-full font-medium">
                    {sourceBadge}
                </span>
            )}
            <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full font-medium">
                Live Gate Active
            </span>
        </div>
    );
}

function renderError(err: string) {
    return (
        <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
            ⚠️ {err}
        </div>
    );
}

function renderResults(val: any) {
    return (
        <div className="mt-8 border-t border-white/10 pt-6">
            <AnalysisResults
                results={val.intelligentResults}
                activeRegime={val.activeRegime}
                activeScenario={val.activeScenario}
                selectedNiche={val.selectedNiche}
                onSelectRegime={val.setActiveRegime}
                projectName={val.projectName}
                onProjectNameChange={val.setProjectName}
                onSendEmailReport={val.sendEmailReport}
                isSendingEmail={val.isSendingEmail}
                emailSent={val.emailSent}
                deathWatchResults={val.deathWatchResults}
                appAuditResults={val.appAuditResults}
                ecosystemResults={val.ecosystemResults}
            />
        </div>
    );
}
