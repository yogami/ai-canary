export interface Story {
    id: string;
    headline: string;
    summary?: string;
    sentiment?: string;
    sentimentScore?: number;
    coverage?: number;
}

export interface ValidatorPanelProps {
    stories: Story[];
    onFilter: (keywords: string[]) => void;
}

export interface ProducerEvaluation {
    name: string;
    role: string;
    score: number;
    strengths: string[];
    concerns: string[];
    whatWouldMakeThemSayYes: string;
    relevantStories: number[];
}

export interface CanaryScore {
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

export interface SwotAnalysis {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
}

export interface BrutalRealityCheck {
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

export interface VerifiedClaim {
    claim: string;
    basis: string;
    status: 'VERIFIED' | 'PLAUSIBLE';
}

export interface QuarantinedAssertion {
    assertion: string;
    contradiction: string;
    severity: 'CRITICAL' | 'WARNING';
}

export interface StressScenario {
    parameter: string;
    shift: string;
    impact: string;
}

export interface CausalSensitivity {
    criticalAssumption?: string;
    stressScenarios?: StressScenario[];
    breakEvenThreshold?: string;
}

export interface ICPunchListItem {
    question: string;
    targetRisk: string;
    whyItExposesFraud: string;
}

export interface AgenticDiligence {
    quarantine?: {
        verifiedClaims?: VerifiedClaim[];
        quarantinedAssertions?: QuarantinedAssertion[];
    };
    causalSensitivity?: CausalSensitivity;
    icPunchList?: ICPunchListItem[];
}

export interface AnalysisResult {
    threats: Array<{ storyIndex: number; reason: string; story?: Story }>;
    opportunities: Array<{ storyIndex: number; reason: string; story?: Story }>;
    marketGaps: string[];
    timing: 'good' | 'neutral' | 'risky';
    timingReason: string;
    recommendation: string;
    canaryScore?: CanaryScore;
    swotAnalysis?: SwotAnalysis;
    agenticDiligence?: AgenticDiligence;
    producerPanel?: ProducerEvaluation[];
    consensusScore?: number;
    brutalRealityCheck?: BrutalRealityCheck;
    regimes?: Record<number, any>;
}

export type Niche = 'ai' | 'media' | 'music' | 'gaming' | 'fintech' | 'healthcare' | 'climate';

export interface NicheField {
    key: string;
    label: string;
    icon: string;
    placeholder: string;
    type: 'text' | 'url' | 'select';
    options?: string[];
}

export interface NicheConfig {
    id: Niche;
    label: string;
    icon: string;
    descriptionPlaceholder: string;
    fields: NicheField[];
}

export interface BenchmarkScenario {
    id: string;
    title: string;
    tag: string;
    tagColor: string;
    sector: string;
    summary: string;
    niche: Niche;
    contextFields: Record<string, string>;
    description: string;
}

export interface DeathWatchResult {
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

export interface AppAuditResult {
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

export interface EcosystemIntelResult {
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
