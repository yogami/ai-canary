import { BenchmarkScenario } from './types';

export const BENCHMARK_SCENARIOS: BenchmarkScenario[] = [
    {
        id: 'caseNikola',
        title: '⚡ Case A: Nikola H₂',
        tag: 'Adjudicated False Positive',
        tagColor: 'text-amber-300 bg-amber-500/20 border-amber-500/40',
        sector: 'CleanTech / Hydrogen Freight',
        summary: 'Claims sub-$1.00/kg clean H₂ production. Omits commercial grid power tariffs, BoP, storage, and dispensing ($125M SEC settlement).',
        niche: 'climate',
        contextFields: {
            sector: 'Heavy Freight & Hydrogen Infrastructure',
            region: 'North America & Europe',
            impactMetric: 'Zero emission long-haul freight',
            targetAudience: 'Fleet operators, station partners, freight logistics'
        },
        description: `Project Nikola: Commercial Fuel-Cell Heavy Freight & Sub-$1/kg Hydrogen Supply

The Problem:
Diesel heavy freight accounts for disproportionate road emissions. Battery electric semi-trucks carry severe battery weight penalties that reduce freight payload capacity by 5,000+ kg.

Claimed Solution:
Nikola produces and dispenses zero-emission hydrogen fuel at commercial stations below $1.00/kg, guaranteeing total cost of ownership parity with diesel for long-haul fleet customers.

Core Pitch Assertions:
- Hydrogen Production Cost: Delivers clean hydrogen at under $1.00/kg wellhead production cost using dedicated direct solar PV arrays and proprietary alkaline electrolyzers.
- Efficiency & Electricity Feed: Direct-coupled solar feed produces continuous hydrogen with zero intermediate conversion loss or grid demand charges.
- Fueling Economics: Bundled truck lease includes all hydrogen dispensing at customer fleet depots without additional fuel surcharges.
- Proprietary Hardware: Custom-engineered in-house electrolyzer cells, fuel cell power electronics, and inverter units.`
    },
    {
        id: 'caseFirstSolar',
        title: '☀️ Case B: First Solar CdTe',
        tag: 'Adjudicated Moat / False Negative',
        tagColor: 'text-blue-300 bg-blue-500/20 border-blue-500/40',
        sector: 'Solar PV Manufacturing',
        summary: '9% module efficiency vs 14% silicon incumbent. Raw models reject on headline efficiency; harness catches 6x manufacturing throughput and lower cost/watt (2006 S-1 / NREL).',
        niche: 'climate',
        contextFields: {
            sector: 'Utility-Scale Solar Manufacturing',
            region: 'Global & North America',
            impactMetric: 'Gigawatt-scale clean electricity',
            targetAudience: 'Utility developers, independent power producers, EPC contractors'
        },
        description: `First Solar: Cadmium Telluride (CdTe) Thin-Film Photovoltaic Module Manufacturing

The Problem:
Standard crystalline silicon solar panels require high-purity polysilicon wafers, ingot slicing, and high-temperature batch furnaces. Polysilicon shortages and high CapEx keep installed solar costs above $4.00/watt.

Claimed Solution:
First Solar manufactures thin-film solar modules using continuous high-rate Vapor Transport Deposition (VTD) of semiconductor compounds directly onto glass sheets.

Core Pitch Assertions:
- Headline Module Efficiency: 9.0% conversion efficiency at commercial scale (compared to 14.0-16.0% for incumbent crystalline silicon).
- Semiconductor Material Consumption: Consumes less than 2% of the semiconductor material required by standard crystalline silicon wafers.
- Manufacturing Velocity: Continuous automated inline cycle time under 2.5 hours from raw glass to completed, tested solar module.
- Levelized Manufacturing Cost: Production cost below $1.40/watt with a defined roadmap to break $1.00/watt, creating the lowest installed cost per watt in utility-scale ground mount installations.`
    },
    {
        id: 'caseSolyndra',
        title: '🌀 Case C: Solyndra CIGS',
        tag: 'Regime Shift Shock Test',
        tagColor: 'text-purple-300 bg-purple-500/20 border-purple-500/40',
        sector: 'Commercial Solar Systems',
        summary: 'Cylindrical CIGS thin-film solar tubes. Differentiated engineering, but economic margin collapses when polysilicon crashes below $80/kg (CRS / DOE).',
        niche: 'climate',
        contextFields: {
            sector: 'Commercial Rooftop Solar',
            region: 'North America & Europe',
            impactMetric: 'Distributed clean power generation',
            targetAudience: 'Commercial building owners, industrial warehouse roofs'
        },
        description: `Solyndra: Cylindrical CIGS Thin-Film Photovoltaic Systems for Commercial Rooftops

The Problem:
Commercial flat roofs cannot support the heavy ballast and mounting racks required for traditional flat silicon panels without expensive roof structural reinforcement. Incumbent polysilicon costs over $300/kg.

Claimed Solution:
Solyndra manufactures arrays of cylindrical copper-indium-gallium-diselenide (CIGS) glass tubes that capture direct, diffuse, and reflected rooftop sunlight across a 360-degree surface.

Core Pitch Assertions:
- Zero Mounting Racks: Cylindrical geometry allows wind to blow through the panels without lifting, eliminating heavy concrete ballast and roof penetrations.
- 360-Degree Optical Capture: Collects 20% more kilowatt-hours per installed watt on white reflective commercial roofs compared to stationary flat panels.
- Installation Speed: Modular interlocking mounts allow installation in one-third the labor hours of conventional flat silicon racks.
- Economic Linchpin: Bypasses expensive polysilicon wafer supply chains, yielding an insurmountable cost advantage over crystalline silicon panels.`
    },
    {
        id: 'caseSunHydrogen',
        title: '🔬 Case D: SunHydrogen AEM',
        tag: 'Live Climate Diligence',
        tagColor: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40',
        sector: 'CleanTech / Green H₂',
        summary: 'Claims €1.80/kg green H₂ at 78% HHV efficiency. Tests whether quarantine catches unverified grid power cost assumptions.',
        niche: 'climate',
        contextFields: {
            sector: 'Energy & Heavy Industry',
            region: 'Europe',
            impactMetric: '120,000 t CO2/yr avoided',
            targetAudience: 'Steelmakers, chemical plants, off-grid power developers'
        },
        description: `Project SunHydrogen: High-Efficiency AEM Electrolyzer

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
- Direct solar PV coupling without intermediate battery buffering.`
    },
    {
        id: 'caseKernelGuard',
        title: '🤖 Case E: KernelGuard Harness',
        tag: 'Deterministic AI Systems',
        tagColor: 'text-cyan-300 bg-cyan-500/20 border-cyan-500/40',
        sector: 'Deterministic Execution',
        summary: 'Tri-state operational machine, contradiction quarantine, and causal policy budgeting.',
        niche: 'ai',
        contextFields: {
            appUrl: 'https://agent-trust-protocol-production.up.railway.app',
            githubUrl: 'https://github.com/yogami/agent-kernel',
            targetAudience: 'Autonomous agent engineers, enterprise AI compliance teams',
            competitors: 'LangChain, AutoGen, CrewAI'
        },
        description: `KernelGuard: Deterministic Agent Trust & Truth Quarantine Harness

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
- Verifiable cryptographic audit trail for enterprise regulatory compliance and security reviews.`
    }
];
