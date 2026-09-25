import { StructuralCausalModel } from '../../domain/kernel/admission-types';

export interface CausalPreFlightResult {
    isAdmitted: boolean;
    violations: string[];
    calculatedMargin: number;
    breakEvenThreshold?: string;
}

export interface SensitivityPoint {
    parameterValue: number;
    grossMargin: number;
    isSolvent: boolean;
}

export class CausalPreFlightGate {
    public buildDomainSCM(sector: string): StructuralCausalModel {
        if (sector === 'climate' || sector === 'energy') {
            return this.buildClimateSCM();
        }
        return this.buildAISCM();
    }

    public preFlightCheck(
        scm: StructuralCausalModel,
        inputs: Record<string, number>
    ): CausalPreFlightResult {
        if (scm.id === 'scm-climate-energy') {
            return this.evaluateClimateSCM(inputs);
        }
        return this.evaluateAISCM(inputs);
    }

    public runSensitivitySweep(
        parameter: string,
        values: number[],
        baselineInputs: Record<string, number>
    ): SensitivityPoint[] {
        const results: SensitivityPoint[] = [];

        for (const val of values) {
            const currentInputs = { ...baselineInputs, [parameter]: val };
            const margin = this.calculateClimateMargin(currentInputs);
            results.push({
                parameterValue: val,
                grossMargin: Math.round(margin * 100) / 100,
                isSolvent: margin > 0
            });
        }

        return results;
    }

    private buildClimateSCM(): StructuralCausalModel {
        return {
            id: 'scm-climate-energy',
            name: 'Energy Conversion & Levelized Cost SCM',
            nodes: [
                { id: 'electricity_price', label: 'Electricity Price (€/MWh)', nodeType: 'exogenous' },
                { id: 'stack_efficiency', label: 'Stack Consumption (kWh/kg)', nodeType: 'mechanism' },
                { id: 'levelized_cost', label: 'Levelized Cost (€/kg)', nodeType: 'endogenous' },
                { id: 'market_offtake_price', label: 'Off-take Contract (€/kg)', nodeType: 'exogenous' },
                { id: 'gross_margin', label: 'Gross Operating Margin (€/kg)', nodeType: 'endogenous' }
            ],
            edges: [
                { from: 'electricity_price', to: 'levelized_cost', formula: 'E_cost = (P_MWh / 1000) * kWh_kg' },
                { from: 'stack_efficiency', to: 'levelized_cost', formula: 'Multiplier' },
                { from: 'levelized_cost', to: 'gross_margin', formula: 'Margin = P_offtake - Levelized_cost' },
                { from: 'market_offtake_price', to: 'gross_margin', formula: 'Revenue component' }
            ]
        };
    }

    private buildAISCM(): StructuralCausalModel {
        return {
            id: 'scm-ai-saas',
            name: 'Inference Loop Unit Economics SCM',
            nodes: [
                { id: 'token_inference_cost', label: 'Inference Token Cost ($/1k)', nodeType: 'exogenous' },
                { id: 'agent_loop_iterations', label: 'Reasoning Loop Turns', nodeType: 'mechanism' },
                { id: 'cost_per_task', label: 'Total Task Execution Cost ($)', nodeType: 'endogenous' },
                { id: 'subscription_price_per_task', label: 'Revenue Realized ($/task)', nodeType: 'exogenous' },
                { id: 'gross_margin', label: 'Unit Contribution Margin ($)', nodeType: 'endogenous' }
            ],
            edges: [
                { from: 'token_inference_cost', to: 'cost_per_task', formula: 'Cost = tokens * rate' },
                { from: 'agent_loop_iterations', to: 'cost_per_task', formula: 'Loop multiplier' },
                { from: 'cost_per_task', to: 'gross_margin', formula: 'Margin = Rev - Cost' }
            ]
        };
    }

    private evaluateClimateSCM(inputs: Record<string, number>): CausalPreFlightResult {
        const margin = this.calculateClimateMargin(inputs);
        const violations: string[] = [];

        if (margin <= 0) {
            violations.push(
                `Negative contribution margin (€${margin.toFixed(2)}/kg). Variable power cost exceeds offtake price.`
            );
        }

        const eff = inputs.stack_efficiency || 50;
        const breakEvenPrice = eff > 0 ? ((inputs.market_offtake_price || 2.0) / eff) * 1000 : 0;

        return {
            isAdmitted: violations.length === 0,
            violations,
            calculatedMargin: Math.round(margin * 100) / 100,
            breakEvenThreshold: `Electricity price must stay below €${breakEvenPrice.toFixed(1)}/MWh for solvency.`
        };
    }

    private evaluateAISCM(inputs: Record<string, number>): CausalPreFlightResult {
        const tokenRate = inputs.token_inference_cost || 0.002;
        const turns = inputs.agent_loop_iterations || 10;
        const estTokensPerTurn = 1500;
        const totalTokens = (turns * estTokensPerTurn) / 1000;
        const computeCost = totalTokens * tokenRate;
        const rev = inputs.subscription_price_per_task || 0.10;
        const margin = rev - computeCost;
        const violations: string[] = [];

        if (margin <= 0) {
            violations.push(
                `Inference loop token burn ($${computeCost.toFixed(3)}) exceeds task revenue ($${rev.toFixed(2)}).`
            );
        }

        return {
            isAdmitted: violations.length === 0,
            violations,
            calculatedMargin: Math.round(margin * 100) / 100,
            breakEvenThreshold: `Token rate must remain under $${((rev / totalTokens)).toFixed(4)}/1k tokens.`
        };
    }

    private calculateClimateMargin(inputs: Record<string, number>): number {
        const pMwh = inputs.electricity_price || 50;
        const kwhPerKg = inputs.stack_efficiency || 50;
        const offtake = inputs.market_offtake_price || 3.0;

        const powerCostPerKg = (pMwh / 1000) * kwhPerKg;
        const capexAndOpexBuffer = 0.80; // €0.80/kg balance of plant and water treatment
        const totalCost = powerCostPerKg + capexAndOpexBuffer;

        return offtake - totalCost;
    }
}
