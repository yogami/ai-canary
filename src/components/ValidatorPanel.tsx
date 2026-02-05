'use client';

import { useState, useRef } from 'react';

interface Story {
    id: string;
    headline: string;
    summary?: string;
    sentiment?: string;
    sentimentScore?: number;
    coverage?: number;
}

interface ValidatorPanelProps {
    stories: Story[];
    onFilter: (keywords: string[]) => void;
}

interface AnalysisResult {
    threats: Array<{ storyIndex: number; reason: string; story?: Story }>;
    opportunities: Array<{ storyIndex: number; reason: string; story?: Story }>;
    marketGaps: string[];
    timing: 'good' | 'neutral' | 'risky';
    timingReason: string;
    recommendation: string;
}

type InputMethod = 'description' | 'url' | 'github' | 'file';
type Niche = 'technology' | 'ai' | 'media' | 'film' | 'music' | 'gaming' | 'fintech' | 'healthcare' | 'climate';

const NICHES: { id: Niche; label: string; icon: string }[] = [
    { id: 'ai', label: 'AI/Tech', icon: '🤖' },
    { id: 'media', label: 'Media', icon: '🎬' },
    { id: 'music', label: 'Music', icon: '🎵' },
    { id: 'fintech', label: 'FinTech', icon: '💰' },
    { id: 'healthcare', label: 'Healthcare', icon: '🏥' },
    { id: 'climate', label: 'Climate', icon: '🌍' },
    { id: 'gaming', label: 'Gaming', icon: '🎮' },
];

