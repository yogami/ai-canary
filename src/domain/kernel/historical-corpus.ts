export interface HistoricalCase {
    id: string;
    name: string;
    sector: string;
    pitch: string;
    expectedSolvent: boolean;
    knownContradiction: string;
}

export const HISTORICAL_CORPUS: HistoricalCase[] = [
    {
        id: 'case-1',
        name: 'Theranos',
        sector: 'healthcare',
        pitch: 'Miniaturized nanotainer runs 240 diagnostic blood tests from a single finger-stick.',
        expectedSolvent: false,
        knownContradiction: 'Capillary blood microfluidics physics and hemolysis contamination limits.'
    },
    {
        id: 'case-2',
        name: 'Nikola H2',
        sector: 'climate',
        pitch: 'Produces clean green hydrogen below $1.00/kg using 52 kWh/kg on commercial grid electricity.',
        expectedSolvent: false,
        knownContradiction: 'Electricity price alone exceeds target price before CapEx and dispensing.'
    },
    {
        id: 'case-3',
        name: 'Lilium Aviation',
        sector: 'aviation',
        pitch: 'High-density electric ducted fan jet achieves 300km inter-city passenger flights.',
        expectedSolvent: false,
        knownContradiction: 'Hover disc loading physics requires unsustainable battery pack energy density.'
    },
    {
        id: 'case-4',
        name: 'Solyndra',
        sector: 'climate',
        pitch: 'Cylindrical CIGS thin-film solar tubes eliminate expensive tracker mounts and polysilicon.',
        expectedSolvent: false,
        knownContradiction: 'Crystalline silicon cost curve dropped 90%, destroying tube CapEx advantage.'
    },
    {
        id: 'case-5',
        name: 'First Solar CdTe',
        sector: 'climate',
        pitch: 'Cadmium telluride thin-film utility PV achieves $0.28/watt manufacturing cost through high-speed continuous deposition.',
        expectedSolvent: true,
        knownContradiction: 'None. Commercial utility scale CdTe manufacturing achieved lowest levelized cost.'
    },
    {
        id: 'case-6',
        name: 'Form Energy',
        sector: 'climate',
        pitch: 'Reversible multi-day iron-air battery storage provides 100-hour discharge at $20/kWh module cost.',
        expectedSolvent: true,
        knownContradiction: 'None. Iron oxidation thermodynamics and abundant raw material costs pass levelized storage gates.'
    },
    {
        id: 'case-7',
        name: 'Climeworks',
        sector: 'climate',
        pitch: 'Direct air capture plant using solid amine collectors powered by geothermal electricity and waste heat at 1.8 GJ/ton thermal equivalent.',
        expectedSolvent: true,
        knownContradiction: 'None. Direct geothermal coupling satisfies minimum thermal desorption energy bounds.'
    },
    {
        id: 'case-8',
        name: 'Enphase Energy',
        sector: 'climate',
        pitch: 'Distributed microinverters per solar module with 97% CEC efficiency and 25-year reliability warranty.',
        expectedSolvent: true,
        knownContradiction: 'None. Distributed AC conversion economics verified with positive gross margins above 40%.'
    },
    {
        id: 'case-9',
        name: 'Boston Metal',
        sector: 'climate',
        pitch: 'Molten oxide electrolysis decarbonizes steel manufacturing using inert anodes with zero direct Scope 1 CO2 emissions.',
        expectedSolvent: true,
        knownContradiction: 'None. High-temperature electrolytic iron reduction passes chemical thermodynamic energy conservation.'
    },
    {
        id: 'case-10',
        name: 'SpecGuard AI',
        sector: 'ai',
        pitch: 'Bounded 3-turn formal verification harness for LLM code generation costing $0.003 token budget per run with 78% contribution margin.',
        expectedSolvent: true,
        knownContradiction: 'None. Bounded execution loops and verified software gross margins pass causal pre-flight gate.'
    },
    {
        id: 'case-11',
        name: 'Scale AI',
        sector: 'ai',
        pitch: 'Human-in-the-loop expert annotation pipeline for frontier LLM alignment with 65% gross margin.',
        expectedSolvent: true,
        knownContradiction: 'None. Unit economics supported by variable contractor network and high enterprise willingness to pay.'
    },
    {
        id: 'case-12',
        name: 'Datadog',
        sector: 'ai',
        pitch: 'Unified cloud infrastructure monitoring agent with 80% SaaS gross margin and 130% net dollar retention.',
        expectedSolvent: true,
        knownContradiction: 'None. Verified unit margins and negative net churn pass financial solvency gates.'
    },
    {
        id: 'case-13',
        name: 'Enterprise B2B SaaS',
        sector: 'ai',
        pitch: 'Automated accounts payable reconciliation SaaS with 78% gross margin and 110% net retention.',
        expectedSolvent: true,
        knownContradiction: 'None. Unit economics and churn margins pass deterministic gates.'
    },
    {
        id: 'case-14',
        name: 'GitGuardian',
        sector: 'ai',
        pitch: 'Automated code secrets detection agent scanning public GitHub commits with 82% SaaS subscription gross margin.',
        expectedSolvent: true,
        knownContradiction: 'None. Static analysis rules execute deterministically with minimal compute overhead.'
    },
    {
        id: 'case-15',
        name: 'Better Place',
        sector: 'climate',
        pitch: 'Global battery-swapping station network claiming rapid EV switching with standardized robotic replacement bays.',
        expectedSolvent: false,
        knownContradiction: 'Station CapEx of $2M per bay with zero pack standardization created unsustainable capital lock-in.'
    },
    {
        id: 'case-16',
        name: 'Fisker Automotive',
        sector: 'climate',
        pitch: 'Asset-light electric vehicle contract manufacturing delivering luxury SUVs at positive gross margin on day one.',
        expectedSolvent: false,
        knownContradiction: 'Contract manufacturing assembly penalties and software integration failure caused negative gross margin.'
    },
    {
        id: 'case-17',
        name: 'Proterra',
        sector: 'climate',
        pitch: 'Custom heavy-duty electric transit buses with bespoke battery packs under fixed-price municipal contracts.',
        expectedSolvent: false,
        knownContradiction: 'Bespoke vehicle chassis engineering caused negative gross margins under fixed-price municipal inflation.'
    },
    {
        id: 'case-18',
        name: 'Aquion Energy',
        sector: 'climate',
        pitch: 'Aqueous hybrid ion sodium-water batteries claiming grid-scale storage below $100/kWh without commercial cell yields.',
        expectedSolvent: false,
        knownContradiction: 'Low energy density and high automated cell manufacturing defect rates prevented commercial cost targets.'
    },
    {
        id: 'case-19',
        name: 'KiOR',
        sector: 'climate',
        pitch: 'Fluid catalytic cracking turns wood biomass into drop-in cellulosic gasoline at $1.80/gallon.',
        expectedSolvent: false,
        knownContradiction: 'Catalyst deactivation and carbon-to-liquid yield limits in biomass pyrolysis violated stoichiometry.'
    },
    {
        id: 'case-20',
        name: 'Range Fuels',
        sector: 'climate',
        pitch: 'Two-step thermochemical gasification converts unmerchantable wood timber into cellulosic ethanol with zero enzymes.',
        expectedSolvent: false,
        knownContradiction: 'Syngas tar formation clogged catalytic synthesis reactors, causing catastrophic yield collapse.'
    },
    {
        id: 'case-21',
        name: 'A123 Systems',
        sector: 'climate',
        pitch: 'Nanophosphate lithium iron phosphate cells deliver 10x cycle life for automotive passenger EVs with battery recall.',
        expectedSolvent: false,
        knownContradiction: 'Livonia manufacturing defect recall costs and sub-scale plant utilization drove working capital insolvency.'
    },
    {
        id: 'case-22',
        name: 'SunHydrogen AEM',
        sector: 'climate',
        pitch: 'Produces direct solar hydrogen at under $1.50/kg using 18 kWh/kg synthetic photoelectrochemical arrays.',
        expectedSolvent: false,
        knownContradiction: 'Thermodynamic lower bound violation: water electrolysis requires at least 39.4 kWh/kg.'
    },
    {
        id: 'case-23',
        name: 'CognitiveOps AI',
        sector: 'ai',
        pitch: 'Autonomous IT support agent claiming 100% bug-free incident resolution and zero hallucination for $20/month per seat.',
        expectedSolvent: false,
        knownContradiction: 'Stochastic models exhibit non-zero failure rates and unbounded multi-turn inference cost exceeds $20 revenue.'
    },
    {
        id: 'case-24',
        name: 'HyperSolar PV',
        sector: 'climate',
        pitch: 'Single-junction silicon PV module achieving 42.0% solar conversion efficiency at $0.12 per watt.',
        expectedSolvent: false,
        knownContradiction: 'Shockley-Queisser physical limit violation: single-junction bandgap efficiency ceiling is 33.7%.'
    },
    {
        id: 'case-25',
        name: 'AetherFlux DAC',
        sector: 'climate',
        pitch: 'Direct air capture module claiming $25/ton CO2 removal using only 0.2 GJ/ton ambient moisture desorption energy.',
        expectedSolvent: false,
        knownContradiction: 'Desorption energy lower bound violation: direct air capture MOF sorbents require at least 1.2 GJ/ton.'
    }
];
