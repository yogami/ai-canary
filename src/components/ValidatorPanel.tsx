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

interface AgenticDiligence {
    quarantine?: {
        verifiedClaims?: Array<{ claim: string; basis: string; status: 'VERIFIED' | 'PLAUSIBLE' }>;
        quarantinedAssertions?: Array<{ assertion: string; contradiction: string; severity: 'CRITICAL' | 'WARNING' }>;
    };
    causalSensitivity?: {
        criticalAssumption?: string;
        stressScenarios?: Array<{ parameter: string; shift: string; impact: string }>;
        breakEvenThreshold?: string;
    };
    icPunchList?: Array<{ question: string; targetRisk: string; whyItExposesFraud: string }>;
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
    // Institutional Due Diligence Gate
    agenticDiligence?: AgenticDiligence;
    // Producer Panel (Film/TV only)
    producerPanel?: ProducerEvaluation[];
    consensusScore?: number;
    // Brutal Reality Check
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

    // Ecosystem Intelligence state: market signals from GitHub ecosystem
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

                    // Run Ecosystem Intelligence (competitive overview from GitHub)
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
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm text-gray-400">
                            📝 Project Description <span className="text-purple-400">*</span>
                        </label>
                        {/* Demo Examples Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    const demo = document.getElementById('demo-dropdown');
                                    if (demo) demo.classList.toggle('hidden');
                                }}
                                className="text-xs bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 px-3 py-1 rounded-lg border border-emerald-500/30 transition-colors"
                            >
                                📋 Demo Examples
                            </button>
                            <div id="demo-dropdown" className="hidden absolute right-0 top-8 z-50 w-72 bg-gray-900 border border-emerald-500/30 rounded-xl shadow-xl overflow-hidden">
                                <button
                                    onClick={() => {
                                        setSelectedNiche('climate');
                                        setContextFields({
                                            sector: 'Energy & Heavy Industry',
                                            region: 'Europe',
                                            impactMetric: '120,000 t CO2/yr avoided',
                                            targetAudience: 'Steelmakers, chemical plants, off-grid power developers'
                                        });
                                        setProjectDescription(`Project SunHydrogen: High-Efficiency AEM Electrolyzer

The Problem:
Current green hydrogen production costs €4.50-7.00/kg, far above the grey hydrogen fossil baseline of €1.50/kg. Existing PEM electrolyzers depend on scarce platinum group metals (iridium, platinum) and degrade rapidly under fluctuating renewable electricity.

Our Solution:
SunHydrogen develops modular Anion Exchange Membrane (AEM) water electrolysis stacks targeting unsubsidized green hydrogen at €1.80/kg.

Core Innovation:
- Zero Platinum Group Metals: Proprietary nickel-iron layered double hydroxide (NiFe-LDH) anode catalysts and cobalt-free cathode.
- Hydrocarbon Ionomer: Chemically stable anion exchange membrane operating at 60°C and 30 bar differential pressure without expensive fluorine chemistry.
- 78% Higher Heating Value (HHV) system efficiency (43 kWh/kg H2 electrical consumption).

Claimed Performance & Economics:
- Stack CapEx of €250/kW at 100 MW annual production scale.
- 80,000 operational hours stack lifetime with less than 1.5% cell degradation per 1,000 hours under intermittent solar/wind direct feeds.
- Direct solar PV coupling without intermediate battery buffering.`);
                                        document.getElementById('demo-dropdown')?.classList.add('hidden');
                                    }}
                                    className="w-full text-left px-4 py-3 text-sm text-emerald-300 hover:bg-emerald-900/30 border-b border-emerald-500/20"
                                >
                                    ⚡ SunHydrogen AEM (CleanTech / Green H₂)
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedNiche('climate');
                                        setContextFields({
                                            sector: 'Subsurface Energy & Gas',
                                            region: 'Europe & International',
                                            impactMetric: '150,000 t CO2/yr displaced',
                                            targetAudience: 'Industrial hydrogen buyers, regional gas grids'
                                        });
                                        setProjectDescription(`TerraH2: Commercial Exploration of Natural Geologic Hydrogen

The Problem:
Manufactured green hydrogen requires 50 to 55 kWh of electricity per kilogram, forcing levelized production costs above €5.00/kg in Europe. Blue hydrogen requires methane feedstock and carbon capture infrastructure.

Our Solution:
TerraH2 drills and produces naturally occurring white hydrogen generated by continuous subsurface water-rock reactions, completely bypassing electrolyzers and external electricity inputs.

Core Claims:
- Reaction Mechanism: Natural serpentinization of iron-rich ophiolitic mantle rocks and radiolysis generating 96% pure continuous hydrogen accumulations.
- Production Economics: Claimed wellhead extraction cost below $1.00/kg H2, competing directly with incumbent fossil grey hydrogen ($1.50/kg).
- Resource Scale: Claims a continuous, self-renewing subsurface accumulation supporting 20+ years of commercial production without depletion.`);
                                        document.getElementById('demo-dropdown')?.classList.add('hidden');
                                    }}
                                    className="w-full text-left px-4 py-3 text-sm text-emerald-300 hover:bg-emerald-900/30 border-b border-emerald-500/20"
                                >
                                    🌍 Geologic Hydrogen (Subsurface H₂)
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedNiche('climate');
                                        setContextFields({
                                            sector: 'Construction Materials',
                                            region: 'Europe & North America',
                                            impactMetric: '320 kg CO2 / t concrete',
                                            targetAudience: 'Precast concrete plants, structural contractors'
                                        });
                                        setProjectDescription(`CarbonLock Materials: Slag Mineralization for Precast Concrete

The Problem:
Standard Ordinary Portland Cement (OPC) is responsible for 8% of global greenhouse gas emissions. Clean alternatives require high curing heat or exotic chemicals that increase costs by 30-50%.

Our Solution:
CarbonLock sequesters industrial flue-gas CO2 directly into precast structural concrete using industrial steel slag and ground granulated blast-furnace slag (GGBFS).

Core Innovation:
- Accelerated Aqueous Carbonation: Consumes raw, unpurified flue gas (12-15% CO2) at ambient temperature and pressure.
- Cement Clinker Displacement: Replaces 70% of standard Portland cement clinker while achieving 50 MPa 28-day compressive strength.
- Permanent Thermodynamic Mineralization: Traps CO2 as stable calcium and magnesium carbonates with 1,000+ year permanence.

Claimed Performance & Economics:
- Net carbon negative: Permanently traps 320 kg CO2 per metric tonne of precast concrete.
- Green premium under 3% compared to standard European C30/37 structural precast beams.
- Certified compliant with European EN 206 and ASTM C150 durability standards.`);
                                        document.getElementById('demo-dropdown')?.classList.add('hidden');
                                    }}
                                    className="w-full text-left px-4 py-3 text-sm text-emerald-300 hover:bg-emerald-900/30 border-b border-emerald-500/20"
                                >
                                    🧱 CarbonLock Slag (CleanTech / Mineralization)
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedNiche('ai');
                                        setContextFields({
                                            appUrl: 'https://agent-trust-protocol-production.up.railway.app',
                                            githubUrl: 'https://github.com/yogami/agent-kernel',
                                            targetAudience: 'Autonomous agent engineers, enterprise AI compliance teams',
                                            competitors: 'LangChain, AutoGen, CrewAI'
                                        });
                                        setProjectDescription(`KernelGuard: Deterministic Agent Trust & Truth Quarantine Harness

The Problem:
Frontier LLM agents hallucinate and make unauthorized state updates in autonomous workflows. Existing frameworks (LangChain, AutoGen) provide prompt abstractions but lack deterministic operational boundaries, leading to catastrophic failure in enterprise production.

Our Solution:
KernelGuard is a deterministic execution harness and truth quarantine layer that isolates raw LLM reasoning from permanent operational state.

Core Innovation:
- Tri-State Operational Machine: Separates uncommitted workspace context from institutional truth using deterministic policy gates.
- Memory & Contradiction Quarantine: Intercepts and validates candidate claims against verified schemas before permitting long-term memory promotions.
- Causal Sensitivity Gate: Enforces state and token budgets, terminating run-away agent loops with deterministic tripwires.

Value Proposition & Metrics:
- Zero unauthorized memory mutations on production pipelines.
- Verifiable cryptographic audit trail for enterprise regulatory compliance and security reviews.`);
                                        document.getElementById('demo-dropdown')?.classList.add('hidden');
                                    }}
                                    className="w-full text-left px-4 py-3 text-sm text-emerald-300 hover:bg-emerald-900/30 border-b border-emerald-500/20"
                                >
                                    🤖 KernelGuard (Agent Trust Harness)
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedNiche('climate');
                                        setContextFields({
                                            sector: 'Water & Urban Infrastructure',
                                            region: 'Europe & Global',
                                            impactMetric: 'Stormwater runoff mitigation',
                                            targetAudience: 'Municipalities, farmers, land surveyors'
                                        });
                                        setProjectDescription(`Microcatchment Pro: Smartphone Field Surveying Tool

The Problem:
Stormwater infrastructure is failing. Cities face increasing flood risks, yet understanding where water actually flows on a property or site remains expensive and inaccessible. Traditional surveys cost €5,000-15,000 for LiDAR or drone mapping, while standalone smartphone GPS has a 5-15m error margin.

Our Solution:
Microcatchment Pro is a smartphone-based field surveying tool that enables anyone to create engineering-grade site maps by walking the perimeter of an area.

Core Innovation: VIAP (Visual-Inertial Anchor Protocol)
- Boundary Planning: User plots approximate boundary on satellite imagery.
- Anchor Snapping: User physically walks to anchor points and snaps precise positions.
- Sensor Fusion: Combines GPS global positioning with IMU local precision and camera visual verification.
- Output: Precise boundary polygon, calculated area, coverage heatmap.`);
                                        document.getElementById('demo-dropdown')?.classList.add('hidden');
                                    }}
                                    className="w-full text-left px-4 py-3 text-sm text-emerald-300 hover:bg-emerald-900/30"
                                >
                                    🌊 Microcatchment Pro (Stormwater)
                                </button>
                            </div>
                        </div>
                    </div>
                    <textarea
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        placeholder="Describe your project, product, or idea in detail. The more context, the better the analysis..."
                        className="w-full bg-black/30 border border-white/20 rounded-xl p-4 text-white placeholder:text-gray-500 resize-none h-28 focus:outline-none focus:border-purple-500/50"
                    />
                </div>

                {/* Context Fields based on selected niche */}
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

