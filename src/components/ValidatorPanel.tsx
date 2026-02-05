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

type InputMethod = 'description' | 'url' | 'github' | 'file';

export default function ValidatorPanel({ stories, onFilter }: ValidatorPanelProps) {
    const [inputMethod, setInputMethod] = useState<InputMethod>('description');
    const [projectDescription, setProjectDescription] = useState('');
    const [appUrl, setAppUrl] = useState('');
    const [githubUrl, setGithubUrl] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [projectInfo, setProjectInfo] = useState<{
        title?: string;
        description?: string;
        topics?: string[];
    } | null>(null);
    const [results, setResults] = useState<{
        threats: Story[];
        opportunities: Story[];
        keywords: string[];
    } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Extract keywords from text
    const extractKeywords = (text: string): string[] => {
        const stopWords = new Set(['a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'for', 'and', 'nor', 'but', 'or', 'yet', 'so', 'in', 'on', 'at', 'to', 'from', 'with', 'about', 'as', 'by', 'of', 'that', 'this', 'it', 'its', 'our', 'we', 'they', 'them', 'their', 'my', 'your', 'i', 'you', 'he', 'she']);

        const words = text.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.has(word));

        return [...new Set(words)].slice(0, 15);
    };

    // Score how relevant a story is to the project
    const scoreRelevance = (story: Story, keywords: string[]): number => {
        const text = `${story.headline} ${story.summary || ''}`.toLowerCase();
        let score = 0;
        keywords.forEach(keyword => {
            if (text.includes(keyword)) score += 1;
        });
        return score;
    };

    const runAnalysis = (keywords: string[]) => {
        // Score and filter stories
        const scoredStories = stories
            .map(story => ({ story, score: scoreRelevance(story, keywords) }))
            .filter(({ score }) => score > 0)
            .sort((a, b) => b.score - a.score);

        // Categorize as threats or opportunities
        const threats = scoredStories
            .filter(({ story }) => story.sentiment === 'negative' || (story.sentimentScore && story.sentimentScore < 0.3))
            .map(({ story }) => story)
            .slice(0, 5);

        const opportunities = scoredStories
            .filter(({ story }) => story.sentiment === 'positive' || (story.sentimentScore && story.sentimentScore > 0.5))
            .map(({ story }) => story)
            .slice(0, 5);

        setResults({ threats, opportunities, keywords });
        onFilter(keywords);
    };

    const analyzeDescription = () => {
        if (!projectDescription.trim()) return;
        setIsAnalyzing(true);
        setTimeout(() => {
            const keywords = extractKeywords(projectDescription);
            runAnalysis(keywords);
            setIsAnalyzing(false);
        }, 300);
    };

    const analyzeUrl = async () => {
        if (!appUrl.trim()) return;
        setIsAnalyzing(true);
        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: appUrl })
            });
            const data = await res.json();
            setProjectInfo({ title: data.title, description: data.description });
            runAnalysis(data.keywords || []);
        } catch (error) {
            console.error('URL analysis failed:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const analyzeGithub = async () => {
        if (!githubUrl.trim()) return;
        setIsAnalyzing(true);
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
            runAnalysis(data.keywords || []);
        } catch (error) {
            console.error('GitHub analysis failed:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsAnalyzing(true);
        try {
            const content = await file.text();
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });
            const data = await res.json();
            setProjectInfo({ title: file.name, description: data.description });
            runAnalysis(data.keywords || []);
        } catch (error) {
            console.error('File analysis failed:', error);
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

    return (
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                🔍 Validate Your Project
            </h2>

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
                            Describe your AI project or startup idea
                        </label>
                        <textarea
                            value={projectDescription}
                            onChange={(e) => setProjectDescription(e.target.value)}
                            placeholder="e.g., We're building an AI-powered code review tool..."
                            className="w-full bg-black/30 border border-white/20 rounded-xl p-4 text-white placeholder:text-gray-500 resize-none h-24 focus:outline-none focus:border-purple-500/50"
                        />
                        <button
                            onClick={analyzeDescription}
                            disabled={isAnalyzing || !projectDescription.trim()}
                            className="w-full mt-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all"
                        >
                            {isAnalyzing ? '⏳ Analyzing...' : '🔍 Analyze Description'}
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
                            {isAnalyzing ? '⏳ Fetching...' : '🌐 Analyze URL'}
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
                            We&apos;ll analyze your README, description, and topics
                        </p>
                        <button
                            onClick={analyzeGithub}
                            disabled={isAnalyzing || !githubUrl.trim()}
                            className="w-full mt-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all"
                        >
                            {isAnalyzing ? '⏳ Fetching...' : '🐙 Analyze GitHub Repo'}
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
                            {isAnalyzing ? '⏳ Processing...' : '📄 Click to upload file (.md, .txt, .pdf)'}
                        </button>
                    </div>
                )}

                {/* Project Info (from URL/GitHub) */}
                {projectInfo && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                        <h3 className="text-blue-400 font-semibold mb-2">📋 Detected Project Info</h3>
                        {projectInfo.title && <p className="text-white font-medium">{projectInfo.title}</p>}
                        {projectInfo.description && <p className="text-gray-400 text-sm mt-1">{projectInfo.description}</p>}
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

                {/* Results */}
                {results && (
                    <div className="mt-4 space-y-4">
                        {/* Keywords Found */}
                        <div className="flex flex-wrap gap-2">
                            <span className="text-sm text-gray-400">Keywords:</span>
                            {results.keywords.map(kw => (
                                <span key={kw} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                                    {kw}
                                </span>
                            ))}
                        </div>

                        {/* Threats */}
                        {results.threats.length > 0 && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                <h3 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                                    ⚠️ Potential Threats ({results.threats.length})
                                </h3>
                                <ul className="space-y-2">
                                    {results.threats.map(story => (
                                        <li key={story.id} className="text-sm text-gray-300">
                                            • {story.headline.slice(0, 80)}...
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Opportunities */}
                        {results.opportunities.length > 0 && (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                                <h3 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                                    💡 Opportunities ({results.opportunities.length})
                                </h3>
                                <ul className="space-y-2">
                                    {results.opportunities.map(story => (
                                        <li key={story.id} className="text-sm text-gray-300">
                                            • {story.headline.slice(0, 80)}...
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {results.threats.length === 0 && results.opportunities.length === 0 && (
                            <div className="text-center text-gray-400 py-4">
                                No matching stories found. Try different input or check back later.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
