'use client';

import React from 'react';
import { ValidatorPanelProps } from '@/domain/types';
import { useValidator } from '@/hooks/useValidator';
import ScenarioGrid from './validator/ScenarioGrid';
import ValidatorForm from './validator/ValidatorForm';
import AnalysisResults from './validator/AnalysisResults';

export default function ValidatorPanel({ stories, onFilter }: ValidatorPanelProps) {
    const {
        selectedNiche,
        projectDescription,
        contextFields,
        isAnalyzing,
        activeScenario,
        activeRegime,
        intelligentResults,
        analysisSource,
        error,
        uploadedFileName,
        projectName,
        isSendingEmail,
        emailSent,
        deathWatchResults,
        appAuditResults,
        ecosystemResults,
        hasContent,
        setProjectDescription,
        setProjectName,
        setActiveRegime,
        updateContextField,
        handleNicheChange,
        loadScenario,
        handleFileUpload,
        runAnalysis,
        sendEmailReport
    } = useValidator({ stories, onFilter });

    const sourceBadge = analysisSource === 'openrouter' || analysisSource === 'groq'
        ? '⚡ Frontier Engine (Llama 3.3 70B)'
        : '📊 Rule-Based Baseline';

    return (
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 border-b border-white/10 pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        🛡️ Institutional Diligence &amp; Truth Gate
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">
                        Deterministic admission control and causal sensitivity stress testing for early-stage investments
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {analysisSource && (
                        <span className="text-xs bg-purple-500/20 border border-purple-500/30 text-purple-200 px-3 py-1 rounded-full font-medium">
                            {sourceBadge}
                        </span>
                    )}
                    <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full font-medium">
                        Live Gate Active
                    </span>
                </div>
            </div>

            {/* 1-Click Benchmark Scenarios */}
            <ScenarioGrid
                activeScenario={activeScenario}
                onSelectScenario={loadScenario}
            />

            {/* Form Inputs */}
            <ValidatorForm
                selectedNiche={selectedNiche}
                onNicheChange={handleNicheChange}
                projectDescription={projectDescription}
                onDescriptionChange={setProjectDescription}
                contextFields={contextFields}
                onContextFieldChange={updateContextField}
                uploadedFileName={uploadedFileName}
                onFileUpload={handleFileUpload}
                onSubmit={runAnalysis}
                isAnalyzing={isAnalyzing}
                hasContent={hasContent}
            />

            {/* Error Notification */}
            {error && (
                <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
                    ⚠️ {error}
                </div>
            )}

            {/* Analysis Results */}
            {intelligentResults && (
                <div className="mt-8 border-t border-white/10 pt-6">
                    <AnalysisResults
                        results={intelligentResults}
                        activeRegime={activeRegime}
                        activeScenario={activeScenario}
                        selectedNiche={selectedNiche}
                        onSelectRegime={setActiveRegime}
                        projectName={projectName}
                        onProjectNameChange={setProjectName}
                        onSendEmailReport={sendEmailReport}
                        isSendingEmail={isSendingEmail}
                        emailSent={emailSent}
                        deathWatchResults={deathWatchResults}
                        appAuditResults={appAuditResults}
                        ecosystemResults={ecosystemResults}
                    />
                </div>
            )}
        </div>
    );
}
