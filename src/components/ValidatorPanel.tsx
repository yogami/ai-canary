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
    const [selectedNiche, setSelectedNiche] = useState<Niche>('ai');
    const [projectDescription, setProjectDescription] = useState('');
    const [appUrl, setAppUrl] = useState('');
    const [githubUrl, setGithubUrl] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [competitors, setCompetitors] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [extractedInfo, setExtractedInfo] = useState<{
        urlData?: { title: string; description: string };
        githubData?: { name: string; description: string; topics: string[] };
    }>({});
    const [intelligentResults, setIntelligentResults] = useState<AnalysisResult | null>(null);
    const [analysisSource, setAnalysisSource] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const [uploadedContent, setUploadedContent] = useState<string>('');
    const [projectName, setProjectName] = useState('');
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    // Send analysis report via email
    const sendEmailReport = async () => {
        if (!intelligentResults) return;

        setIsSendingEmail(true);
        try {
            const res = await fetch('/api/email-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectName: projectName || extractedInfo.githubData?.name || extractedInfo.urlData?.title || 'My Project',
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

    // Fetch URL metadata
    const fetchUrlMetadata = async (url: string) => {
        if (!url.trim()) return null;
        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });
            return await res.json();
        } catch {
            return null;
        }
    };

    // Fetch GitHub metadata
    const fetchGitHubMetadata = async (url: string) => {
        if (!url.trim()) return null;
        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ githubUrl: url })
            });
            return await res.json();
        } catch {
            return null;
        }
    };

    // Run the full analysis
    const runAnalysis = async () => {
        if (!projectDescription.trim() && !appUrl.trim() && !githubUrl.trim() && !uploadedContent) {
            setError('Please provide at least a project description, URL, or GitHub repo');
            return;
        }

        setIsAnalyzing(true);
        setError(null);

        try {
            // Fetch metadata from URLs in parallel
            const [urlData, githubData] = await Promise.all([
                appUrl ? fetchUrlMetadata(appUrl) : null,
                githubUrl ? fetchGitHubMetadata(githubUrl) : null
            ]);

            // Store extracted info for display
            setExtractedInfo({
                urlData: urlData?.title ? urlData : undefined,
                githubData: githubData?.name ? githubData : undefined
            });

            // Build comprehensive description for LLM
            let fullDescription = projectDescription;

            if (urlData?.title) {
                fullDescription += `\n\nApp/Website: ${urlData.title}. ${urlData.description || ''}`;
            }

            if (githubData?.name) {
                fullDescription += `\n\nGitHub: ${githubData.name}. ${githubData.description || ''}`;
                if (githubData.topics?.length) {
                    fullDescription += ` Topics: ${githubData.topics.join(', ')}.`;
                }
                if (githubData.readme) {
                    fullDescription += ` README: ${githubData.readme.slice(0, 500)}`;
                }
            }

            if (uploadedContent) {
                fullDescription += `\n\nUploaded Documentation:\n${uploadedContent.slice(0, 2000)}`;
            }

            if (targetAudience) {
                fullDescription += `\n\nTarget Audience: ${targetAudience}`;
            }

            if (competitors) {
                fullDescription += `\n\nKnown Competitors: ${competitors}`;
            }

            // Call intelligent analysis API
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
            }
        } catch (err) {
            console.error('Analysis error:', err);
            setError('Failed to connect to analysis service');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const content = await file.text();
        setUploadedFileName(file.name);
        setUploadedContent(content);
    };

    const getTimingColor = (timing: string) => {
        switch (timing) {
            case 'good': return 'text-green-400 bg-green-500/20 border-green-500/30';
            case 'risky': return 'text-red-400 bg-red-500/20 border-red-500/30';
            default: return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
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
            <div className="mb-5">
                <label className="text-sm text-gray-400 mb-2 block">Industry/Niche:</label>
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

            {/* All Input Fields */}
            <div className="space-y-4">
                {/* Project Description - Required */}
                <div>
                    <label className="text-sm text-gray-400 mb-2 block">
                        📝 Project Description <span className="text-purple-400">*</span>
                    </label>
                    <textarea
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        placeholder="Describe your project, product, or idea in detail. The more context, the better the analysis..."
                        className="w-full bg-black/30 border border-white/20 rounded-xl p-4 text-white placeholder:text-gray-500 resize-none h-28 focus:outline-none focus:border-purple-500/50"
                    />
                </div>

                {/* Two-column grid for optional fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* App URL */}
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">
                            🌐 App/Website URL <span className="text-gray-500">(optional)</span>
                        </label>
                        <input
                            type="url"
                            value={appUrl}
                            onChange={(e) => setAppUrl(e.target.value)}
                            placeholder="https://your-app.com"
                            className="w-full bg-black/30 border border-white/20 rounded-xl p-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50"
                        />
                    </div>

                    {/* GitHub URL */}
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">
                            🐙 GitHub Repo URL <span className="text-gray-500">(optional)</span>
                        </label>
                        <input
                            type="url"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            placeholder="https://github.com/user/repo"
                            className="w-full bg-black/30 border border-white/20 rounded-xl p-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50"
                        />
                    </div>

                    {/* Target Audience */}
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">
                            👥 Target Audience <span className="text-gray-500">(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={targetAudience}
                            onChange={(e) => setTargetAudience(e.target.value)}
                            placeholder="e.g., CTOs at mid-size companies, indie game developers"
                            className="w-full bg-black/30 border border-white/20 rounded-xl p-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50"
                        />
                    </div>

                    {/* Known Competitors */}
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">
                            ⚔️ Known Competitors <span className="text-gray-500">(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={competitors}
                            onChange={(e) => setCompetitors(e.target.value)}
                            placeholder="e.g., Notion, Coda, Roam Research"
                            className="w-full bg-black/30 border border-white/20 rounded-xl p-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50"
                        />
                    </div>
                </div>

                {/* File Upload */}
                <div>
                    <label className="text-sm text-gray-400 mb-2 block">
                        📄 Documentation/Pitch Deck <span className="text-gray-500">(optional)</span>
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
                        className="w-full bg-black/30 border border-dashed border-white/20 rounded-xl p-4 text-gray-400 hover:border-purple-500/50 hover:text-purple-300 transition-all text-sm"
                    >
                        {uploadedFileName ? `📎 ${uploadedFileName}` : '📤 Click to upload README, pitch deck, or docs'}
                    </button>
                </div>

                {/* Analyze Button */}
                <button
                    onClick={runAnalysis}
                    disabled={isAnalyzing || (!projectDescription.trim() && !appUrl.trim() && !githubUrl.trim() && !uploadedContent)}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all text-lg"
                >
                    {isAnalyzing ? '🧠 AI Analyzing Your Project...' : '🔍 Validate My Idea'}
                </button>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
                        ⚠️ {error}
                    </div>
                )}

                {/* Extracted Info */}
                {(extractedInfo.urlData || extractedInfo.githubData) && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                        <h3 className="text-blue-400 font-semibold mb-2">📋 Extracted Context</h3>
                        {extractedInfo.urlData && (
                            <div className="mb-2">
                                <p className="text-white text-sm font-medium">🌐 {extractedInfo.urlData.title}</p>
                                <p className="text-gray-400 text-xs">{extractedInfo.urlData.description?.slice(0, 100)}</p>
                            </div>
                        )}
                        {extractedInfo.githubData && (
                            <div>
                                <p className="text-white text-sm font-medium">🐙 {extractedInfo.githubData.name}</p>
                                <p className="text-gray-400 text-xs">{extractedInfo.githubData.description}</p>
                                {extractedInfo.githubData.topics?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {extractedInfo.githubData.topics.slice(0, 5).map(topic => (
                                            <span key={topic} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                                                {topic}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Analysis Results */}
                {intelligentResults && (
                    <div className="mt-4 space-y-4">
                        {/* Email Report Button */}
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                placeholder="Project name (for email report)"
                                className="flex-1 bg-black/30 border border-white/20 rounded-xl p-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50"
                            />
                            <button
                                onClick={sendEmailReport}
                                disabled={isSendingEmail}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all ${emailSent
                                        ? 'bg-green-500/30 text-green-300 border border-green-500/50'
                                        : 'bg-gradient-to-r from-pink-600 to-orange-500 hover:from-pink-500 hover:to-orange-400 text-white'
                                    }`}
                            >
                                {isSendingEmail ? '📤 Sending...' : emailSent ? '✅ Sent!' : '📧 Email Report'}
                            </button>
                        </div>

                        {/* Timing Assessment */}
                        <div className={`rounded-xl p-4 border ${getTimingColor(intelligentResults.timing)}`}>
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                ⏰ Market Timing: <span className="uppercase font-bold">{intelligentResults.timing}</span>
                            </h3>
                            <p className="text-sm text-gray-300">{intelligentResults.timingReason}</p>
                        </div>

                        {/* Strategic Recommendation */}
                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                            <h3 className="text-indigo-400 font-semibold mb-2">💡 Strategic Recommendation</h3>
                            <p className="text-sm text-gray-300">{intelligentResults.recommendation}</p>
                        </div>

                        {/* Market Gaps */}
                        {intelligentResults.marketGaps?.length > 0 && !intelligentResults.marketGaps[0].includes('GROQ_API_KEY') && (
                            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                                <h3 className="text-purple-400 font-semibold mb-2">🎯 Market Gaps You Can Fill</h3>
                                <ul className="space-y-1">
                                    {intelligentResults.marketGaps.map((gap, idx) => (
                                        <li key={idx} className="text-sm text-gray-300">• {gap}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Threats */}
                        {intelligentResults.threats?.length > 0 && (
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
                        {intelligentResults.opportunities?.length > 0 && (
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