export default function ValidatorPanel({ stories, onFilter }: ValidatorPanelProps) {
    const [inputMethod, setInputMethod] = useState<InputMethod>('description');
    const [selectedNiche, setSelectedNiche] = useState<Niche>('ai');
    const [projectDescription, setProjectDescription] = useState('');
    const [appUrl, setAppUrl] = useState('');
    const [githubUrl, setGithubUrl] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [projectInfo, setProjectInfo] = useState<{
        title?: string;
        description?: string;
        topics?: string[];
    } | null>(null);
    const [intelligentResults, setIntelligentResults] = useState<AnalysisResult | null>(null);
    const [analysisSource, setAnalysisSource] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Run intelligent LLM analysis
    const runIntelligentAnalysis = async (description: string) => {
        setIsAnalyzing(true);
        setError(null);

        try {
            const res = await fetch('/api/intelligent-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectDescription: description,
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

                // Extract keywords from market gaps for filtering
                const keywords = data.analysis.marketGaps?.flatMap((gap: string) =>
                    gap.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3)
                ) || [];
                onFilter(keywords);
            }
        } catch (err) {
            console.error('Analysis error:', err);
            setError('Failed to connect to analysis service');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const analyzeDescription = () => {
        if (!projectDescription.trim()) return;
        runIntelligentAnalysis(projectDescription);
    };

    const analyzeUrl = async () => {
        if (!appUrl.trim()) return;
        setIsAnalyzing(true);
        setError(null);
        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: appUrl })
            });
            const data = await res.json();
            setProjectInfo({ title: data.title, description: data.description });

            // Now run intelligent analysis with extracted content
            const fullDescription = `${data.title || ''} ${data.description || ''} ${(data.keywords || []).join(' ')}`;
            await runIntelligentAnalysis(fullDescription);
        } catch (err) {
            console.error('URL analysis failed:', err);
            setError('Failed to analyze URL');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const analyzeGithub = async () => {
        if (!githubUrl.trim()) return;
        setIsAnalyzing(true);
        setError(null);
        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ githubUrl })
            });
            const data = await res.json();
            setProjectInfo({
                title: data.name,
                description: data.description,
                topics: data.topics
            });

            // Build rich description from GitHub data
            const fullDescription = `${data.name || ''}: ${data.description || ''} Topics: ${(data.topics || []).join(', ')} README excerpt: ${data.readme || ''}`;
            await runIntelligentAnalysis(fullDescription);
        } catch (err) {
            console.error('GitHub analysis failed:', err);
            setError('Failed to analyze GitHub repo');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsAnalyzing(true);
        setError(null);
        try {
            const content = await file.text();
            setProjectInfo({ title: file.name, description: content.slice(0, 200) });
            await runIntelligentAnalysis(content);
        } catch (err) {
            console.error('File analysis failed:', err);
            setError('Failed to analyze file');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const inputMethods = [
        { id: 'description' as InputMethod, label: '✏️ Description', icon: '✏️' },
        { id: 'url' as InputMethod, label: '🌐 App URL', icon: '🌐' },
        { id: 'github' as InputMethod, label: '🐙 GitHub', icon: '🐙' },
        { id: 'file' as InputMethod, label: '📄 Upload', icon: '📄' },
    ];

    const getTimingColor = (timing: string) => {
        switch (timing) {
            case 'good': return 'text-green-400 bg-green-500/20';
            case 'risky': return 'text-red-400 bg-red-500/20';
            default: return 'text-yellow-400 bg-yellow-500/20';
        }
    };

    return (
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                🔍 Intelligent Project Validator
                {analysisSource && (
                    <span className="text-xs bg-purple-500/30 text-purple-300 px-2 py-1 rounded-full">
                        {analysisSource === 'groq-llama' ? '🧠 AI-Powered' : '📊 Rule-Based'}
                    </span>
                )}
            </h2>

            {/* Niche Selector */}
            <div className="mb-4">
                <label className="text-sm text-gray-400 mb-2 block">Select Your Niche:</label>
                <div className="flex flex-wrap gap-2">
                    {NICHES.map((niche) => (
                        <button
                            key={niche.id}
                            onClick={() => setSelectedNiche(niche.id)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedNiche === niche.id
                                    ? 'bg-indigo-500/40 text-indigo-200 border border-indigo-400/50'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-transparent'
                                }`}
                        >
                            {niche.icon} {niche.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Input Method Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {inputMethods.map((method) => (
                    <button
                        key={method.id}
                        onClick={() => setInputMethod(method.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${inputMethod === method.id
                                ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-transparent'
                            }`}
                    >
                        {method.label}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {/* Description Input */}
                {inputMethod === 'description' && (
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">
                            Describe your project (LLM will understand semantically)
                        </label>
                        <textarea
                            value={projectDescription}
                            onChange={(e) => setProjectDescription(e.target.value)}
                            placeholder="e.g., A smartphone-based stormwater mapping tool using GPS and IMU sensor fusion..."
                            className="w-full bg-black/30 border border-white/20 rounded-xl p-4 text-white placeholder:text-gray-500 resize-none h-32 focus:outline-none focus:border-purple-500/50"
                        />
                        <button
                            onClick={analyzeDescription}
                            disabled={isAnalyzing || !projectDescription.trim()}
                            className="w-full mt-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all"
                        >
                            {isAnalyzing ? '🧠 AI Analyzing...' : '🔍 Analyze with AI'}
                        </button>
                    </div>
                )}

                {/* URL Input */}
                {inputMethod === 'url' && (
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">
                            Enter your app or landing page URL
                        </label>
                        <input
                            type="url"
                            value={appUrl}
                            onChange={(e) => setAppUrl(e.target.value)}
                            placeholder="https://your-app.com"
                            className="w-full bg-black/30 border border-white/20 rounded-xl p-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50"
                        />
                        <button
                            onClick={analyzeUrl}
                            disabled={isAnalyzing || !appUrl.trim()}
                            className="w-full mt-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all"
                        >
                            {isAnalyzing ? '🧠 AI Analyzing...' : '🌐 Analyze URL'}
                        </button>
                    </div>
                )}

                {/* GitHub Input */}
                {inputMethod === 'github' && (
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">
                            Enter your GitHub repository URL
                        </label>
                        <input
                            type="url"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            placeholder="https://github.com/username/repo"
                            className="w-full bg-black/30 border border-white/20 rounded-xl p-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            We&apos;ll analyze your README, description, and topics with AI
                        </p>
                        <button
                            onClick={analyzeGithub}
                            disabled={isAnalyzing || !githubUrl.trim()}
                            className="w-full mt-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all"
                        >
                            {isAnalyzing ? '🧠 AI Analyzing...' : '🐙 Analyze GitHub Repo'}
                        </button>
                    </div>
                )}

                {/* File Upload */}
                {inputMethod === 'file' && (
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">
                            Upload your README, pitch deck, or documentation
                        </label>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept=".md,.txt,.pdf,.doc,.docx"
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isAnalyzing}
                            className="w-full bg-black/30 border-2 border-dashed border-white/20 rounded-xl p-8 text-gray-400 hover:border-purple-500/50 hover:text-purple-300 transition-all"
                        >
                            {isAnalyzing ? '🧠 AI Processing...' : '📄 Click to upload file (.md, .txt, .pdf)'}
                        </button>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
                        ⚠️ {error}
                    </div>
                )}

                {/* Project Info (from URL/GitHub) */}
                {projectInfo && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                        <h3 className="text-blue-400 font-semibold mb-2">📋 Detected Project</h3>
                        {projectInfo.title && <p className="text-white font-medium">{projectInfo.title}</p>}
                        {projectInfo.description && <p className="text-gray-400 text-sm mt-1">{projectInfo.description.slice(0, 150)}...</p>}
                        {projectInfo.topics && projectInfo.topics.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {projectInfo.topics.map(topic => (
                                    <span key={topic} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                                        {topic}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Intelligent Analysis Results */}
                {intelligentResults && (
                    <div className="mt-4 space-y-4">
                        {/* Timing Assessment */}
                        <div className={`rounded-xl p-4 border ${getTimingColor(intelligentResults.timing)}`}>
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                ⏰ Market Timing: <span className="uppercase">{intelligentResults.timing}</span>
                            </h3>
                            <p className="text-sm text-gray-300">{intelligentResults.timingReason}</p>
                        </div>

                        {/* Strategic Recommendation */}
                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                            <h3 className="text-indigo-400 font-semibold mb-2">💡 Strategic Recommendation</h3>
                            <p className="text-sm text-gray-300">{intelligentResults.recommendation}</p>
                        </div>

                        {/* Market Gaps */}
                        {intelligentResults.marketGaps && intelligentResults.marketGaps.length > 0 && (
                            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                                <h3 className="text-purple-400 font-semibold mb-2">🎯 Market Gaps Your Project Fills</h3>
                                <ul className="space-y-1">
                                    {intelligentResults.marketGaps.map((gap, idx) => (
                                        <li key={idx} className="text-sm text-gray-300">• {gap}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Threats */}
                        {intelligentResults.threats && intelligentResults.threats.length > 0 && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                <h3 className="text-red-400 font-semibold mb-2">
                                    ⚠️ Threats ({intelligentResults.threats.length})
                                </h3>
                                <ul className="space-y-2">
                                    {intelligentResults.threats.map((threat, idx) => (
                                        <li key={idx} className="text-sm">
                                            <span className="text-gray-300">{threat.story?.headline || `Story ${threat.storyIndex}`}</span>
                                            <p className="text-red-300/70 text-xs mt-1">{threat.reason}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Opportunities */}
                        {intelligentResults.opportunities && intelligentResults.opportunities.length > 0 && (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                                <h3 className="text-green-400 font-semibold mb-2">
                                    💡 Opportunities ({intelligentResults.opportunities.length})
                                </h3>
                                <ul className="space-y-2">
                                    {intelligentResults.opportunities.map((opp, idx) => (
                                        <li key={idx} className="text-sm">
                                            <span className="text-gray-300">{opp.story?.headline || `Story ${opp.storyIndex}`}</span>
                                            <p className="text-green-300/70 text-xs mt-1">{opp.reason}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
