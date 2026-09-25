import { BenchmarkScenario } from './types';

export const NOVEL_STARTUPS: BenchmarkScenario[] = [
    {
        id: 'novelCognitiveOps',
        title: '🤖 Novel: CognitiveOps AI',
        tag: 'Autonomous AI Agent',
        tagColor: 'text-purple-300 bg-purple-500/20 border-purple-500/40',
        sector: 'Enterprise AI & DevOps',
        summary: 'Autonomous Tier-3 IT support agent claiming 100% bug-free incident resolution for $20/month.',
        niche: 'ai',
        contextFields: {
            sector: 'Enterprise AI Automation',
            pricing: '$20/month per seat',
            targetAudience: 'Enterprise DevOps and Site Reliability Engineering teams',
            metrics: 'Guarantees 100% autonomous resolution with zero human oversight'
        },
        description: `CognitiveOps: Autonomous Enterprise IT & SRE Incident Remediation Agent

The Problem:
Enterprise engineering teams spend 40% of their operational budget triage-resolving recurring production outages and infrastructure tickets.

Claimed Solution:
CognitiveOps deploys autonomous multi-turn agents that read production logs, write patches, and deploy fixes with zero human intervention.

Core Pitch Assertions:
- Flawless Accuracy: Guarantees 100% bug-free incident remediation and zero hallucination in critical production databases.
- Infinite Autonomy: Executes recursive multi-turn diagnostic reasoning loops over unlimited tool calls until the problem is solved.
- Aggressive Unit Economics: Replaces senior engineering headcount with a flat $20/month per-seat subscription.`
    },
    {
        id: 'novelAetherFlux',
        title: '🌱 Novel: AetherFlux DAC',
        tag: 'Direct Air Capture',
        tagColor: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40',
        sector: 'Carbon Removal & Climate',
        summary: 'Direct air carbon removal claiming $25/ton capture cost using ambient moisture and waste heat.',
        niche: 'climate',
        contextFields: {
            sector: 'Direct Air Capture (DAC)',
            claimedCost: '$25 per metric ton CO2',
            targetAudience: 'Corporate carbon offset buyers and compliance markets',
            energySource: 'Low-grade industrial waste heat'
        },
        description: `AetherFlux: Gigaton-Scale Direct Air Capture with Ambient Humidity Desorption

The Problem:
Incumbent direct air capture (DAC) systems require 1,500 to 2,500 kWh of thermal and electrical energy per ton of CO2, driving capture costs above $400/ton.

Claimed Solution:
AetherFlux synthesizes proprietary moisture-swing metal-organic frameworks (MOFs) that capture ambient atmospheric CO2 at 420 ppm and desorb concentrated CO2 using zero external electricity.

Core Pitch Assertions:
- Capture Unit Cost: Produces certified carbon removal credits at under $25.00/ton wellhead cost.
- Desorption Energy: Requires only 0.2 GJ of thermal energy per ton of captured CO2, operating entirely on ambient humidity cycles.
- Scale Velocity: Modular shipping container units capture 10,000 tons per year with standard commercial off-the-shelf fans.`
    },
    {
        id: 'novelHyperSolar',
        title: '⚡ Novel: HyperSolar Single-Junction',
        tag: 'Next-Gen Photovoltaics',
        tagColor: 'text-amber-300 bg-amber-500/20 border-amber-500/40',
        sector: 'Solar PV Tech',
        summary: 'Claims 42% module efficiency on a single-junction silicon-based absorber cell.',
        niche: 'climate',
        contextFields: {
            sector: 'Solar PV Manufacturing',
            efficiency: '42.0% single-junction conversion',
            targetAudience: 'Utility developers and rooftop solar installers',
            cost: '$0.12 per watt'
        },
        description: `HyperSolar: Ultra-High Efficiency Single-Junction Photovoltaic Cells

The Problem:
Commercial solar panels are limited by silicon wafer manufacturing costs and module efficiencies plateauing around 22-24%.

Claimed Solution:
HyperSolar uses quantum-tuned surface nanostructures to capture the full solar spectrum on a single p-n junction wafer.

Core Pitch Assertions:
- World-Record Efficiency: Achieves 42.0% single-junction solar conversion efficiency in standard commercial mass production.
- Sub-Incumbent Cost: Delivers completed modules at $0.12/watt, halving the levelized cost of solar electricity.
- Zero Degradation: Maintains 100% rated power output over a 30-year operational warranty lifetime.`
    },
    {
        id: 'novelSpecGuard',
        title: '🛡️ Novel: SpecGuard Verification',
        tag: 'Formal AI Verification',
        tagColor: 'text-blue-300 bg-blue-500/20 border-blue-500/40',
        sector: 'AI Verification & Safety',
        summary: 'Formal verification harness for LLM-generated code with deterministic boundaries and $0.003/task token budget.',
        niche: 'ai',
        contextFields: {
            sector: 'Enterprise AI Governance',
            pricing: '$0.15 per verified compilation',
            targetAudience: 'Regulated enterprise fintech and healthcare software developers',
            metrics: 'Bounded 3-turn verification loop with human supervisor fallback'
        },
        description: `SpecGuard: Formal Verification & Bounded Execution Gate for AI Code Generation

The Problem:
Developers lose 30% of their time reviewing AI-generated code because LLMs produce subtle security vulnerabilities and logical edge-case bugs.

Claimed Solution:
SpecGuard sits between code generation models and pull requests, running formal symbolic execution and deterministic type checking before code admission.

Core Pitch Assertions:
- Bounded Execution: Constrains reasoning to a maximum 3-turn verification trajectory, bounding compute token cost to $0.003 per run.
- Provable Safety: Generates mathematical proofs for memory safety and concurrency invariants rather than relying on statistical LLM confidence.
- Viable Contribution Margin: Charges $0.15 per compilation run, yielding a 78% unit gross contribution margin over underlying token costs.`
    },
    {
        id: 'novelNanoCredit',
        title: '💳 Novel: NanoCredit Algorithmic',
        tag: 'Algorithmic Lending',
        tagColor: 'text-indigo-300 bg-indigo-500/20 border-indigo-500/40',
        sector: 'Fintech & Lending',
        summary: 'Autonomous micro-lending algorithm claiming 0% default rate through proprietary social graph embeddings.',
        niche: 'fintech',
        contextFields: {
            sector: 'Automated Credit Underwriting',
            pricing: '2.5% transaction spread',
            targetAudience: 'Underbanked micro-entrepreneurs in emerging markets',
            defaultRate: '0.0% claimed historical default'
        },
        description: `NanoCredit: Zero-Default Algorithmic Micro-Lending Platform

The Problem:
Traditional credit scoring models require multi-year banking history, excluding millions of creditworthy micro-merchants from working capital.

Claimed Solution:
NanoCredit uses graph neural networks over phone usage and merchant social graphs to disburse instant working capital loans.

Core Pitch Assertions:
- Risk Elimination: Proprietary social graph collateral algorithm guarantees 0.0% credit default across all economic cycles.
- Instant Disbursement: Disburses loans in 3 seconds with automated smart contract escrow and recovery.
- Uncapped Margin: Earns 25% annualized APR with zero loan loss reserve provisions required on the balance sheet.`
    }
];