                        {/* 🌍 ECOSYSTEM INTELLIGENCE: Competitive Overview from GitHub */}
                        {ecosystemResults && (
                            <div className="space-y-4 bg-gradient-to-b from-emerald-900/30 to-emerald-950/50 border-2 border-emerald-500/50 rounded-2xl p-5">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                                        🌍 Ecosystem Intel
                                        <span className="text-xs font-normal text-emerald-300/60 ml-2">Market overview</span>
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

                        {/* 🛡️ INSTITUTIONAL TRUTH & CONTRADICTION QUARANTINE */}
                        {intelligentResults.agenticDiligence && (
                            <div className="space-y-4 bg-gradient-to-b from-slate-900/60 to-purple-950/40 border-2 border-purple-500/40 rounded-2xl p-5 shadow-xl">
                                <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
                                    <div>
                                        <h3 className="text-xl font-bold text-purple-300 flex items-center gap-2">
                                            🛡️ Institutional Truth & Contradiction Quarantine
                                        </h3>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Venture diligence gate: physical boundaries, levelized cost models, and counter-case red-teaming
                                        </p>
                                    </div>
                                    <span className="px-3 py-1 text-xs rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 font-medium">
                                        Institutional Diligence Protocol
                                    </span>
                                </div>

                                {/* 1. Truth & Contradiction Quarantine */}
                                {intelligentResults.agenticDiligence.quarantine && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Verified Claims */}
                                        <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-emerald-400 font-semibold text-sm flex items-center gap-2">
                                                    <span>✅ Verified & Plausible Claims</span>
                                                </h4>
                                                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                                                    Truth Gate Passed
                                                </span>
                                            </div>
                                            <div className="space-y-2.5">
                                                {intelligentResults.agenticDiligence.quarantine.verifiedClaims?.map((item, idx) => (
                                                    <div key={idx} className="bg-emerald-900/20 border border-emerald-500/20 rounded-lg p-2.5">
                                                        <p className="text-white text-xs font-medium">{item.claim}</p>
                                                        <p className="text-emerald-300/80 text-[11px] mt-1 flex items-start gap-1">
                                                            <span className="text-emerald-400 font-bold">Basis:</span> {item.basis}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Quarantined Assertions */}
                                        <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-amber-400 font-semibold text-sm flex items-center gap-2">
                                                    <span>🚨 Quarantined Assertions</span>
                                                </h4>
                                                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                                                    Contradiction Flagged
                                                </span>
                                            </div>
                                            <div className="space-y-2.5">
                                                {intelligentResults.agenticDiligence.quarantine.quarantinedAssertions?.map((item, idx) => (
                                                    <div key={idx} className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-2.5">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <p className="text-white text-xs font-medium">{item.assertion}</p>
                                                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${item.severity === 'CRITICAL' ? 'bg-red-500/30 text-red-300 border border-red-500/40' : 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/40'}`}>
                                                                {item.severity}
                                                            </span>
                                                        </div>
                                                        <p className="text-amber-300/90 text-[11px] mt-1 flex items-start gap-1">
                                                            <span className="text-red-400 font-bold">Conflict:</span> {item.contradiction}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 2. Causal Sensitivity & Red-Teaming */}
                                {intelligentResults.agenticDiligence.causalSensitivity && (
                                    <div className="bg-black/40 border border-purple-500/30 rounded-xl p-4 space-y-3">
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <h4 className="text-purple-300 font-semibold text-sm flex items-center gap-2">
                                                ⚡ Causal Sensitivity & Counter-Case Red-Teaming
                                            </h4>
                                            {intelligentResults.agenticDiligence.causalSensitivity.breakEvenThreshold && (
                                                <div className="text-xs bg-purple-900/40 border border-purple-500/40 text-purple-200 px-3 py-1 rounded-full">
                                                    <span className="text-gray-400">Break-Even Limit:</span> <strong className="text-white">{intelligentResults.agenticDiligence.causalSensitivity.breakEvenThreshold}</strong>
                                                </div>
                                            )}
                                        </div>

                                        {intelligentResults.agenticDiligence.causalSensitivity.criticalAssumption && (
                                            <div className="bg-purple-950/40 border border-purple-500/30 rounded-lg p-3">
                                                <p className="text-[11px] uppercase tracking-wider text-purple-400 font-bold mb-1">Critical Linchpin Assumption</p>
                                                <p className="text-white text-xs">{intelligentResults.agenticDiligence.causalSensitivity.criticalAssumption}</p>
                                            </div>
                                        )}

                                        {intelligentResults.agenticDiligence.causalSensitivity.stressScenarios && (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                {intelligentResults.agenticDiligence.causalSensitivity.stressScenarios.map((scenario, idx) => (
                                                    <div key={idx} className="bg-slate-900/60 border border-slate-700/60 rounded-lg p-3 flex flex-col justify-between">
                                                        <div>
                                                            <p className="text-slate-300 text-xs font-semibold">{scenario.parameter}</p>
                                                            <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-medium border border-red-500/30">
                                                                Shift: {scenario.shift}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-300 text-xs mt-2 pt-2 border-t border-slate-800">
                                                            <span className="text-amber-400 font-medium">Impact:</span> {scenario.impact}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* 3. Investment Committee Punch-List */}
                                {intelligentResults.agenticDiligence.icPunchList && intelligentResults.agenticDiligence.icPunchList.length > 0 && (
                                    <div className="bg-gradient-to-r from-indigo-950/40 to-slate-900/60 border border-indigo-500/30 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-indigo-300 font-semibold text-sm flex items-center gap-2">
                                                🎯 Investment Committee Punch-List (The IC 3)
                                            </h4>
                                            <span className="text-[10px] text-gray-400">Meeting #1 Interrogation Protocol</span>
                                        </div>
                                        <div className="space-y-3">
                                            {intelligentResults.agenticDiligence.icPunchList.map((ic, idx) => (
                                                <div key={idx} className="bg-black/30 border border-indigo-500/20 rounded-lg p-3">
                                                    <div className="flex items-start gap-2.5">
                                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs flex items-center justify-center font-bold">
                                                            {idx + 1}
                                                        </span>
                                                        <div className="flex-1 space-y-1">
                                                            <p className="text-white text-xs font-semibold leading-relaxed">&quot;{ic.question}&quot;</p>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-[11px]">
                                                                <p className="text-gray-400">
                                                                    <span className="text-indigo-400 font-medium">Target Risk:</span> {ic.targetRisk}
                                                                </p>
                                                                <p className="text-gray-400">
                                                                    <span className="text-amber-400 font-medium">Why This Matters:</span> {ic.whyItExposesFraud}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
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
