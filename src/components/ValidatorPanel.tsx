'use client';

import { useState } from 'react';

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

export default function ValidatorPanel({ stories, onFilter }: ValidatorPanelProps) {
    const [projectDescription, setProjectDescription] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<{
        threats: Story[];
        opportunities: Story[];
        keywords: string[];
    } | null>(null);

    // Extract keywords from project description
    const extractKeywords = (text: string): string[] => {
        const stopWords = new Set(['a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'for', 'and', 'nor', 'but', 'or', 'yet', 'so', 'in', 'on', 'at', 'to', 'from', 'with', 'about', 'as', 'by', 'of', 'that', 'this', 'it', 'its', 'our', 'we', 'they', 'them', 'their', 'my', 'your', 'i', 'you', 'he', 'she']);

        const words = text.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.has(word));

        // Return unique keywords
        return [...new Set(words)].slice(0, 10);
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

    const analyzeProject = () => {
        if (!projectDescription.trim()) return;

        setIsAnalyzing(true);

        // Simulate brief analysis time
        setTimeout(() => {
            const keywords = extractKeywords(projectDescription);

            // Score and filter stories
            const scoredStories = stories
                .map(story => ({ story, score: scoreRelevance(story, keywords) }))
                .filter(({ score }) => score > 0)
                .sort((a, b) => b.score - a.score);

            // Categorize as threats (negative/neutral sentiment) or opportunities (positive)
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
            setIsAnalyzing(false);
        }, 500);
    };

    return (
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                🔍 Validate Your Project
            </h2>

            <div className="space-y-4">
                <div>
                    <label className="text-sm text-gray-400 mb-2 block">
                        Describe your AI project or startup idea
                    </label>
                    <textarea
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        placeholder="e.g., We're building an AI-powered code review tool that uses LLMs to detect bugs and suggest improvements..."
                        className="w-full bg-black/30 border border-white/20 rounded-xl p-4 text-white placeholder:text-gray-500 resize-none h-24 focus:outline-none focus:border-purple-500/50"
                    />
                </div>

                <button
                    onClick={analyzeProject}
                    disabled={isAnalyzing || !projectDescription.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all"
                >
                    {isAnalyzing ? '⏳ Analyzing...' : '🔍 Find Competitors & Threats'}
                </button>

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
                                No matching stories found. Try different keywords or check back later.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
