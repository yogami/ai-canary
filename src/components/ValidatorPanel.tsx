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

interface ProducerEvaluation {
    name: string;
    role: string;
    score: number;
    strengths: string[];
    concerns: string[];
    whatWouldMakeThemSayYes: string;
    relevantStories: number[];
}

// CB Insights-inspired Canary Score (0-1000)
interface CanaryScore {
    total: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    factors: {
        growthPotential: { score: number; reasoning: string };
        competitiveDensity: { score: number; reasoning: string };
        timingSignal: { score: number; reasoning: string };
        defensibility: { score: number; reasoning: string };
    };
    percentile: string;
    verdict: string;
}

// SWOT Analysis
interface SwotAnalysis {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
}

interface BrutalRealityCheck {
    existingSolutions: Array<{ name: string; url?: string; whyBetter: string; pricing?: string; marketPosition?: string }>;
    bigFishThreat: {
        company: string;
        timeToReplicate: string;
        whyTheyWould: string;
        whyTheyMightNot: string;
        economicIncentive?: string;
        historicalPrecedent?: string;
    };
    whyThisWillFail?: {
        unitEconomics: string;
        distributionTrap: string;
        timingProblem: string;
        defensibilityGap: string;
        expertiseRequired: string;
        marketSizeReality: string;
    };
    startupGraveyard: string[] | Array<{ name: string; raised?: string; rootCause: string; lesson?: string }>;
    brutalVerdict: string;
    survivalProbability: string;
    confidenceReasoning?: string;
    salvagePlan: {
        nichePivot: string;
        unfairAdvantage: string;
        actionableSteps: string[];
        timelineToValidation?: string;
    };
}

interface AnalysisResult {
    threats: Array<{ storyIndex: number; reason: string; story?: Story }>;
    opportunities: Array<{ storyIndex: number; reason: string; story?: Story }>;
    marketGaps: string[];
    timing: 'good' | 'neutral' | 'risky';
    timingReason: string;
    recommendation: string;
    // CB Insights-inspired features
    canaryScore?: CanaryScore;
    swotAnalysis?: SwotAnalysis;
    // Producer Panel (Film/TV only)
    producerPanel?: ProducerEvaluation[];
    consensusScore?: number;
    // Brutal Reality Check (AI/Tech only)
    brutalRealityCheck?: BrutalRealityCheck;
}

type Niche = 'ai' | 'media' | 'music' | 'gaming' | 'fintech' | 'healthcare' | 'climate';

interface NicheField {
    key: string;
    label: string;
    icon: string;
    placeholder: string;
    type: 'text' | 'url' | 'select';
    options?: string[];
}

interface NicheConfig {
    id: Niche;
    label: string;
    icon: string;
    descriptionPlaceholder: string;
    fields: NicheField[];
}

