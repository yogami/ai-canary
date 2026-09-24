'use client';

import { useState } from 'react';
import {
    Niche,
    Story,
    AnalysisResult,
    BenchmarkScenario,
    DeathWatchResult,
    AppAuditResult,
    EcosystemIntelResult
} from '@/domain/types';
import { DiligenceRegime } from '@/domain/diligence-regime';
import { NICHE_CONFIGS } from '@/domain/niche-configs';

interface UseValidatorProps {
    stories: Story[];
    onFilter: (keywords: string[]) => void;
}

export function useValidator({ stories, onFilter }: UseValidatorProps) {
    const [selectedNiche, setSelectedNiche] = useState<Niche>('ai');
    const [projectDescription, setProjectDescription] = useState('');
    const [contextFields, setContextFields] = useState<Record<string, string>>({});
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [activeScenario, setActiveScenario] = useState<string | null>(null);
    const [activeRegime, setActiveRegime] = useState<DiligenceRegime>(DiligenceRegime.FULL_DILIGENCE_GATE);
    const [intelligentResults, setIntelligentResults] = useState<AnalysisResult | null>(null);
    const [analysisSource, setAnalysisSource] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const [uploadedContent, setUploadedContent] = useState<string>('');
    const [projectName, setProjectName] = useState('');
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [deathWatchResults, setDeathWatchResults] = useState<DeathWatchResult | null>(null);
    const [appAuditResults, setAppAuditResults] = useState<AppAuditResult | null>(null);
    const [ecosystemResults, setEcosystemResults] = useState<EcosystemIntelResult | null>(null);

    const updateContextField = (key: string, value: string) => {
        setContextFields(prev => ({ ...prev, [key]: value }));
    };

    const handleNicheChange = (niche: Niche) => {
        setSelectedNiche(niche);
        setContextFields({});
        setActiveScenario(null);
    };

    const loadScenario = (scenario: BenchmarkScenario) => {
        setActiveScenario(scenario.id);
        setSelectedNiche(scenario.niche);
        setContextFields(scenario.contextFields);
        setProjectDescription(scenario.description);
        setError(null);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const content = await file.text();
        setUploadedFileName(file.name);
        setUploadedContent(content);
    };

    const buildFullDescription = () => {
        let desc = projectDescription;
        if (uploadedContent) {
            desc += `\n\nUploaded Documentation:\n${uploadedContent.slice(0, 2000)}`;
        }
        const currentNiche = NICHE_CONFIGS.find(n => n.id === selectedNiche) || NICHE_CONFIGS[0];
        Object.entries(contextFields).forEach(([key, value]) => {
            if (value && key !== 'appUrl' && key !== 'githubUrl' && key !== 'demoUrl') {
                const fieldConfig = currentNiche.fields.find(f => f.key === key);
                const label = fieldConfig?.label || key;
                desc += `\n\n${label}: ${value}`;
            }
        });
        return desc;
    };

    const runAnalysis = async () => {
        const appUrl = contextFields.appUrl || contextFields.demoUrl || '';
        const githubUrl = contextFields.githubUrl || '';

        if (!projectDescription.trim() && !appUrl.trim() && !githubUrl.trim() && !uploadedContent) {
            setError('Please provide at least a project description, URL, or documentation');
            return;
        }

        setIsAnalyzing(true);
        setError(null);

        try {
            const fullDescription = buildFullDescription();

            const res = await fetch('/api/intelligent-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectDescription: fullDescription,
                    stories: stories.map(s => ({
                        headline: s.headline,
                        summary: s.summary,
                        sentiment: s.sentiment || (s.sentimentScore && s.sentimentScore > 0.3 ? 'positive' : s.sentimentScore && s.sentimentScore < -0.3 ? 'negative' : 'neutral')
                    })),
                    niche: selectedNiche
                })
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Analysis failed');
                return;
            }

            if (data.analysis) {
                setIntelligentResults(data.analysis);
                setAnalysisSource(data.source || 'unknown');

                const keywords = data.analysis.marketGaps?.flatMap((gap: string) =>
                    gap.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3)
                ) || [];
                onFilter(keywords);

                triggerBackgroundChecks(appUrl, githubUrl);
            }
        } catch (err) {
            console.error('Analysis error:', err);
            setError('Failed to connect to analysis service');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const triggerBackgroundChecks = (appUrl: string, githubUrl: string) => {
        if (!appUrl && !githubUrl) return;

        fetch('/api/death-watch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domain: appUrl, githubUrl })
        })
            .then(res => res.json())
            .then(data => { if (data.dangerScore !== undefined) setDeathWatchResults(data); })
            .catch(() => {});

        fetch('/api/app-audit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: appUrl || githubUrl, problemStatement: projectDescription })
        })
            .then(res => res.json())
            .then(data => { if (data.overallScore !== undefined) setAppAuditResults(data); })
            .catch(() => {});

        fetch('/api/ecosystem-intel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: projectDescription, repoUrl: githubUrl })
        })
            .then(res => res.json())
            .then(data => { if (data.marketSignal) setEcosystemResults(data); })
            .catch(() => {});
    };

    const sendEmailReport = async () => {
        if (!intelligentResults) return;
        setIsSendingEmail(true);
        try {
            const res = await fetch('/api/email-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectName: projectName || 'My Project',
                    timing: intelligentResults.timing,
                    timingReason: intelligentResults.timingReason,
                    recommendation: intelligentResults.recommendation,
                    marketGaps: intelligentResults.marketGaps,
                    threats: intelligentResults.threats?.map(t => ({
                        headline: t.story?.headline || `Story ${t.storyIndex}`,
                        reason: t.reason
                    })) || [],
                    opportunities: intelligentResults.opportunities?.map(o => ({
                        headline: o.story?.headline || `Story ${o.storyIndex}`,
                        reason: o.reason
                    })) || [],
                    niche: selectedNiche
                })
            });

            if (res.ok) {
                setEmailSent(true);
                setTimeout(() => setEmailSent(false), 5000);
            } else {
                setError('Failed to send email report');
            }
        } catch {
            setError('Failed to send email report');
        } finally {
            setIsSendingEmail(false);
        }
    };

    const hasContent = Boolean(
        projectDescription.trim() ||
        Object.values(contextFields).some(v => v?.trim()) ||
        uploadedContent
    );

    return {
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
    };
}