const NICHE_CONFIGS: NicheConfig[] = [
    {
        id: 'ai',
        label: 'AI/Tech',
        icon: '🤖',
        descriptionPlaceholder: 'Describe your AI/tech product, API, or SaaS...',
        fields: [
            { key: 'appUrl', label: 'App/Website URL', icon: '🌐', placeholder: 'https://your-app.com', type: 'url' },
            { key: 'githubUrl', label: 'GitHub Repo', icon: '🐙', placeholder: 'https://github.com/user/repo', type: 'url' },
            { key: 'targetAudience', label: 'Target Users', icon: '👥', placeholder: 'e.g., DevOps teams, CTOs, indie developers', type: 'text' },
            { key: 'competitors', label: 'Competitors', icon: '⚔️', placeholder: 'e.g., OpenAI, Anthropic, Hugging Face', type: 'text' },
        ]
    },
    {
        id: 'media',
        label: 'Film/TV',
        icon: '🎬',
        descriptionPlaceholder: 'Describe your film, show concept, or script idea...',
        fields: [
            { key: 'genre', label: 'Genre', icon: '🎭', placeholder: 'e.g., Sci-Fi Thriller, Drama, Documentary', type: 'text' },
            { key: 'format', label: 'Format', icon: '📺', placeholder: 'e.g., Feature Film, Series, Short', type: 'text' },
            { key: 'budget', label: 'Budget Range', icon: '💵', placeholder: 'e.g., Low (<$1M), Mid ($1-10M), High (>$10M)', type: 'text' },
            { key: 'comparables', label: 'Comparable Films', icon: '🎥', placeholder: 'e.g., Ex Machina, Black Mirror, Arrival', type: 'text' },
        ]
    },
    {
        id: 'music',
        label: 'Music',
        icon: '🎵',
        descriptionPlaceholder: 'Describe your music project, album concept, or artist brand...',
        fields: [
            { key: 'genre', label: 'Genre/Style', icon: '🎸', placeholder: 'e.g., Indie Pop, Electronic, Hip-Hop', type: 'text' },
            { key: 'demoUrl', label: 'Demo/Sample Link', icon: '🔗', placeholder: 'https://soundcloud.com/... or spotify link', type: 'url' },
            { key: 'artistType', label: 'Artist Type', icon: '🎤', placeholder: 'e.g., Solo artist, Band, Producer, Label', type: 'text' },
            { key: 'comparables', label: 'Similar Artists', icon: '👥', placeholder: 'e.g., Billie Eilish, The Weeknd, Daft Punk', type: 'text' },
        ]
    },
    {
        id: 'gaming',
        label: 'Gaming',
        icon: '🎮',
        descriptionPlaceholder: 'Describe your game concept, mechanics, and vision...',
        fields: [
            { key: 'genre', label: 'Game Genre', icon: '🕹️', placeholder: 'e.g., RPG, FPS, Puzzle, Indie', type: 'text' },
            { key: 'platform', label: 'Platform', icon: '💻', placeholder: 'e.g., PC, Mobile, Console, VR', type: 'text' },
            { key: 'demoUrl', label: 'Demo/Trailer Link', icon: '🎬', placeholder: 'https://itch.io/... or Steam page', type: 'url' },
            { key: 'comparables', label: 'Similar Games', icon: '🎯', placeholder: 'e.g., Stardew Valley, Hollow Knight, Hades', type: 'text' },
        ]
    },
    {
        id: 'fintech',
        label: 'FinTech',
        icon: '💰',
        descriptionPlaceholder: 'Describe your financial product, payment solution, or trading tool...',
        fields: [
            { key: 'appUrl', label: 'Product URL', icon: '🌐', placeholder: 'https://your-fintech.com', type: 'url' },
            { key: 'region', label: 'Target Region', icon: '🌍', placeholder: 'e.g., EU, US, APAC, Global', type: 'text' },
            { key: 'compliance', label: 'Compliance Needs', icon: '📋', placeholder: 'e.g., PSD2, SOC2, GDPR, None yet', type: 'text' },
            { key: 'competitors', label: 'Competitors', icon: '⚔️', placeholder: 'e.g., Stripe, Plaid, Revolut', type: 'text' },
        ]
    },
    {
        id: 'healthcare',
        label: 'HealthTech',
        icon: '🏥',
        descriptionPlaceholder: 'Describe your health solution, medical device, or wellness app...',
        fields: [
            { key: 'appUrl', label: 'Product URL', icon: '🌐', placeholder: 'https://your-health-app.com', type: 'url' },
            { key: 'category', label: 'Category', icon: '🩺', placeholder: 'e.g., Diagnostics, Wellness, Telehealth, Devices', type: 'text' },
            { key: 'regulatory', label: 'Regulatory Path', icon: '📋', placeholder: 'e.g., FDA, CE Mark, HIPAA, None yet', type: 'text' },
            { key: 'targetAudience', label: 'Target Users', icon: '👥', placeholder: 'e.g., Patients, Clinicians, Hospitals', type: 'text' },
        ]
    },
    {
        id: 'climate',
        label: 'Climate',
        icon: '🌍',
        descriptionPlaceholder: 'Describe your climate solution, sustainability tool, or green tech...',
        fields: [
            { key: 'sector', label: 'Sector', icon: '🌱', placeholder: 'e.g., Energy, Agriculture, Transport, Construction', type: 'text' },
            { key: 'region', label: 'Geographic Focus', icon: '📍', placeholder: 'e.g., Europe, Global, Developing markets', type: 'text' },
            { key: 'impactMetric', label: 'Impact Metric', icon: '📊', placeholder: 'e.g., CO2 reduced, Water saved, Land restored', type: 'text' },
            { key: 'targetAudience', label: 'Target Users', icon: '👥', placeholder: 'e.g., Municipalities, Farmers, Corporations', type: 'text' },
        ]
    },
];

export default function ValidatorPanel({ stories, onFilter }: ValidatorPanelProps) {
    const [selectedNiche, setSelectedNiche] = useState<Niche>('ai');
    const [projectDescription, setProjectDescription] = useState('');
    const [contextFields, setContextFields] = useState<Record<string, string>>({});
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [extractedInfo, setExtractedInfo] = useState<{
        urlData?: { title: string; description: string };
        githubData?: { name: string; description: string; topics: string[] };
    }>({});

    // Get current niche configuration
    const currentNiche = NICHE_CONFIGS.find(n => n.id === selectedNiche) || NICHE_CONFIGS[0];

    // Update context field value
    const updateContextField = (key: string, value: string) => {
        setContextFields(prev => ({ ...prev, [key]: value }));
    };

    const handleNicheChange = (niche: Niche) => {
        setSelectedNiche(niche);
        setContextFields({});
    };
    const [intelligentResults, setIntelligentResults] = useState<AnalysisResult | null>(null);
    const [analysisSource, setAnalysisSource] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const [uploadedContent, setUploadedContent] = useState<string>('');
    const [projectName, setProjectName] = useState('');
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    // Death Watch state - unique moat for failure signal tracking
    interface DeathWatchResult {
        dangerScore: number;
        dangerLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        signals: {
            domainHealth: { score: number; status: string; details: string };
            githubVelocity: { score: number; commitsLastMonth: number; trend: string; details: string };
            sslStatus: { score: number; status: string; details: string };
        };
        trajectory: string;
        recommendation: string;
    }
    const [deathWatchResults, setDeathWatchResults] = useState<DeathWatchResult | null>(null);

    // App Audit state - automated UX/Performance/Business validation
    interface AppAuditResult {
        overallScore: number;
        grade: 'A' | 'B' | 'C' | 'D' | 'F';
        uxAnalysis: {
            score: number;
            mobileReady: boolean;
            accessibilityIssues: string[];
            usabilityNotes: string[];
        };
        performanceAnalysis: {
            score: number;
            loadTime: string;
            issues: string[];
            recommendations: string[];
        };
        businessAnalysis: {
            score: number;
            problemFit: string;
            targetAudienceClarity: string;
            valuePropositionStrength: string;
            competitiveGaps: string[];
            recommendations: string[];
        };
        summary: string;
        topPriorities: string[];
    }
    const [appAuditResults, setAppAuditResults] = useState<AppAuditResult | null>(null);

    // Ecosystem Intelligence state - market signals from GitHub landscape
    interface EcosystemIntelResult {
        searchQuery: string;
        totalRepos: number;
        marketSignal: 'EMERGING' | 'GROWING' | 'HOT' | 'SATURATED' | 'DECLINING';
        competitors: {
            name: string;
            fullName: string;
            stars: number;
            forks: number;
            description: string;
            url: string;
            language: string;
        }[];
        timing: {
            reposLastMonth: number;
            growthRate: string;
            verdict: string;
        };
        techStack: { language: string; count: number }[];
        insights: string[];
        opportunities: string[];
    }
    const [ecosystemResults, setEcosystemResults] = useState<EcosystemIntelResult | null>(null);

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
        const appUrl = contextFields.appUrl || contextFields.demoUrl || '';
        const githubUrl = contextFields.githubUrl || '';

        if (!projectDescription.trim() && !appUrl.trim() && !githubUrl.trim() && !uploadedContent) {
            setError('Please provide at least a project description, URL, or documentation');
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

            // Add all context fields to description
            Object.entries(contextFields).forEach(([key, value]) => {
                if (value && key !== 'appUrl' && key !== 'githubUrl' && key !== 'demoUrl') {
                    const fieldConfig = currentNiche.fields.find(f => f.key === key);
                    const label = fieldConfig?.label || key;
                    fullDescription += `\n\n${label}: ${value}`;
                }
            });

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

                // Run Death Watch analysis in background (unique moat feature)
                const appUrl = contextFields.appUrl || contextFields.demoUrl || '';
                const githubUrl = contextFields.githubUrl || '';
                if (appUrl || githubUrl) {
                    fetch('/api/death-watch', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            domain: appUrl,
                            githubUrl: githubUrl
                        })
                    })
                        .then(res => res.json())
                        .then(deathData => {
                            if (deathData.dangerScore !== undefined) {
                                setDeathWatchResults(deathData);
                            }
                        })
                        .catch(err => console.log('Death Watch optional check failed:', err));

                    // Run App Audit analysis (UX/Performance/Business validation)
                    fetch('/api/app-audit', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            url: appUrl || githubUrl,
                            problemStatement: projectDescription
                        })
                    })
                        .then(res => res.json())
                        .then(auditData => {
                            if (auditData.overallScore !== undefined) {
                                setAppAuditResults(auditData);
                            }
                        })
                        .catch(err => console.log('App Audit check failed:', err));

                    // Run Ecosystem Intelligence (competitive landscape from GitHub)
                    fetch('/api/ecosystem-intel', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            description: projectDescription,
                            repoUrl: githubUrl
                        })
                    })
                        .then(res => res.json())
                        .then(ecoData => {
                            if (ecoData.marketSignal) {
                                setEcosystemResults(ecoData);
                            }
                        })
                        .catch(err => console.log('Ecosystem Intel failed:', err));
                }
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
                    {NICHE_CONFIGS.map((niche) => (
                        <button
                            key={niche.id}
                            onClick={() => handleNicheChange(niche.id)}
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

                {/* Dynamic Context Fields based on selected niche */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentNiche.fields.map((field) => (
                        <div key={field.key}>
                            <label className="text-sm text-gray-400 mb-2 block">
                                {field.icon} {field.label} <span className="text-gray-500">(optional)</span>
                            </label>
                            <input
                                type={field.type}
                                value={contextFields[field.key] || ''}
                                onChange={(e) => updateContextField(field.key, e.target.value)}
                                placeholder={field.placeholder}
                                className="w-full bg-black/30 border border-white/20 rounded-xl p-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50"
                            />
                        </div>
                    ))}
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
                    disabled={isAnalyzing || (!projectDescription.trim() && !Object.values(contextFields).some(v => v?.trim()) && !uploadedContent)}
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

                        {/* 🎬 PRODUCER PANEL (Film/TV only) */}
                        {intelligentResults.producerPanel && intelligentResults.producerPanel.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        🎬 Producer Panel Evaluation
                                    </h3>
                                    {intelligentResults.consensusScore !== undefined && (
                                        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-xl px-4 py-2">
                                            <span className="text-amber-300 text-sm font-medium">Consensus Score:</span>
                                            <span className={`text-2xl font-bold ${intelligentResults.consensusScore >= 7 ? 'text-green-400' :
                                                intelligentResults.consensusScore >= 5 ? 'text-yellow-400' : 'text-red-400'
                                                }`}>
                                                {intelligentResults.consensusScore}/10
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {intelligentResults.producerPanel.map((producer, idx) => (
                                        <div key={idx} className="bg-gradient-to-b from-gray-800/50 to-gray-900/50 border border-white/10 rounded-xl p-4 space-y-3">
                                            {/* Producer Header */}
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-white">{producer.name}</h4>
                                                    <p className="text-xs text-gray-400">{producer.role}</p>
                                                </div>
                                                <div className={`text-2xl font-bold ${producer.score >= 7 ? 'text-green-400' :
                                                    producer.score >= 5 ? 'text-yellow-400' : 'text-red-400'
                                                    }`}>
                                                    {producer.score}/10
                                                </div>
                                            </div>

                                            {/* Strengths */}
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

                                            {/* Concerns */}
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

                                            {/* What Would Make Them Say Yes */}
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
                        )}

                        {/* 🪦 DEATH WATCH - Unique Moat: Failure Signal Aggregation */}
                        {deathWatchResults && (
                            <div className="space-y-4 bg-gradient-to-b from-gray-900/50 to-black/50 border-2 border-gray-600/50 rounded-2xl p-5">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-gray-300 flex items-center gap-2">
                                        🪦 Death Watch
                                        <span className="text-xs font-normal text-gray-500 ml-2">(CB Insights doesn&apos;t have this)</span>
                                    </h3>
                                    <div className={`px-6 py-3 rounded-xl font-bold text-2xl ${deathWatchResults.dangerLevel === 'LOW' ? 'bg-green-500/20 text-green-400 border-2 border-green-500/40' :
                                        deathWatchResults.dangerLevel === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500/40' :
                                            deathWatchResults.dangerLevel === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border-2 border-orange-500/40' :
                                                'bg-red-500/20 text-red-400 border-2 border-red-500/40'
                                        }`}>
                                        Danger: {deathWatchResults.dangerScore}/100
                                    </div>
                                </div>

                                {/* Trajectory */}
                                <div className="bg-black/30 border border-gray-500/20 rounded-xl p-4">
                                    <p className="text-gray-300 text-lg font-medium">{deathWatchResults.trajectory}</p>
                                    <p className="text-gray-500 text-sm mt-1">{deathWatchResults.recommendation}</p>
                                </div>

                                {/* 3 Signal Indicators */}
                                <div className="grid grid-cols-3 gap-3">
                                    {/* Domain Health */}
                                    <div className={`rounded-xl p-3 border ${deathWatchResults.signals.domainHealth.status === 'healthy' ? 'bg-green-950/30 border-green-500/30' :
                                        deathWatchResults.signals.domainHealth.status === 'warning' ? 'bg-yellow-950/30 border-yellow-500/30' :
                                            deathWatchResults.signals.domainHealth.status === 'critical' ? 'bg-red-950/30 border-red-500/30' :
                                                'bg-gray-950/30 border-gray-500/30'
                                        }`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-400 font-semibold text-sm">🌐 Domain</span>
                                            <span className={`font-bold text-sm ${deathWatchResults.signals.domainHealth.status === 'healthy' ? 'text-green-400' :
                                                deathWatchResults.signals.domainHealth.status === 'warning' ? 'text-yellow-400' :
                                                    deathWatchResults.signals.domainHealth.status === 'critical' ? 'text-red-400' : 'text-gray-400'
                                                }`}>{deathWatchResults.signals.domainHealth.status.toUpperCase()}</span>
                                        </div>
                                        <p className="text-gray-500 text-xs">{deathWatchResults.signals.domainHealth.details}</p>
                                    </div>

                                    {/* GitHub Velocity */}
                                    <div className={`rounded-xl p-3 border ${deathWatchResults.signals.githubVelocity.trend === 'accelerating' ? 'bg-green-950/30 border-green-500/30' :
                                        deathWatchResults.signals.githubVelocity.trend === 'stable' ? 'bg-blue-950/30 border-blue-500/30' :
                                            deathWatchResults.signals.githubVelocity.trend === 'slowing' ? 'bg-yellow-950/30 border-yellow-500/30' :
                                                deathWatchResults.signals.githubVelocity.trend === 'stalled' ? 'bg-red-950/30 border-red-500/30' :
                                                    'bg-gray-950/30 border-gray-500/30'
                                        }`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-400 font-semibold text-sm">🐙 GitHub</span>
                                            <span className={`font-bold text-sm ${deathWatchResults.signals.githubVelocity.trend === 'accelerating' ? 'text-green-400' :
                                                deathWatchResults.signals.githubVelocity.trend === 'stable' ? 'text-blue-400' :
                                                    deathWatchResults.signals.githubVelocity.trend === 'slowing' ? 'text-yellow-400' :
                                                        deathWatchResults.signals.githubVelocity.trend === 'stalled' ? 'text-red-400' : 'text-gray-400'
                                                }`}>{deathWatchResults.signals.githubVelocity.trend.toUpperCase()}</span>
                                        </div>
                                        <p className="text-gray-500 text-xs">{deathWatchResults.signals.githubVelocity.details}</p>
                                    </div>

                                    {/* SSL Status */}
                                    <div className={`rounded-xl p-3 border ${deathWatchResults.signals.sslStatus.status === 'valid' ? 'bg-green-950/30 border-green-500/30' :
                                        deathWatchResults.signals.sslStatus.status === 'expiring' ? 'bg-yellow-950/30 border-yellow-500/30' :
                                            deathWatchResults.signals.sslStatus.status === 'expired' ? 'bg-red-950/30 border-red-500/30' :
                                                'bg-gray-950/30 border-gray-500/30'
                                        }`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-400 font-semibold text-sm">🔒 SSL</span>
                                            <span className={`font-bold text-sm ${deathWatchResults.signals.sslStatus.status === 'valid' ? 'text-green-400' :
                                                deathWatchResults.signals.sslStatus.status === 'expiring' ? 'text-yellow-400' :
                                                    deathWatchResults.signals.sslStatus.status === 'expired' ? 'text-red-400' : 'text-gray-400'
                                                }`}>{deathWatchResults.signals.sslStatus.status.toUpperCase()}</span>
                                        </div>
                                        <p className="text-gray-500 text-xs">{deathWatchResults.signals.sslStatus.details}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 🌍 ECOSYSTEM INTELLIGENCE - Competitive Landscape from GitHub */}
                        {ecosystemResults && (
                            <div className="space-y-4 bg-gradient-to-b from-emerald-900/30 to-emerald-950/50 border-2 border-emerald-500/50 rounded-2xl p-5">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                                        🌍 Ecosystem Intel
                                        <span className="text-xs font-normal text-emerald-300/60 ml-2">Market landscape</span>
                                    </h3>
                                    <div className={`px-4 py-2 rounded-xl font-bold text-lg ${ecosystemResults.marketSignal === 'EMERGING' ? 'bg-green-500/20 text-green-400 border-2 border-green-500/40' :
                                            ecosystemResults.marketSignal === 'GROWING' ? 'bg-blue-500/20 text-blue-400 border-2 border-blue-500/40' :
                                                ecosystemResults.marketSignal === 'HOT' ? 'bg-orange-500/20 text-orange-400 border-2 border-orange-500/40' :
                                                    ecosystemResults.marketSignal === 'SATURATED' ? 'bg-red-500/20 text-red-400 border-2 border-red-500/40' :
                                                        'bg-gray-500/20 text-gray-400 border-2 border-gray-500/40'
                                        }`}>
                                        {ecosystemResults.marketSignal}
                                    </div>
                                </div>

                                {/* Timing */}
                                <div className="bg-black/30 border border-emerald-500/20 rounded-xl p-4">
                                    <p className="text-emerald-200 text-lg font-medium">{ecosystemResults.timing.verdict}</p>
                                    <p className="text-emerald-400/70 text-sm mt-1">
                                        {ecosystemResults.totalRepos.toLocaleString()} similar repos • {ecosystemResults.timing.reposLastMonth} created this month
                                    </p>
                                </div>

                                {/* Top Competitors */}
                                {ecosystemResults.competitors.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-emerald-300 font-semibold text-sm">🏆 Top Competitors</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {ecosystemResults.competitors.slice(0, 4).map((comp, idx) => (
                                                <a key={idx}
                                                    href={comp.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="bg-emerald-950/40 rounded-lg p-3 border border-emerald-500/20 hover:border-emerald-500/50 transition-colors">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-emerald-300 font-medium truncate">{comp.name}</span>
                                                        <span className="text-emerald-400 text-sm">⭐ {comp.stars.toLocaleString()}</span>
                                                    </div>
                                                    <p className="text-emerald-300/50 text-xs truncate mt-1">{comp.description || 'No description'}</p>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Insights */}
                                {ecosystemResults.insights.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-emerald-300 font-semibold text-sm">💡 Market Insights</h4>
                                        <div className="space-y-1">
                                            {ecosystemResults.insights.slice(0, 3).map((insight, idx) => (
                                                <p key={idx} className="text-emerald-200/80 text-sm">{insight}</p>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Opportunities */}
                                {ecosystemResults.opportunities.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {ecosystemResults.opportunities.map((opp, idx) => (
                                            <span key={idx} className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm border border-emerald-500/30">
                                                💎 {opp}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 🔍 APP AUDIT - UX/Performance/Business Validation */}
                        {appAuditResults && (
                            <div className="space-y-4 bg-gradient-to-b from-purple-900/30 to-purple-950/50 border-2 border-purple-500/50 rounded-2xl p-5">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-purple-400 flex items-center gap-2">
                                        🔍 App Audit
                                        <span className="text-xs font-normal text-purple-300/60 ml-2">Automated validation</span>
                                    </h3>
                                    <div className={`px-6 py-3 rounded-xl font-bold text-2xl ${appAuditResults.grade === 'A' ? 'bg-green-500/20 text-green-400 border-2 border-green-500/40' :
                                        appAuditResults.grade === 'B' ? 'bg-blue-500/20 text-blue-400 border-2 border-blue-500/40' :
                                            appAuditResults.grade === 'C' ? 'bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500/40' :
                                                appAuditResults.grade === 'D' ? 'bg-orange-500/20 text-orange-400 border-2 border-orange-500/40' :
                                                    'bg-red-500/20 text-red-400 border-2 border-red-500/40'
                                        }`}>
                                        {appAuditResults.overallScore}/100 ({appAuditResults.grade})
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="bg-black/30 border border-purple-500/20 rounded-xl p-4">
                                    <p className="text-purple-200 text-lg font-medium">{appAuditResults.summary}</p>
                                </div>

                                {/* 3 Pillars */}
                                <div className="grid grid-cols-3 gap-3">
                                    {/* UX Pillar */}
                                    <div className="bg-purple-950/40 rounded-xl p-4 border border-purple-500/30">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-purple-300 font-semibold">🎨 UX</span>
                                            <span className="text-purple-400 font-bold">{appAuditResults.uxAnalysis.score}/100</span>
                                        </div>
                                        <div className="w-full bg-purple-950 rounded-full h-2 mb-2">
                                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${appAuditResults.uxAnalysis.score}%` }}></div>
                                        </div>
                                        <p className="text-purple-300/70 text-xs">
                                            {appAuditResults.uxAnalysis.mobileReady ? '✅ Mobile Ready' : '❌ Not Mobile Ready'}
                                        </p>
                                    </div>

                                    {/* Performance Pillar */}
                                    <div className="bg-purple-950/40 rounded-xl p-4 border border-purple-500/30">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-purple-300 font-semibold">⚡ Perf</span>
                                            <span className="text-purple-400 font-bold">{appAuditResults.performanceAnalysis.score}/100</span>
                                        </div>
                                        <div className="w-full bg-purple-950 rounded-full h-2 mb-2">
                                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${appAuditResults.performanceAnalysis.score}%` }}></div>
                                        </div>
                                        <p className="text-purple-300/70 text-xs">
                                            Load: {appAuditResults.performanceAnalysis.loadTime}
                                        </p>
                                    </div>

                                    {/* Business Pillar */}
                                    <div className="bg-purple-950/40 rounded-xl p-4 border border-purple-500/30">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-purple-300 font-semibold">💼 Business</span>
                                            <span className="text-purple-400 font-bold">{appAuditResults.businessAnalysis.score}/100</span>
                                        </div>
                                        <div className="w-full bg-purple-950 rounded-full h-2 mb-2">
                                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${appAuditResults.businessAnalysis.score}%` }}></div>
                                        </div>
                                        <p className="text-purple-300/70 text-xs truncate">
                                            {appAuditResults.businessAnalysis.valuePropositionStrength.slice(0, 40)}...
                                        </p>
                                    </div>
                                </div>

                                {/* Top Priorities */}
                                {appAuditResults.topPriorities.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {appAuditResults.topPriorities.map((priority, idx) => (
                                            <span key={idx} className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm border border-purple-500/30">
                                                {priority}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 🐦 CANARY SCORE - CB Insights Style Health Score */}
                        {intelligentResults.canaryScore && (
                            <div className="space-y-4 bg-gradient-to-b from-amber-900/30 to-amber-950/50 border-2 border-amber-500/50 rounded-2xl p-5">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2">
                                        🐦 Canary Score
                                    </h3>
                                    <div className={`px-6 py-3 rounded-xl font-bold text-2xl ${intelligentResults.canaryScore.grade === 'A' ? 'bg-green-500/20 text-green-400 border-2 border-green-500/40' :
                                        intelligentResults.canaryScore.grade === 'B' ? 'bg-blue-500/20 text-blue-400 border-2 border-blue-500/40' :
                                            intelligentResults.canaryScore.grade === 'C' ? 'bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500/40' :
                                                intelligentResults.canaryScore.grade === 'D' ? 'bg-orange-500/20 text-orange-400 border-2 border-orange-500/40' :
                                                    'bg-red-500/20 text-red-400 border-2 border-red-500/40'
                                        }`}>
                                        {intelligentResults.canaryScore.total}/1000 ({intelligentResults.canaryScore.grade})
                                    </div>
                                </div>

                                {/* Score Interpretation */}
                                <div className="bg-black/30 border border-amber-500/20 rounded-xl p-4">
                                    <p className="text-amber-300 text-lg font-medium">{intelligentResults.canaryScore.verdict}</p>
                                    <p className="text-gray-400 text-sm mt-1">{intelligentResults.canaryScore.percentile}</p>
                                </div>

                                {/* 4-Factor Breakdown */}
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Growth Potential */}
                                    <div className="bg-green-950/30 border border-green-500/20 rounded-xl p-3">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-green-400 font-semibold text-sm">📈 Growth Potential</span>
                                            <span className="text-green-300 font-bold">{intelligentResults.canaryScore.factors.growthPotential?.score || 0}/500</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${((intelligentResults.canaryScore.factors.growthPotential?.score || 0) / 500) * 100}%` }}></div>
                                        </div>
                                        <p className="text-gray-400 text-xs">{intelligentResults.canaryScore.factors.growthPotential?.reasoning}</p>
                                    </div>

                                    {/* Competitive Density */}
                                    <div className="bg-blue-950/30 border border-blue-500/20 rounded-xl p-3">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-blue-400 font-semibold text-sm">⚔️ Competition</span>
                                            <span className="text-blue-300 font-bold">{intelligentResults.canaryScore.factors.competitiveDensity?.score || 0}/200</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${((intelligentResults.canaryScore.factors.competitiveDensity?.score || 0) / 200) * 100}%` }}></div>
                                        </div>
                                        <p className="text-gray-400 text-xs">{intelligentResults.canaryScore.factors.competitiveDensity?.reasoning}</p>
                                    </div>

                                    {/* Timing Signal */}
                                    <div className="bg-purple-950/30 border border-purple-500/20 rounded-xl p-3">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-purple-400 font-semibold text-sm">⏰ Timing</span>
                                            <span className="text-purple-300 font-bold">{intelligentResults.canaryScore.factors.timingSignal?.score || 0}/150</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${((intelligentResults.canaryScore.factors.timingSignal?.score || 0) / 150) * 100}%` }}></div>
                                        </div>
                                        <p className="text-gray-400 text-xs">{intelligentResults.canaryScore.factors.timingSignal?.reasoning}</p>
                                    </div>

                                    {/* Defensibility */}
                                    <div className="bg-orange-950/30 border border-orange-500/20 rounded-xl p-3">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-orange-400 font-semibold text-sm">🛡️ Defensibility</span>
                                            <span className="text-orange-300 font-bold">{intelligentResults.canaryScore.factors.defensibility?.score || 0}/150</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                                            <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${((intelligentResults.canaryScore.factors.defensibility?.score || 0) / 150) * 100}%` }}></div>
                                        </div>
                                        <p className="text-gray-400 text-xs">{intelligentResults.canaryScore.factors.defensibility?.reasoning}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 📊 SWOT ANALYSIS */}
                        {intelligentResults.swotAnalysis && (
                            <div className="space-y-4 bg-gradient-to-b from-indigo-900/30 to-indigo-950/50 border-2 border-indigo-500/50 rounded-2xl p-5">
                                <h3 className="text-xl font-bold text-indigo-400 flex items-center gap-2">
                                    📊 SWOT Analysis
                                </h3>

                                <div className="grid grid-cols-2 gap-3">
                                    {/* Strengths */}
                                    <div className="bg-green-950/40 border border-green-500/30 rounded-xl p-4">
                                        <h4 className="text-green-400 font-bold mb-2 flex items-center gap-2">💪 Strengths</h4>
                                        <ul className="space-y-1">
                                            {intelligentResults.swotAnalysis.strengths?.map((s, i) => (
                                                <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                                                    <span className="text-green-400">✓</span> {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Weaknesses */}
                                    <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-4">
                                        <h4 className="text-red-400 font-bold mb-2 flex items-center gap-2">⚠️ Weaknesses</h4>
                                        <ul className="space-y-1">
                                            {intelligentResults.swotAnalysis.weaknesses?.map((w, i) => (
                                                <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                                                    <span className="text-red-400">✗</span> {w}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Opportunities */}
                                    <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-4">
                                        <h4 className="text-blue-400 font-bold mb-2 flex items-center gap-2">🚀 Opportunities</h4>
                                        <ul className="space-y-1">
                                            {intelligentResults.swotAnalysis.opportunities?.map((o, i) => (
                                                <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                                                    <span className="text-blue-400">→</span> {o}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Threats */}
                                    <div className="bg-orange-950/40 border border-orange-500/30 rounded-xl p-4">
                                        <h4 className="text-orange-400 font-bold mb-2 flex items-center gap-2">⚡ Threats</h4>
                                        <ul className="space-y-1">
                                            {intelligentResults.swotAnalysis.threats?.map((t, i) => (
                                                <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                                                    <span className="text-orange-400">!</span> {t}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 💀 BRUTAL REALITY CHECK (AI/Tech only) */}
                        {intelligentResults.brutalRealityCheck && (
                            <div className="space-y-4 bg-gradient-to-b from-red-900/30 to-red-950/50 border-2 border-red-500/50 rounded-2xl p-5">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-red-400 flex items-center gap-2">
                                        💀🩸 Brutal Reality Check 🦈🔥
                                    </h3>
                                    <div className={`px-4 py-2 rounded-xl font-bold text-lg ${intelligentResults.brutalRealityCheck.survivalProbability?.includes('50') ? 'bg-green-500/20 text-green-400 border border-green-500/40' :
                                        intelligentResults.brutalRealityCheck.survivalProbability?.includes('35') ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' :
                                            'bg-red-500/20 text-red-400 border border-red-500/40'
                                        }`}>
                                        Survival: {intelligentResults.brutalRealityCheck.survivalProbability}
                                    </div>
                                </div>

                                {/* Brutal Verdict */}
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                                    <p className="text-red-300 text-lg font-medium italic">
                                        &quot;{intelligentResults.brutalRealityCheck.brutalVerdict}&quot;
                                    </p>
                                </div>

                                {/* Existing Solutions */}
                                {intelligentResults.brutalRealityCheck.existingSolutions?.length > 0 && (
                                    <div className="bg-black/30 border border-red-500/20 rounded-xl p-4">
                                        <h4 className="text-red-400 font-semibold mb-3 flex items-center gap-2">⚠️ Already Exists (Why Bother?)</h4>
                                        <div className="space-y-2">
                                            {intelligentResults.brutalRealityCheck.existingSolutions.map((sol, idx) => (
                                                <div key={idx} className="flex items-start gap-3 bg-red-950/30 rounded-lg p-3">
                                                    <span className="text-2xl">🎯</span>
                                                    <div>
                                                        <p className="text-white font-medium">{sol.name}</p>
                                                        <p className="text-gray-400 text-sm">{sol.whyBetter}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Big Fish Threat */}
                                {intelligentResults.brutalRealityCheck.bigFishThreat && (
                                    <div className="bg-black/30 border border-orange-500/30 rounded-xl p-4">
                                        <h4 className="text-orange-400 font-semibold mb-3 flex items-center gap-2">🦈 Big Fish Can Crush You</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-orange-950/30 rounded-lg p-3">
                                                <p className="text-orange-300 text-xs mb-1">Threat From</p>
                                                <p className="text-white font-bold text-lg">{intelligentResults.brutalRealityCheck.bigFishThreat.company}</p>
                                            </div>
                                            <div className="bg-orange-950/30 rounded-lg p-3">
                                                <p className="text-orange-300 text-xs mb-1">Time to Replicate</p>
                                                <p className="text-white font-bold text-lg">{intelligentResults.brutalRealityCheck.bigFishThreat.timeToReplicate}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 text-sm">
                                            <p className="text-gray-400"><span className="text-red-400">Why they would:</span> {intelligentResults.brutalRealityCheck.bigFishThreat.whyTheyWould}</p>
                                            <p className="text-gray-400 mt-1"><span className="text-green-400">Why they might not:</span> {intelligentResults.brutalRealityCheck.bigFishThreat.whyTheyMightNot}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Startup Graveyard */}
                                {intelligentResults.brutalRealityCheck.startupGraveyard?.length > 0 && (
                                    <div className="bg-black/30 border border-gray-500/30 rounded-xl p-4">
                                        <h4 className="text-gray-400 font-semibold mb-3 flex items-center gap-2">🪦 Startup Graveyard (They Tried, They Failed)</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {intelligentResults.brutalRealityCheck.startupGraveyard.map((startup, idx) => (
                                                <span key={idx} className="bg-gray-800/50 border border-gray-600/30 rounded-lg px-3 py-1 text-gray-400 text-sm">
                                                    ⚰️ {typeof startup === 'string' ? startup : `${startup.name}${startup.raised ? ` ($${startup.raised})` : ''}`}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Salvage Plan */}
                                {intelligentResults.brutalRealityCheck.salvagePlan && (
                                    <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl p-4">
                                        <h4 className="text-green-400 font-semibold mb-3 flex items-center gap-2">🛡️ How You Might Survive</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-green-300 text-xs mb-1">🎯 Niche Pivot Suggestion</p>
                                                <p className="text-white text-sm">{intelligentResults.brutalRealityCheck.salvagePlan.nichePivot}</p>
                                            </div>
                                            <div>
                                                <p className="text-green-300 text-xs mb-1">🔥 Unfair Advantage Needed</p>
                                                <p className="text-white text-sm">{intelligentResults.brutalRealityCheck.salvagePlan.unfairAdvantage}</p>
                                            </div>
                                            {intelligentResults.brutalRealityCheck.salvagePlan.actionableSteps?.length > 0 && (
                                                <div>
                                                    <p className="text-green-300 text-xs mb-1">📋 Actionable Steps</p>
                                                    <ul className="text-white text-sm space-y-1">
                                                        {intelligentResults.brutalRealityCheck.salvagePlan.actionableSteps.map((step, idx) => (
                                                            <li key={idx}>✓ {step}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

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
